using Census.Application.Common.Exceptions;
using Census.Application.Dashboard;
using Census.Domain.Campaigns;
using Census.Domain.Dwellings;
using Census.Domain.Households;
using Census.Domain.Persons;
using Census.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Census.Infrastructure.Dashboard;

public sealed class CensusDashboardQuery(
    CensusDbContext dbContext)
    : ICensusDashboardQuery
{
    public async Task<CensusDashboardDto> GetAsync(
        Guid campaignId,
        CancellationToken cancellationToken)
    {
        var campaign = await dbContext.Set<CensusCampaign>()
            .AsNoTracking()
            .FirstOrDefaultAsync(
                value => value.Id == campaignId,
                cancellationToken)
            ?? throw new EntityNotFoundException(
                $"La campagne '{campaignId}' est introuvable.");

        var dwellings = dbContext.Set<Dwelling>()
            .AsNoTracking()
            .Where(value => value.CampaignId == campaignId);

        var households = dbContext.Set<Household>()
            .AsNoTracking()
            .Where(value => value.CampaignId == campaignId);

        var persons = dbContext.Set<Person>()
            .AsNoTracking()
            .Where(value => value.CampaignId == campaignId);

        return new CensusDashboardDto(
            campaign.Id,
            campaign.Code,
            campaign.Name,
            campaign.Status.ToString(),
            await dwellings.CountAsync(cancellationToken),
            await dwellings.CountAsync(
                value => value.RecordStatus ==
                    DwellingRecordStatus.Draft,
                cancellationToken),
            await dwellings.CountAsync(
                value => value.RecordStatus ==
                    DwellingRecordStatus.Submitted,
                cancellationToken),
            await dwellings.CountAsync(
                value => value.RecordStatus ==
                    DwellingRecordStatus.Validated,
                cancellationToken),
            await dwellings.CountAsync(
                value => value.RecordStatus ==
                    DwellingRecordStatus.Rejected,
                cancellationToken),
            await households.CountAsync(cancellationToken),
            await households.CountAsync(
                value => value.RecordStatus ==
                    HouseholdRecordStatus.Draft,
                cancellationToken),
            await households.CountAsync(
                value => value.RecordStatus ==
                    HouseholdRecordStatus.Submitted,
                cancellationToken),
            await households.CountAsync(
                value => value.RecordStatus ==
                    HouseholdRecordStatus.Validated,
                cancellationToken),
            await households.CountAsync(
                value => value.RecordStatus ==
                    HouseholdRecordStatus.Rejected,
                cancellationToken),
            await persons.CountAsync(cancellationToken),
            await persons.CountAsync(
                value => value.RecordStatus ==
                    PersonRecordStatus.Draft,
                cancellationToken),
            await persons.CountAsync(
                value => value.RecordStatus ==
                    PersonRecordStatus.Submitted,
                cancellationToken),
            await persons.CountAsync(
                value => value.RecordStatus ==
                    PersonRecordStatus.Validated,
                cancellationToken),
            await persons.CountAsync(
                value => value.RecordStatus ==
                    PersonRecordStatus.Rejected,
                cancellationToken),
            await persons.CountAsync(
                value => value.Sex == PersonSex.Female,
                cancellationToken),
            await persons.CountAsync(
                value => value.Sex == PersonSex.Male,
                cancellationToken));
    }
}
