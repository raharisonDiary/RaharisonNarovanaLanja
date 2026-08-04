using Census.Domain.Persons;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Census.Infrastructure.Persistence.Configurations.Persons;

public sealed class PersonConfiguration
    : IEntityTypeConfiguration<Person>
{
    public void Configure(
        EntityTypeBuilder<Person> builder)
    {
        builder.ToTable("persons");

        builder.HasKey(person => person.Id);

        builder.Property(person => person.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(person => person.CampaignId)
            .HasColumnName("campaign_id")
            .IsRequired();

        builder.Property(person => person.HouseholdId)
            .HasColumnName("household_id")
            .IsRequired();

        builder.Property(person => person.PersonNumber)
            .HasColumnName("person_number")
            .IsRequired();

        builder.Property(person => person.FirstName)
            .HasColumnName("first_name")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(person => person.LastName)
            .HasColumnName("last_name")
            .HasMaxLength(100)
            .IsRequired();

        builder.Ignore(person => person.FullName);

        builder.Property(person => person.Sex)
            .HasColumnName("sex")
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(person => person.DateOfBirth)
            .HasColumnName("date_of_birth")
            .HasColumnType("date");

        builder.Property(person => person.AgeYears)
            .HasColumnName("age_years");

        builder.Property(person => person.RelationshipToHead)
            .HasColumnName("relationship_to_head")
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(person => person.MaritalStatus)
            .HasColumnName("marital_status")
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(person => person.Nationality)
            .HasColumnName("nationality")
            .HasMaxLength(100);

        builder.Property(person => person.Occupation)
            .HasColumnName("occupation")
            .HasMaxLength(150);

        builder.Property(person => person.PhoneNumber)
            .HasColumnName("phone_number")
            .HasMaxLength(30);

        builder.Property(person => person.NationalId)
            .HasColumnName("national_id")
            .HasMaxLength(100);

        builder.Property(person => person.Notes)
            .HasColumnName("notes")
            .HasMaxLength(1000);

        builder.Property(person => person.RecordStatus)
            .HasColumnName("record_status")
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(person => person.CreatedByUserId)
            .HasColumnName("created_by_user_id")
            .IsRequired();

        builder.Property(person => person.CreatedAtUtc)
            .HasColumnName("created_at_utc")
            .IsRequired();

        builder.Property(person => person.UpdatedAtUtc)
            .HasColumnName("updated_at_utc");

        builder.Property(person => person.IsDeleted)
            .HasColumnName("is_deleted")
            .IsRequired();

        builder.Property(person => person.DeletedAtUtc)
            .HasColumnName("deleted_at_utc");

        builder.HasOne(person => person.Campaign)
            .WithMany()
            .HasForeignKey(person => person.CampaignId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(person => person.Household)
            .WithMany()
            .HasForeignKey(person => person.HouseholdId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(person => person.CreatedByUser)
            .WithMany()
            .HasForeignKey(person => person.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(
                person =>
                    new
                    {
                        person.HouseholdId,
                        person.PersonNumber
                    })
            .IsUnique()
            .HasDatabaseName(
                "ux_persons_household_number");

        builder.HasIndex(person => person.NationalId)
            .IsUnique()
            .HasFilter(
                "national_id IS NOT NULL AND is_deleted = false")
            .HasDatabaseName(
                "ux_persons_national_id_active");

        builder.HasIndex(person => person.CampaignId)
            .HasDatabaseName("ix_persons_campaign_id");

        builder.HasIndex(person => person.RecordStatus)
            .HasDatabaseName("ix_persons_record_status");

        builder.HasIndex(person => person.CreatedByUserId)
            .HasDatabaseName(
                "ix_persons_created_by_user_id");

        builder.HasQueryFilter(person => !person.IsDeleted);
    }
}
