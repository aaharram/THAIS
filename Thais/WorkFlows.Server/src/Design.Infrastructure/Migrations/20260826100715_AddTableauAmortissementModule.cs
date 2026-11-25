using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTableauAmortissementModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TableauAmortissement",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NoBuilding = table.Column<int>(type: "int", nullable: false),
                    ImmobConcernees = table.Column<int>(type: "int", nullable: false),
                    DateEntree = table.Column<DateTime>(type: "datetime2", nullable: true),
                    VaPrixAcquisition = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ValeurTerrain = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ValeurConstruction = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ValeurAmenagement = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    AmortiAnterieurs = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AmortiDbeneficebTaux = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    AmortiDbenficebDuree = table.Column<int>(type: "int", nullable: false),
                    AmortiDbeneficebNorm = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalAmortiAlaFin = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DateProchaineAmorti = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ImmobPrincipal = table.Column<bool>(type: "bit", nullable: false),
                    Inactif = table.Column<bool>(type: "bit", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TableauAmortissement", x => x.Numero);
                });

            migrationBuilder.CreateTable(
                name: "TableauAmortissementVersion",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NoTableauAmortissement = table.Column<int>(type: "int", nullable: false),
                    AmortissementsAnterieurs = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AmortissementsNormaux = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DateAmortissement = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TableauAmortissementVersion", x => x.Numero);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TableauAmortissement_NoBuilding",
                table: "TableauAmortissement",
                column: "NoBuilding");

            migrationBuilder.CreateIndex(
                name: "IX_TableauAmortissementVersion_NoTableauAmortissement",
                table: "TableauAmortissementVersion",
                column: "NoTableauAmortissement");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TableauAmortissement");

            migrationBuilder.DropTable(
                name: "TableauAmortissementVersion");
        }
    }
}
