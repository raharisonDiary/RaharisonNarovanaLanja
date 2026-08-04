namespace Census.Application.Dashboard;

public interface ICensusDashboardQuery
{
    Task<CensusDashboardDto> GetAsync(
        Guid campaignId,
        CancellationToken cancellationToken);
}
