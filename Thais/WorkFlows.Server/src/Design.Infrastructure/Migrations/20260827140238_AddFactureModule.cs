using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddFactureModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Facture",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NoLocation = table.Column<int>(type: "int", nullable: false),
                    Periode = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DateEmission = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DateEcheance = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LoyerNet = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Charges = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TVA = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Taxe = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Autres = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Montant = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Etat = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Edite = table.Column<bool>(type: "bit", nullable: false),
                    DemandeAnnulation = table.Column<bool>(type: "bit", nullable: false),
                    DateAnnulation = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Facture", x => x.Numero);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Facture_NoLocation",
                table: "Facture",
                column: "NoLocation");

            migrationBuilder.CreateIndex(
                name: "IX_Facture_NoLocation_Periode",
                table: "Facture",
                columns: new[] { "NoLocation", "Periode" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Facture");
        }
    }
}
