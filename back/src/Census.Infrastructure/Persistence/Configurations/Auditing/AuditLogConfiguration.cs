using Census.Domain.Auditing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Census.Infrastructure.Persistence.Configurations.Auditing;

public sealed class AuditLogConfiguration
    : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(
        EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("audit_logs");

        builder.HasKey(log => log.Id);

        builder.Property(log => log.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(log => log.OccurredAtUtc)
            .HasColumnName("occurred_at_utc")
            .IsRequired();

        builder.Property(log => log.ActorUserId)
            .HasColumnName("actor_user_id");

        builder.Property(log => log.ActorEmail)
            .HasColumnName("actor_email")
            .HasMaxLength(254);

        builder.Property(log => log.ActorRole)
            .HasColumnName("actor_role")
            .HasMaxLength(100);

        builder.Property(log => log.HttpMethod)
            .HasColumnName("http_method")
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(log => log.RequestPath)
            .HasColumnName("request_path")
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(log => log.ActionName)
            .HasColumnName("action_name")
            .HasMaxLength(250)
            .IsRequired();

        builder.Property(log => log.EntityType)
            .HasColumnName("entity_type")
            .HasMaxLength(100);

        builder.Property(log => log.EntityId)
            .HasColumnName("entity_id")
            .HasMaxLength(100);

        builder.Property(log => log.StatusCode)
            .HasColumnName("status_code")
            .IsRequired();

        builder.Property(log => log.WasSuccessful)
            .HasColumnName("was_successful")
            .IsRequired();

        builder.Property(log => log.IpAddress)
            .HasColumnName("ip_address")
            .HasMaxLength(64);

        builder.Property(log => log.UserAgent)
            .HasColumnName("user_agent")
            .HasMaxLength(500);

        builder.Property(log => log.TraceId)
            .HasColumnName("trace_id")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(log => log.FailureType)
            .HasColumnName("failure_type")
            .HasMaxLength(200);

        builder.HasIndex(log => log.OccurredAtUtc)
            .HasDatabaseName(
                "ix_audit_logs_occurred_at_utc");

        builder.HasIndex(log => log.ActorUserId)
            .HasDatabaseName(
                "ix_audit_logs_actor_user_id");

        builder.HasIndex(log => log.ActionName)
            .HasDatabaseName(
                "ix_audit_logs_action_name");

        builder.HasIndex(log => log.StatusCode)
            .HasDatabaseName(
                "ix_audit_logs_status_code");

        builder.HasIndex(log => log.WasSuccessful)
            .HasDatabaseName(
                "ix_audit_logs_was_successful");

        builder.HasIndex(log => log.TraceId)
            .HasDatabaseName(
                "ix_audit_logs_trace_id");
    }
}
