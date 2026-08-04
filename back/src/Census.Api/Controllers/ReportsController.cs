using System.Globalization;
using System.Text;
using Census.Application.Authorization;
using Census.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Census.Api.Controllers;

[ApiController]
[Authorize(Policy = AuthorizationPolicies.AccessRegionalData)]
[Route("api/v1/reports")]
public sealed class ReportsController(
    CensusDbContext dbContext)
    : ControllerBase
{
    [HttpGet("campaigns/{campaignId:guid}/dwellings.csv")]
    public async Task<IActionResult> ExportDwellingsAsync(
        Guid campaignId,
        CancellationToken cancellationToken)
    {
        var entities = await dbContext.Dwellings
            .AsNoTracking()
            .Where(item => item.CampaignId == campaignId)
            .OrderBy(item => item.ReferenceCode)
            .ToListAsync(cancellationToken);

        var rows = entities
            .Select(item => new string?[]
            {
                item.ReferenceCode,
                item.Address,
                item.LocalityName,
                item.Latitude.ToString(CultureInfo.InvariantCulture),
                item.Longitude.ToString(CultureInfo.InvariantCulture),
                item.OccupancyStatus.ToString(),
                item.RecordStatus.ToString(),
                item.CreatedAtUtc.ToString("O")
            })
            .ToList();

        return Csv(
            $"habitations-{campaignId:N}.csv",
            ["reference", "adresse", "localite", "latitude", "longitude", "occupation", "statut", "cree_le"],
            rows);
    }

    [HttpGet("campaigns/{campaignId:guid}/households.csv")]
    public async Task<IActionResult> ExportHouseholdsAsync(
        Guid campaignId,
        CancellationToken cancellationToken)
    {
        var entities = await dbContext.Households
            .AsNoTracking()
            .Where(item => item.CampaignId == campaignId)
            .OrderBy(item => item.ReferenceCode)
            .ToListAsync(cancellationToken);

        var rows = entities
            .Select(item => new string?[]
            {
                item.ReferenceCode,
                item.HeadFullName,
                item.PhoneNumber,
                item.HouseholdType.ToString(),
                item.RecordStatus.ToString(),
                item.DwellingId.ToString(),
                item.CreatedAtUtc.ToString("O")
            })
            .ToList();

        return Csv(
            $"menages-{campaignId:N}.csv",
            ["reference", "chef_menage", "telephone", "type", "statut", "habitation_id", "cree_le"],
            rows);
    }

    [HttpGet("campaigns/{campaignId:guid}/persons.csv")]
    public async Task<IActionResult> ExportPersonsAsync(
        Guid campaignId,
        CancellationToken cancellationToken)
    {
        var entities = await dbContext.Persons
            .AsNoTracking()
            .Where(item => item.CampaignId == campaignId)
            .OrderBy(item => item.HouseholdId)
            .ThenBy(item => item.PersonNumber)
            .ToListAsync(cancellationToken);

        var rows = entities
            .Select(item => new string?[]
            {
                item.PersonNumber.ToString(),
                item.FirstName,
                item.LastName,
                item.Sex.ToString(),
                item.DateOfBirth.HasValue
                    ? item.DateOfBirth.Value.ToString("yyyy-MM-dd")
                    : null,
                item.AgeYears.HasValue
                    ? item.AgeYears.Value.ToString()
                    : null,
                item.RelationshipToHead.ToString(),
                item.MaritalStatus.ToString(),
                item.Nationality,
                item.Occupation,
                item.PhoneNumber,
                item.NationalId,
                item.RecordStatus.ToString(),
                item.HouseholdId.ToString()
            })
            .ToList();

        return Csv(
            $"personnes-{campaignId:N}.csv",
            ["numero", "prenom", "nom", "sexe", "date_naissance", "age", "lien_chef", "etat_matrimonial", "nationalite", "profession", "telephone", "nin", "statut", "menage_id"],
            rows);
    }

    private FileContentResult Csv(
        string fileName,
        IReadOnlyList<string> headers,
        IReadOnlyList<string?[]> rows)
    {
        var builder = new StringBuilder();
        builder.AppendLine(string.Join(';', headers.Select(Escape)));

        foreach (var row in rows)
        {
            builder.AppendLine(string.Join(';', row.Select(Escape)));
        }

        var preamble = Encoding.UTF8.GetPreamble();
        var content = Encoding.UTF8.GetBytes(builder.ToString());
        var bytes = new byte[preamble.Length + content.Length];
        Buffer.BlockCopy(preamble, 0, bytes, 0, preamble.Length);
        Buffer.BlockCopy(content, 0, bytes, preamble.Length, content.Length);

        return File(bytes, "text/csv; charset=utf-8", fileName);
    }

    private static string Escape(string? value)
    {
        var text = value ?? string.Empty;
        return $"\"{text.Replace("\"", "\"\"")}\"";
    }
}
