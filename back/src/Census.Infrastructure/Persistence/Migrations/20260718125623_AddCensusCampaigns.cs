using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Census.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCensusCampaigns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "census_campaigns",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    start_date = table.Column<DateOnly>(type: "date", nullable: false),
                    end_date = table.Column<DateOnly>(type: "date", nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    scope_administrative_area_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false),
                    deleted_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_census_campaigns", x => x.id);
                    table.ForeignKey(
                        name: "FK_census_campaigns_administrative_areas_scope_administrative_~",
                        column: x => x.scope_administrative_area_id,
                        principalTable: "administrative_areas",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_census_campaigns_dates",
                table: "census_campaigns",
                columns: new[] { "start_date", "end_date" });

            migrationBuilder.CreateIndex(
                name: "ix_census_campaigns_scope_area_id",
                table: "census_campaigns",
                column: "scope_administrative_area_id");

            migrationBuilder.CreateIndex(
                name: "ix_census_campaigns_status",
                table: "census_campaigns",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ux_census_campaigns_code",
                table: "census_campaigns",
                column: "code",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "census_campaigns");
        }
    }
}
