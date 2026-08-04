using System.ComponentModel.DataAnnotations;
using Census.Domain.Campaigns;

namespace Census.Api.Contracts.Campaigns;

public sealed class ChangeCensusCampaignStatusRequest
{
    [Required]
    [EnumDataType(typeof(CensusCampaignStatus))]
    public CensusCampaignStatus? Status { get; init; }
}
