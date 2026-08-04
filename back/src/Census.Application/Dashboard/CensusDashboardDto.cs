namespace Census.Application.Dashboard;

public sealed record CensusDashboardDto(
    Guid CampaignId,
    string CampaignCode,
    string CampaignName,
    string CampaignStatus,
    int TotalDwellings,
    int DraftDwellings,
    int SubmittedDwellings,
    int ValidatedDwellings,
    int RejectedDwellings,
    int TotalHouseholds,
    int DraftHouseholds,
    int SubmittedHouseholds,
    int ValidatedHouseholds,
    int RejectedHouseholds,
    int TotalPersons,
    int DraftPersons,
    int SubmittedPersons,
    int ValidatedPersons,
    int RejectedPersons,
    int FemalePersons,
    int MalePersons);
