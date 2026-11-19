using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ProspectionBuildingLinkAndComputedNbBien : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NbBien",
                table: "Prospection");

            migrationBuilder.AddColumn<int>(
                name: "NoProspection",
                table: "Building",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NoProspection",
                table: "Building");

            migrationBuilder.AddColumn<int>(
                name: "NbBien",
                table: "Prospection",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
