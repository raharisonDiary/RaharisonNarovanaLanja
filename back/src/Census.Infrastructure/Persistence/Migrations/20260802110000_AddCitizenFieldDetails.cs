using Census.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Census.Infrastructure.Persistence.Migrations;

[DbContext(typeof(CensusDbContext))]
[Migration("20260802110000_AddCitizenFieldDetails")]
public sealed class AddCitizenFieldDetails : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "birth_date_precision",
            table: "persons",
            type: "character varying(30)",
            maxLength: 30,
            nullable: false,
            defaultValue: "Exact");

        migrationBuilder.AddColumn<string>(
            name: "birth_place",
            table: "persons",
            type: "character varying(150)",
            maxLength: 150,
            nullable: true);

        migrationBuilder.AddColumn<int>(
            name: "children_count",
            table: "persons",
            type: "integer",
            nullable: true);

        migrationBuilder.AddColumn<DateOnly>(
            name: "national_id_issue_date",
            table: "persons",
            type: "date",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "national_id_issue_place",
            table: "persons",
            type: "character varying(150)",
            maxLength: 150,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "photo_data_url",
            table: "persons",
            type: "text",
            nullable: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "birth_date_precision",
            table: "persons");

        migrationBuilder.DropColumn(
            name: "birth_place",
            table: "persons");

        migrationBuilder.DropColumn(
            name: "children_count",
            table: "persons");

        migrationBuilder.DropColumn(
            name: "national_id_issue_date",
            table: "persons");

        migrationBuilder.DropColumn(
            name: "national_id_issue_place",
            table: "persons");

        migrationBuilder.DropColumn(
            name: "photo_data_url",
            table: "persons");
    }
}
