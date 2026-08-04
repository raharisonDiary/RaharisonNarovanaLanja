using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Census.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAuditLogs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "audit_logs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    occurred_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    actor_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    actor_email = table.Column<string>(type: "character varying(254)", maxLength: 254, nullable: true),
                    actor_role = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    http_method = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    request_path = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    action_name = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    entity_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    entity_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    status_code = table.Column<int>(type: "integer", nullable: false),
                    was_successful = table.Column<bool>(type: "boolean", nullable: false),
                    ip_address = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    user_agent = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    trace_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    failure_type = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_audit_logs", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_audit_logs_action_name",
                table: "audit_logs",
                column: "action_name");

            migrationBuilder.CreateIndex(
                name: "ix_audit_logs_actor_user_id",
                table: "audit_logs",
                column: "actor_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_audit_logs_occurred_at_utc",
                table: "audit_logs",
                column: "occurred_at_utc");

            migrationBuilder.CreateIndex(
                name: "ix_audit_logs_status_code",
                table: "audit_logs",
                column: "status_code");

            migrationBuilder.CreateIndex(
                name: "ix_audit_logs_trace_id",
                table: "audit_logs",
                column: "trace_id");

            migrationBuilder.CreateIndex(
                name: "ix_audit_logs_was_successful",
                table: "audit_logs",
                column: "was_successful");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "audit_logs");
        }
    }
}
