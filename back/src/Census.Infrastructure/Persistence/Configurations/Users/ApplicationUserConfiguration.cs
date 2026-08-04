using Census.Domain.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Census.Infrastructure.Persistence.Configurations.Users;

public sealed class ApplicationUserConfiguration
    : IEntityTypeConfiguration<ApplicationUser>
{
    public void Configure(
        EntityTypeBuilder<ApplicationUser> builder)
    {
        builder.ToTable("users");

        builder.HasKey(user => user.Id);

        builder.Property(user => user.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(user => user.FirstName)
            .HasColumnName("first_name")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(user => user.LastName)
            .HasColumnName("last_name")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(user => user.Email)
            .HasColumnName("email")
            .HasMaxLength(254)
            .IsRequired();

        builder.Property(user => user.PhoneNumber)
            .HasColumnName("phone_number")
            .HasMaxLength(30);

        builder.Property(user => user.PasswordHash)
            .HasColumnName("password_hash")
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(user => user.Role)
            .HasColumnName("role")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(user => user.AdministrativeAreaId)
            .HasColumnName("administrative_area_id");

        builder.Property(user => user.IsActive)
            .HasColumnName("is_active")
            .IsRequired();

        builder.Property(user => user.LastLoginAtUtc)
            .HasColumnName("last_login_at_utc");

        builder.Property(user => user.PasswordRecoveryCodeHash)
            .HasColumnName("password_recovery_code_hash")
            .HasMaxLength(128);

        builder.Property(user => user.PasswordRecoveryCodeSalt)
            .HasColumnName("password_recovery_code_salt")
            .HasMaxLength(128);

        builder.Property(user => user.PasswordRecoveryCodeExpiresAtUtc)
            .HasColumnName("password_recovery_code_expires_at_utc");

        builder.Property(user => user.PasswordRecoveryAttemptCount)
            .HasColumnName("password_recovery_attempt_count")
            .IsRequired();

        builder.Property(user => user.PasswordRecoveryTokenHash)
            .HasColumnName("password_recovery_token_hash")
            .HasMaxLength(128);

        builder.Property(user => user.PasswordRecoveryTokenExpiresAtUtc)
            .HasColumnName("password_recovery_token_expires_at_utc");

        builder.Property(user => user.PasswordRecoveryVerifiedAtUtc)
            .HasColumnName("password_recovery_verified_at_utc");

        builder.Property(user => user.CreatedAtUtc)
            .HasColumnName("created_at_utc")
            .IsRequired();

        builder.Property(user => user.UpdatedAtUtc)
            .HasColumnName("updated_at_utc");

        builder.Property(user => user.IsDeleted)
            .HasColumnName("is_deleted")
            .IsRequired();

        builder.Property(user => user.DeletedAtUtc)
            .HasColumnName("deleted_at_utc");

        builder.Ignore(user => user.FullName);

        builder.HasOne(user => user.AdministrativeArea)
            .WithMany()
            .HasForeignKey(user => user.AdministrativeAreaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(user => user.Email)
            .IsUnique()
            .HasDatabaseName("ux_users_email");

        builder.HasIndex(user => user.Role)
            .HasDatabaseName("ix_users_role");

        builder.HasIndex(user => user.AdministrativeAreaId)
            .HasDatabaseName("ix_users_administrative_area_id");

        builder.HasIndex(user => user.IsActive)
            .HasDatabaseName("ix_users_is_active");

        builder.HasIndex(user => user.PasswordRecoveryCodeExpiresAtUtc)
            .HasDatabaseName("ix_users_password_recovery_code_expires_at_utc");

        builder.HasQueryFilter(user => !user.IsDeleted);
    }
}
