using Census.Domain.AdministrativeAreas;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Census.Infrastructure.Persistence.Configurations.AdministrativeAreas;

public sealed class AdministrativeAreaConfiguration
    : IEntityTypeConfiguration<AdministrativeArea>
{
    public void Configure(
        EntityTypeBuilder<AdministrativeArea> builder)
    {
        builder.ToTable("administrative_areas");

        builder.HasKey(area => area.Id);

        builder.Property(area => area.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(area => area.Code)
            .HasColumnName("code")
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(area => area.Name)
            .HasColumnName("name")
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(area => area.Type)
            .HasColumnName("type")
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(area => area.ParentId)
            .HasColumnName("parent_id");

        builder.Property(area => area.IsActive)
            .HasColumnName("is_active")
            .IsRequired();

        builder.Property(area => area.CreatedAtUtc)
            .HasColumnName("created_at_utc")
            .IsRequired();

        builder.Property(area => area.UpdatedAtUtc)
            .HasColumnName("updated_at_utc");

        builder.Property(area => area.IsDeleted)
            .HasColumnName("is_deleted")
            .IsRequired();

        builder.Property(area => area.DeletedAtUtc)
            .HasColumnName("deleted_at_utc");

        builder.HasOne(area => area.Parent)
            .WithMany(area => area.Children)
            .HasForeignKey(area => area.ParentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(area => new
            {
                area.Type,
                area.Code
            })
            .IsUnique()
            .HasDatabaseName(
                "ux_administrative_areas_type_code");

        builder.HasIndex(area => area.ParentId)
            .HasDatabaseName(
                "ix_administrative_areas_parent_id");

        builder.HasIndex(area => area.Name)
            .HasDatabaseName(
                "ix_administrative_areas_name");

        builder.HasQueryFilter(area => !area.IsDeleted);
    }
}
