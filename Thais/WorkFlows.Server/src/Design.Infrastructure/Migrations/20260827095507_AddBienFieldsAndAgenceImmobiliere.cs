using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBienFieldsAndAgenceImmobiliere : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BuildingImage",
                table: "Building",
                type: "nvarchar(260)",
                maxLength: 260,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BuildingPlan",
                table: "Building",
                type: "nvarchar(260)",
                maxLength: 260,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactProprietaire",
                table: "Building",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateDemandeExpertiseTechnique",
                table: "Building",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateExpertiseTechnique",
                table: "Building",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "FacadeArriere",
                table: "Building",
                type: "decimal(12,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "FacadeEnBiais",
                table: "Building",
                type: "decimal(12,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "FacadeLateraleDroite",
                table: "Building",
                type: "decimal(12,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "FacadeLateraleGauche",
                table: "Building",
                type: "decimal(12,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "FacadePrincipale",
                table: "Building",
                type: "decimal(12,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "LongueurFacade",
                table: "Building",
                type: "decimal(12,2)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NbFacade",
                table: "Building",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NoAgenceImmobiliere",
                table: "Building",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PjExpertiseTechnique",
                table: "Building",
                type: "nvarchar(260)",
                maxLength: 260,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Proprietaire",
                table: "Building",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "StatusExpertiseTechnique",
                table: "Building",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "StatusProspect",
                table: "Building",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Superficie",
                table: "Building",
                type: "decimal(12,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Superficie10emeEtage",
                table: "Building",
                type: "decimal(12,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Superficie11emeEtage",
                table: "Building",
                type: "decimal(12,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Superficie12emeEtage",
                table: "Building",
                type: "decimal(12,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Superficie13emeEtage",
                table: "Building",
                type: "decimal(12,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Superficie14emeEtage",
                table: "Building",
                type: "decimal(12,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Superficie15emeEtage",
                table: "Building",
                type: "decimal(12,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Superficie16emeEtage",
                table: "Building",
                type: "decimal(12,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Superficie17emeEtage",
                table: "Building",
                type: "decimal(12,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Superficie18emeEtage",
                table: "Building",
                type: "decimal(12,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Superficie19emeEtage",
                table: "Building",
                type: "decimal(12,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Superficie1erEtage",
                table: "Building",
                type: "decimal(12,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Superficie20emeEtage",
                table: "Building",
                type: "decimal(12,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Superficie21emeEtage",
                table: "Building",
                type: "decimal(12,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Superficie22emeEtage",
                table: "Building",
                type: "decimal(12,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Superficie23emeEtage",
                table: "Building",
                type: "decimal(12,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Superficie24emeEtage",
                table: "Building",
                type: "decimal(12,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Superficie25emeEtage",
                table: "Building",
                type: "decimal(12,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Superficie2emeEtage",
                table: "Building",
                type: "decimal(12,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Superficie3emeEtage",
                table: "Building",
                type: "decimal(12,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Superficie4emeEtage",
                table: "Building",
                type: "decimal(12,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Superficie5emeEtage",
                table: "Building",
                type: "decimal(12,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Superficie6emeEtage",
                table: "Building",
                type: "decimal(12,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Superficie7emeEtage",
                table: "Building",
                type: "decimal(12,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Superficie8emeEtage",
                table: "Building",
                type: "decimal(12,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Superficie9emeEtage",
                table: "Building",
                type: "decimal(12,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "SuperficieRDC",
                table: "Building",
                type: "decimal(12,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "SuperficieSP",
                table: "Building",
                type: "decimal(12,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "SuperficieSS",
                table: "Building",
                type: "decimal(12,2)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AgenceImmobiliere",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RaisonSocial = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Adresse = table.Column<string>(type: "nvarchar(260)", maxLength: 260, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    Tele = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    ContactPrincipal = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    TeleContactPrincipal = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    Inactif = table.Column<bool>(type: "bit", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AgenceImmobiliere", x => x.Numero);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AgenceImmobiliere");

            migrationBuilder.DropColumn(
                name: "BuildingImage",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "BuildingPlan",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "ContactProprietaire",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "DateDemandeExpertiseTechnique",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "DateExpertiseTechnique",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "FacadeArriere",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "FacadeEnBiais",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "FacadeLateraleDroite",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "FacadeLateraleGauche",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "FacadePrincipale",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "LongueurFacade",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "NbFacade",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "NoAgenceImmobiliere",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "PjExpertiseTechnique",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "Proprietaire",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "StatusExpertiseTechnique",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "StatusProspect",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "Superficie",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "Superficie10emeEtage",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "Superficie11emeEtage",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "Superficie12emeEtage",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "Superficie13emeEtage",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "Superficie14emeEtage",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "Superficie15emeEtage",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "Superficie16emeEtage",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "Superficie17emeEtage",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "Superficie18emeEtage",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "Superficie19emeEtage",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "Superficie1erEtage",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "Superficie20emeEtage",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "Superficie21emeEtage",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "Superficie22emeEtage",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "Superficie23emeEtage",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "Superficie24emeEtage",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "Superficie25emeEtage",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "Superficie2emeEtage",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "Superficie3emeEtage",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "Superficie4emeEtage",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "Superficie5emeEtage",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "Superficie6emeEtage",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "Superficie7emeEtage",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "Superficie8emeEtage",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "Superficie9emeEtage",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "SuperficieRDC",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "SuperficieSP",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "SuperficieSS",
                table: "Building");
        }
    }
}
