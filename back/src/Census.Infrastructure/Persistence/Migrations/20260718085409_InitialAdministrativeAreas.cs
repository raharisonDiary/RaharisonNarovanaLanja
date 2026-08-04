using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Census.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialAdministrativeAreas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:postgis", ",,");

            migrationBuilder.CreateTable(
                name: "administrative_areas",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    parent_id = table.Column<Guid>(type: "uuid", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false),
                    deleted_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_administrative_areas", x => x.id);
                    table.ForeignKey(
                        name: "FK_administrative_areas_administrative_areas_parent_id",
                        column: x => x.parent_id,
                        principalTable: "administrative_areas",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_administrative_areas_name",
                table: "administrative_areas",
                column: "name");

            migrationBuilder.CreateIndex(
                name: "ix_administrative_areas_parent_id",
                table: "administrative_areas",
                column: "parent_id");

            migrationBuilder.CreateIndex(
                name: "ux_administrative_areas_type_code",
                table: "administrative_areas",
                columns: new[] { "type", "code" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "administrative_areas");
        }
    }
}
