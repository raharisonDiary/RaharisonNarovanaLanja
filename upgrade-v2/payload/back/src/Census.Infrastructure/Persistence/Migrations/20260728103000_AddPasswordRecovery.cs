using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Census.Infrastructure.Persistence.Migrations;

public partial class AddPasswordRecovery : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<int>(
            name: "password_recovery_attempt_count",
            table: "users",
            type: "integer",
            nullable: false,
            defaultValue: 0);

        migrationBuilder.AddColumn<string>(
            name: "password_recovery_code_hash",
            table: "users",
            type: "character varying(128)",
            maxLength: 128,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "password_recovery_code_salt",
            table: "users",
            type: "character varying(128)",
            maxLength: 128,
            nullable: true);

        migrationBuilder.AddColumn<DateTimeOffset>(
            name: "password_recovery_code_expires_at_utc",
            table: "users",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "password_recovery_token_hash",
            table: "users",
            type: "character varying(128)",
            maxLength: 128,
            nullable: true);

        migrationBuilder.AddColumn<DateTimeOffset>(
            name: "password_recovery_token_expires_at_utc",
            table: "users",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AddColumn<DateTimeOffset>(
            name: "password_recovery_verified_at_utc",
            table: "users",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "ix_users_password_recovery_code_expires_at_utc",
            table: "users",
            column: "password_recovery_code_expires_at_utc");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "ix_users_password_recovery_code_expires_at_utc",
            table: "users");

        migrationBuilder.DropColumn(name: "password_recovery_attempt_count", table: "users");
        migrationBuilder.DropColumn(name: "password_recovery_code_hash", table: "users");
        migrationBuilder.DropColumn(name: "password_recovery_code_salt", table: "users");
        migrationBuilder.DropColumn(name: "password_recovery_code_expires_at_utc", table: "users");
        migrationBuilder.DropColumn(name: "password_recovery_token_hash", table: "users");
        migrationBuilder.DropColumn(name: "password_recovery_token_expires_at_utc", table: "users");
        migrationBuilder.DropColumn(name: "password_recovery_verified_at_utc", table: "users");
    }
}
