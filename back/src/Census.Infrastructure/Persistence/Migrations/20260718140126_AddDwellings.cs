using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Census.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddDwellings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "dwellings",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    campaign_id = table.Column<Guid>(type: "uuid", nullable: false),
                    enumeration_area_id = table.Column<Guid>(type: "uuid", nullable: false),
                    reference_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    address = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true),
                    locality_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    latitude = table.Column<decimal>(type: "numeric(9,6)", precision: 9, scale: 6, nullable: false),
                    longitude = table.Column<decimal>(type: "numeric(9,6)", precision: 9, scale: 6, nullable: false),
                    occupancy_status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    record_status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false),
                    deleted_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_dwellings", x => x.id);
                    table.ForeignKey(
                        name: "FK_dwellings_administrative_areas_enumeration_area_id",
                        column: x => x.enumeration_area_id,
                        principalTable: "administrative_areas",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_dwellings_census_campaigns_campaign_id",
                        column: x => x.campaign_id,
                        principalTable: "census_campaigns",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_dwellings_users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_dwellings_campaign_id",
                table: "dwellings",
                column: "campaign_id");

            migrationBuilder.CreateIndex(
                name: "ix_dwellings_coordinates",
                table: "dwellings",
                columns: new[] { "latitude", "longitude" });

            migrationBuilder.CreateIndex(
                name: "ix_dwellings_created_by_user_id",
                table: "dwellings",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_dwellings_enumeration_area_id",
                table: "dwellings",
                column: "enumeration_area_id");

            migrationBuilder.CreateIndex(
                name: "ix_dwellings_record_status",
                table: "dwellings",
                column: "record_status");

            migrationBuilder.CreateIndex(
                name: "ux_dwellings_campaign_reference",
                table: "dwellings",
                columns: new[] { "campaign_id", "reference_code" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "dwellings");
        }
    }
}
