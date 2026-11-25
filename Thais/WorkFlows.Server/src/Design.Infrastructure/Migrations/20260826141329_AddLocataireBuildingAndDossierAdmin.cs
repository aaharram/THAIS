using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLocataireBuildingAndDossierAdmin : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AutresDispo",
                table: "Locataire",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "NoBuilding",
                table: "Locataire",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NoLocal",
                table: "Locataire",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "PieceIdentiteDispo",
                table: "Locataire",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "RCDispo",
                table: "Locataire",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "StatutsDispo",
                table: "Locataire",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AutresDispo",
                table: "Locataire");

            migrationBuilder.DropColumn(
                name: "NoBuilding",
                table: "Locataire");

            migrationBuilder.DropColumn(
                name: "NoLocal",
                table: "Locataire");

            migrationBuilder.DropColumn(
                name: "PieceIdentiteDispo",
                table: "Locataire");

            migrationBuilder.DropColumn(
                name: "RCDispo",
                table: "Locataire");

            migrationBuilder.DropColumn(
                name: "StatutsDispo",
                table: "Locataire");
        }
    }
}
