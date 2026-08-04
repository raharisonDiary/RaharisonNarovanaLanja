using Census.Domain.Campaigns;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Census.Infrastructure.Persistence.Configurations.Campaigns;

public sealed class CensusCampaignConfiguration
    : IEntityTypeConfiguration<CensusCampaign>
{
    public void Configure(
        EntityTypeBuilder<CensusCampaign> builder)
    {
        builder.ToTable("census_campaigns");

        builder.HasKey(campaign => campaign.Id);

        builder.Property(campaign => campaign.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(campaign => campaign.Code)
            .HasColumnName("code")
            .HasMaxLength(40)
            .IsRequired();

        builder.Property(campaign => campaign.Name)
            .HasColumnName("name")
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(campaign => campaign.Description)
            .HasColumnName("description")
            .HasMaxLength(1000);

        builder.Property(campaign => campaign.StartDate)
            .HasColumnName("start_date")
            .HasColumnType("date")
            .IsRequired();

        builder.Property(campaign => campaign.EndDate)
            .HasColumnName("end_date")
            .HasColumnType("date")
            .IsRequired();

        builder.Property(campaign => campaign.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(
                campaign =>
                    campaign.ScopeAdministrativeAreaId)
            .HasColumnName(
                "scope_administrative_area_id")
            .IsRequired();

        builder.Property(campaign => campaign.CreatedAtUtc)
            .HasColumnName("created_at_utc")
            .IsRequired();

        builder.Property(campaign => campaign.UpdatedAtUtc)
            .HasColumnName("updated_at_utc");

        builder.Property(campaign => campaign.IsDeleted)
            .HasColumnName("is_deleted")
            .IsRequired();

        builder.Property(campaign => campaign.DeletedAtUtc)
            .HasColumnName("deleted_at_utc");

        builder.HasOne(
                campaign =>
                    campaign.ScopeAdministrativeArea)
            .WithMany()
            .HasForeignKey(
                campaign =>
                    campaign.ScopeAdministrativeAreaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(campaign => campaign.Code)
            .IsUnique()
            .HasDatabaseName(
                "ux_census_campaigns_code");

        builder.HasIndex(campaign => campaign.Status)
            .HasDatabaseName(
                "ix_census_campaigns_status");

        builder.HasIndex(
                campaign =>
                    campaign.ScopeAdministrativeAreaId)
            .HasDatabaseName(
                "ix_census_campaigns_scope_area_id");

        builder.HasIndex(
                campaign =>
                    new
                    {
                        campaign.StartDate,
                        campaign.EndDate
                    })
            .HasDatabaseName(
                "ix_census_campaigns_dates");

        builder.HasQueryFilter(
            campaign => !campaign.IsDeleted);
    }
}
