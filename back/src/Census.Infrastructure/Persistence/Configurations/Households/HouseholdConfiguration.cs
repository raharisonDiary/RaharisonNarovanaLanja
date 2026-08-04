using Census.Domain.Households;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Census.Infrastructure.Persistence.Configurations.Households;

public sealed class HouseholdConfiguration
    : IEntityTypeConfiguration<Household>
{
    public void Configure(
        EntityTypeBuilder<Household> builder)
    {
        builder.ToTable("households");

        builder.HasKey(household => household.Id);

        builder.Property(household => household.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(household => household.CampaignId)
            .HasColumnName("campaign_id")
            .IsRequired();

        builder.Property(household => household.DwellingId)
            .HasColumnName("dwelling_id")
            .IsRequired();

        builder.Property(household => household.ReferenceCode)
            .HasColumnName("reference_code")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(household => household.HouseholdType)
            .HasColumnName("household_type")
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(household => household.HeadFullName)
            .HasColumnName("head_full_name")
            .HasMaxLength(200);

        builder.Property(household => household.PhoneNumber)
            .HasColumnName("phone_number")
            .HasMaxLength(30);

        builder.Property(household => household.Notes)
            .HasColumnName("notes")
            .HasMaxLength(1000);

        builder.Property(household => household.RecordStatus)
            .HasColumnName("record_status")
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(
                household => household.CreatedByUserId)
            .HasColumnName("created_by_user_id")
            .IsRequired();

        builder.Property(household => household.CreatedAtUtc)
            .HasColumnName("created_at_utc")
            .IsRequired();

        builder.Property(household => household.UpdatedAtUtc)
            .HasColumnName("updated_at_utc");

        builder.Property(household => household.IsDeleted)
            .HasColumnName("is_deleted")
            .IsRequired();

        builder.Property(household => household.DeletedAtUtc)
            .HasColumnName("deleted_at_utc");

        builder.HasOne(household => household.Campaign)
            .WithMany()
            .HasForeignKey(household => household.CampaignId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(household => household.Dwelling)
            .WithMany()
            .HasForeignKey(household => household.DwellingId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(household => household.CreatedByUser)
            .WithMany()
            .HasForeignKey(
                household => household.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(
                household =>
                    new
                    {
                        household.CampaignId,
                        household.ReferenceCode
                    })
            .IsUnique()
            .HasDatabaseName(
                "ux_households_campaign_reference");

        builder.HasIndex(household => household.DwellingId)
            .HasDatabaseName("ix_households_dwelling_id");

        builder.HasIndex(household => household.RecordStatus)
            .HasDatabaseName(
                "ix_households_record_status");

        builder.HasIndex(
                household => household.CreatedByUserId)
            .HasDatabaseName(
                "ix_households_created_by_user_id");

        builder.HasQueryFilter(
            household => !household.IsDeleted);
    }
}
