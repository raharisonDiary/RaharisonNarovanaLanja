using Census.Domain.Dwellings;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Census.Infrastructure.Persistence.Configurations.Dwellings;

public sealed class DwellingConfiguration
    : IEntityTypeConfiguration<Dwelling>
{
    public void Configure(
        EntityTypeBuilder<Dwelling> builder)
    {
        builder.ToTable("dwellings");

        builder.HasKey(dwelling => dwelling.Id);

        builder.Property(dwelling => dwelling.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(dwelling => dwelling.CampaignId)
            .HasColumnName("campaign_id")
            .IsRequired();

        builder.Property(
                dwelling => dwelling.EnumerationAreaId)
            .HasColumnName("enumeration_area_id")
            .IsRequired();

        builder.Property(dwelling => dwelling.ReferenceCode)
            .HasColumnName("reference_code")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(dwelling => dwelling.Address)
            .HasColumnName("address")
            .HasMaxLength(250);

        builder.Property(dwelling => dwelling.LocalityName)
            .HasColumnName("locality_name")
            .HasMaxLength(150);

        builder.Property(dwelling => dwelling.Latitude)
            .HasColumnName("latitude")
            .HasPrecision(9, 6)
            .IsRequired();

        builder.Property(dwelling => dwelling.Longitude)
            .HasColumnName("longitude")
            .HasPrecision(9, 6)
            .IsRequired();

        builder.Property(
                dwelling => dwelling.OccupancyStatus)
            .HasColumnName("occupancy_status")
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(
                dwelling => dwelling.RecordStatus)
            .HasColumnName("record_status")
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(dwelling => dwelling.Notes)
            .HasColumnName("notes")
            .HasMaxLength(1000);

        builder.Property(
                dwelling => dwelling.CreatedByUserId)
            .HasColumnName("created_by_user_id")
            .IsRequired();

        builder.Property(dwelling => dwelling.CreatedAtUtc)
            .HasColumnName("created_at_utc")
            .IsRequired();

        builder.Property(dwelling => dwelling.UpdatedAtUtc)
            .HasColumnName("updated_at_utc");

        builder.Property(dwelling => dwelling.IsDeleted)
            .HasColumnName("is_deleted")
            .IsRequired();

        builder.Property(dwelling => dwelling.DeletedAtUtc)
            .HasColumnName("deleted_at_utc");

        builder.HasOne(dwelling => dwelling.Campaign)
            .WithMany()
            .HasForeignKey(dwelling => dwelling.CampaignId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(
                dwelling => dwelling.EnumerationArea)
            .WithMany()
            .HasForeignKey(
                dwelling => dwelling.EnumerationAreaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(
                dwelling => dwelling.CreatedByUser)
            .WithMany()
            .HasForeignKey(
                dwelling => dwelling.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(
                dwelling =>
                    new
                    {
                        dwelling.CampaignId,
                        dwelling.ReferenceCode
                    })
            .IsUnique()
            .HasDatabaseName(
                "ux_dwellings_campaign_reference");

        builder.HasIndex(dwelling => dwelling.CampaignId)
            .HasDatabaseName("ix_dwellings_campaign_id");

        builder.HasIndex(
                dwelling => dwelling.EnumerationAreaId)
            .HasDatabaseName(
                "ix_dwellings_enumeration_area_id");

        builder.HasIndex(
                dwelling => dwelling.CreatedByUserId)
            .HasDatabaseName(
                "ix_dwellings_created_by_user_id");

        builder.HasIndex(
                dwelling => dwelling.RecordStatus)
            .HasDatabaseName(
                "ix_dwellings_record_status");

        builder.HasIndex(
                dwelling =>
                    new
                    {
                        dwelling.Latitude,
                        dwelling.Longitude
                    })
            .HasDatabaseName(
                "ix_dwellings_coordinates");

        builder.HasQueryFilter(
            dwelling => !dwelling.IsDeleted);
    }
}
