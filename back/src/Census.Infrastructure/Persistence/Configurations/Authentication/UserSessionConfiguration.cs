using Census.Domain.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Census.Infrastructure.Persistence.Configurations.Authentication;

public sealed class UserSessionConfiguration
    : IEntityTypeConfiguration<UserSession>
{
    public void Configure(
        EntityTypeBuilder<UserSession> builder)
    {
        builder.ToTable("user_sessions");

        builder.HasKey(session => session.Id);

        builder.Property(session => session.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(session => session.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        builder.Property(session => session.TokenHash)
            .HasColumnName("token_hash")
            .HasMaxLength(64)
            .IsRequired();

        builder.Property(session => session.CreatedAtUtc)
            .HasColumnName("created_at_utc")
            .IsRequired();

        builder.Property(session => session.ExpiresAtUtc)
            .HasColumnName("expires_at_utc")
            .IsRequired();

        builder.Property(
                session => session.CreatedByIpAddress)
            .HasColumnName("created_by_ip_address")
            .HasMaxLength(64);

        builder.Property(session => session.UserAgent)
            .HasColumnName("user_agent")
            .HasMaxLength(500);

        builder.Property(session => session.DeviceName)
            .HasColumnName("device_name")
            .HasMaxLength(100);

        builder.Property(session => session.RevokedAtUtc)
            .HasColumnName("revoked_at_utc");

        builder.Property(
                session => session.RevokedByIpAddress)
            .HasColumnName("revoked_by_ip_address")
            .HasMaxLength(64);

        builder.Property(session => session.RevocationReason)
            .HasColumnName("revocation_reason")
            .HasMaxLength(200);

        builder.Property(
                session => session.ReplacedBySessionId)
            .HasColumnName("replaced_by_session_id");

        builder.Property(session => session.ConcurrencyToken)
            .HasColumnName("concurrency_token")
            .IsRequired()
            .IsConcurrencyToken();

        builder.HasOne(session => session.User)
            .WithMany()
            .HasForeignKey(session => session.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(session => session.ReplacedBySession)
            .WithMany()
            .HasForeignKey(
                session => session.ReplacedBySessionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(session => session.TokenHash)
            .IsUnique()
            .HasDatabaseName(
                "ux_user_sessions_token_hash");

        builder.HasIndex(session => session.UserId)
            .HasDatabaseName(
                "ix_user_sessions_user_id");

        builder.HasIndex(session => session.ExpiresAtUtc)
            .HasDatabaseName(
                "ix_user_sessions_expires_at");

        builder.HasIndex(
                session =>
                    new
                    {
                        session.UserId,
                        session.RevokedAtUtc
                    })
            .HasDatabaseName(
                "ix_user_sessions_user_revoked");

        builder.HasQueryFilter(
                session =>
                    session.User != null &&
                    !session.User.IsDeleted);
    }
}
