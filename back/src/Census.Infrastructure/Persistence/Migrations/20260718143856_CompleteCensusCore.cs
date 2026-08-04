using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Census.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class CompleteCensusCore : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "households",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    campaign_id = table.Column<Guid>(type: "uuid", nullable: false),
                    dwelling_id = table.Column<Guid>(type: "uuid", nullable: false),
                    reference_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    household_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    head_full_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    phone_number = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    record_status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false),
                    deleted_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_households", x => x.id);
                    table.ForeignKey(
                        name: "FK_households_census_campaigns_campaign_id",
                        column: x => x.campaign_id,
                        principalTable: "census_campaigns",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_households_dwellings_dwelling_id",
                        column: x => x.dwelling_id,
                        principalTable: "dwellings",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_households_users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "persons",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    campaign_id = table.Column<Guid>(type: "uuid", nullable: false),
                    household_id = table.Column<Guid>(type: "uuid", nullable: false),
                    person_number = table.Column<int>(type: "integer", nullable: false),
                    first_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    last_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    sex = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    date_of_birth = table.Column<DateOnly>(type: "date", nullable: true),
                    age_years = table.Column<int>(type: "integer", nullable: true),
                    relationship_to_head = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    marital_status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    nationality = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    occupation = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    phone_number = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    national_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    record_status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false),
                    deleted_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_persons", x => x.id);
                    table.ForeignKey(
                        name: "FK_persons_census_campaigns_campaign_id",
                        column: x => x.campaign_id,
                        principalTable: "census_campaigns",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_persons_households_household_id",
                        column: x => x.household_id,
                        principalTable: "households",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_persons_users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_households_created_by_user_id",
                table: "households",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_households_dwelling_id",
                table: "households",
                column: "dwelling_id");

            migrationBuilder.CreateIndex(
                name: "ix_households_record_status",
                table: "households",
                column: "record_status");

            migrationBuilder.CreateIndex(
                name: "ux_households_campaign_reference",
                table: "households",
                columns: new[] { "campaign_id", "reference_code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_persons_campaign_id",
                table: "persons",
                column: "campaign_id");

            migrationBuilder.CreateIndex(
                name: "ix_persons_created_by_user_id",
                table: "persons",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_persons_record_status",
                table: "persons",
                column: "record_status");

            migrationBuilder.CreateIndex(
                name: "ux_persons_household_number",
                table: "persons",
                columns: new[] { "household_id", "person_number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_persons_national_id_active",
                table: "persons",
                column: "national_id",
                unique: true,
                filter: "national_id IS NOT NULL AND is_deleted = false");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "persons");

            migrationBuilder.DropTable(
                name: "households");
        }
    }
}
