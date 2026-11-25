using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPropertyManagementTaxeSyndic : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SyndicReunion",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NoBuilding = table.Column<int>(type: "int", nullable: false),
                    DateReunion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DateReglement = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NoVille = table.Column<int>(type: "int", nullable: true),
                    NombreQuotePart = table.Column<int>(type: "int", nullable: true),
                    QuotePartAppelFonds = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    AppelFondsAnnuel = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    PjConvocation = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    PjPV = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    PjAppelFonds = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Inactif = table.Column<bool>(type: "bit", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SyndicReunion", x => x.Numero);
                });

            migrationBuilder.CreateTable(
                name: "Taxe",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NoBuilding = table.Column<int>(type: "int", nullable: false),
                    NoLocal = table.Column<int>(type: "int", nullable: true),
                    NoLocataire = table.Column<int>(type: "int", nullable: true),
                    NoType = table.Column<int>(type: "int", nullable: false),
                    IdFiscal = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    NoArticle = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    MontantTaxe = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Annee = table.Column<int>(type: "int", nullable: false),
                    Paye = table.Column<bool>(type: "bit", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Inactif = table.Column<bool>(type: "bit", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Taxe", x => x.Numero);
                });

            migrationBuilder.CreateTable(
                name: "TypeTaxe",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Designation = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TypeTaxe", x => x.Numero);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SyndicReunion_NoBuilding",
                table: "SyndicReunion",
                column: "NoBuilding");

            migrationBuilder.CreateIndex(
                name: "IX_Taxe_NoBuilding",
                table: "Taxe",
                column: "NoBuilding");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SyndicReunion");

            migrationBuilder.DropTable(
                name: "Taxe");

            migrationBuilder.DropTable(
                name: "TypeTaxe");
        }
    }
}
