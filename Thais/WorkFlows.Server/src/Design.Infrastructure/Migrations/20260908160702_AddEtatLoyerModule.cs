using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEtatLoyerModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "HistoriqueEtatLoyer",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Annee = table.Column<int>(type: "int", nullable: false),
                    Mois = table.Column<int>(type: "int", nullable: false),
                    NoBuilding = table.Column<int>(type: "int", nullable: false),
                    Immeuble = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CodeImmeuble = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CompteGeneral = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    NoLocation = table.Column<int>(type: "int", nullable: false),
                    NumContratLocations = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Locataire = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Revenu = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Encaissement = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Enc = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Autres = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Impaye = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    NbMoisImpaye = table.Column<int>(type: "int", nullable: false),
                    DateLimitePai = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HistoriqueEtatLoyer", x => x.Numero);
                });

            migrationBuilder.CreateTable(
                name: "OrdreValidationEtatLoyer",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Annee = table.Column<int>(type: "int", nullable: false),
                    Mois = table.Column<int>(type: "int", nullable: false),
                    DateValidation = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ValidePar = table.Column<int>(type: "int", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrdreValidationEtatLoyer", x => x.Numero);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HistoriqueEtatLoyer_Annee_Mois",
                table: "HistoriqueEtatLoyer",
                columns: new[] { "Annee", "Mois" });

            migrationBuilder.CreateIndex(
                name: "IX_OrdreValidationEtatLoyer_Annee_Mois",
                table: "OrdreValidationEtatLoyer",
                columns: new[] { "Annee", "Mois" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HistoriqueEtatLoyer");

            migrationBuilder.DropTable(
                name: "OrdreValidationEtatLoyer");
        }
    }
}
