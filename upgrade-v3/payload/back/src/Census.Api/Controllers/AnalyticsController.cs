using Census.Domain.AdministrativeAreas;
using Census.Domain.Dwellings;
using Census.Domain.Households;
using Census.Domain.Persons;
using Census.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Census.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/analytics")]
public sealed class AnalyticsController(CensusDbContext dbContext)
    : ControllerBase
{
    [HttpGet("campaigns/{campaignId:guid}")]
    public async Task<ActionResult<AnalyticsResponse>> GetAsync(
        Guid campaignId,
        [FromQuery] Guid? areaId,
        CancellationToken cancellationToken)
    {
        var campaign = await dbContext.CensusCampaigns
            .AsNoTracking()
            .SingleOrDefaultAsync(value => value.Id == campaignId, cancellationToken);
        if (campaign is null)
        {
            return NotFound();
        }

        var areas = await dbContext.AdministrativeAreas
            .AsNoTracking()
            .ToListAsync(cancellationToken);
        var selectedAreaId = areaId ?? campaign.ScopeAdministrativeAreaId;
        var selected = areas.SingleOrDefault(value => value.Id == selectedAreaId);
        if (selected is null)
        {
            return BadRequest("Le territoire sélectionné est introuvable.");
        }

        var descendants = GetDescendants(areas, selectedAreaId);
        var dwellingRows = await dbContext.Dwellings
            .AsNoTracking()
            .Where(value =>
                value.CampaignId == campaignId &&
                value.RecordStatus == DwellingRecordStatus.Validated &&
                descendants.Contains(value.EnumerationAreaId))
            .Select(value => new { value.Id, value.EnumerationAreaId })
            .ToListAsync(cancellationToken);
        var dwellingIds = dwellingRows.Select(value => value.Id).ToArray();

        var householdRows = await dbContext.Households
            .AsNoTracking()
            .Where(value =>
                value.CampaignId == campaignId &&
                value.RecordStatus == HouseholdRecordStatus.Validated &&
                dwellingIds.Contains(value.DwellingId))
            .Select(value => new { value.Id, value.DwellingId })
            .ToListAsync(cancellationToken);
        var householdIds = householdRows.Select(value => value.Id).ToArray();

        var personRows = await dbContext.Persons
            .AsNoTracking()
            .Where(value =>
                value.CampaignId == campaignId &&
                value.RecordStatus == PersonRecordStatus.Validated &&
                householdIds.Contains(value.HouseholdId))
            .Select(value => new
            {
                value.HouseholdId,
                value.Sex,
                value.AgeYears,
                value.DateOfBirth,
                value.Occupation
            })
            .ToListAsync(cancellationToken);

        var householdById = householdRows.ToDictionary(value => value.Id);
        var dwellingById = dwellingRows.ToDictionary(value => value.Id);
        var areaById = areas.ToDictionary(value => value.Id);
        var topCounts = new Dictionary<Guid, int>();
        foreach (var person in personRows)
        {
            var household = householdById[person.HouseholdId];
            var dwelling = dwellingById[household.DwellingId];
            var topChild = ResolveTopChild(
                dwelling.EnumerationAreaId,
                selectedAreaId,
                areaById);
            if (topChild.HasValue)
            {
                topCounts[topChild.Value] = topCounts.GetValueOrDefault(topChild.Value) + 1;
            }
        }

        var now = DateOnly.FromDateTime(DateTime.UtcNow);
        var ageValues = personRows.Select(value =>
                value.AgeYears ??
                (value.DateOfBirth.HasValue
                    ? CalculateAge(value.DateOfBirth.Value, now)
                    : (int?)null))
            .ToList();

        var top = topCounts
            .OrderByDescending(value => value.Value)
            .Take(5)
            .Select(value => new AreaRankingItem(
                value.Key,
                areaById[value.Key].Name,
                areaById[value.Key].Type.ToString(),
                value.Value))
            .ToList();

        return Ok(new AnalyticsResponse(
            campaign.Id,
            campaign.Name,
            selected.Id,
            selected.Name,
            selected.Type.ToString(),
            dwellingRows.Count,
            householdRows.Count,
            personRows.Count,
            personRows.Count(value => value.Sex == PersonSex.Female),
            personRows.Count(value => value.Sex == PersonSex.Male),
            ageValues.Count(value => value is >= 0 and <= 14),
            ageValues.Count(value => value is >= 15 and <= 34),
            ageValues.Count(value => value is >= 35 and <= 59),
            ageValues.Count(value => value >= 60),
            personRows.Count(value => IsStudent(value.Occupation)),
            top));
    }

    private static HashSet<Guid> GetDescendants(
        IReadOnlyList<AdministrativeArea> areas,
        Guid rootId)
    {
        var result = new HashSet<Guid> { rootId };
        var queue = new Queue<Guid>();
        queue.Enqueue(rootId);
        while (queue.Count > 0)
        {
            var current = queue.Dequeue();
            foreach (var child in areas.Where(value => value.ParentId == current))
            {
                if (result.Add(child.Id))
                {
                    queue.Enqueue(child.Id);
                }
            }
        }

        return result;
    }

    private static Guid? ResolveTopChild(
        Guid leafId,
        Guid selectedId,
        IReadOnlyDictionary<Guid, AdministrativeArea> areas)
    {
        var current = leafId;
        Guid? previous = null;
        for (var depth = 0; depth < 10; depth++)
        {
            if (current == selectedId)
            {
                return previous ?? current;
            }

            if (!areas.TryGetValue(current, out var area) || !area.ParentId.HasValue)
            {
                return null;
            }

            previous = current;
            current = area.ParentId.Value;
        }

        return null;
    }

    private static int CalculateAge(DateOnly birthDate, DateOnly today)
    {
        var age = today.Year - birthDate.Year;
        if (birthDate > today.AddYears(-age))
        {
            age--;
        }
        return age;
    }

    private static bool IsStudent(string? occupation)
    {
        if (string.IsNullOrWhiteSpace(occupation))
        {
            return false;
        }

        var value = occupation.ToLowerInvariant();
        return value.Contains("étudiant") ||
               value.Contains("etudiant") ||
               value.Contains("élève") ||
               value.Contains("eleve") ||
               value.Contains("mpianatra") ||
               value.Contains("student");
    }

    public sealed record AnalyticsResponse(
        Guid CampaignId,
        string CampaignName,
        Guid AreaId,
        string AreaName,
        string AreaType,
        int TotalDwellings,
        int TotalHouseholds,
        int TotalCitizens,
        int FemaleCitizens,
        int MaleCitizens,
        int Children,
        int Youth,
        int Adults,
        int Seniors,
        int Students,
        IReadOnlyList<AreaRankingItem> TopAreas);

    public sealed record AreaRankingItem(
        Guid AreaId,
        string AreaName,
        string AreaType,
        int Citizens);
}
