using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPaiementAnnulationModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Annule",
                table: "Paiement",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateAnnulation",
                table: "Paiement",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "DemandeAnnulation",
                table: "Paiement",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "PaiementFacture",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NoPaiement = table.Column<int>(type: "int", nullable: false),
                    NoFacture = table.Column<int>(type: "int", nullable: false),
                    Montant = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaiementFacture", x => x.Numero);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PaiementFacture_NoFacture",
                table: "PaiementFacture",
                column: "NoFacture");

            migrationBuilder.CreateIndex(
                name: "IX_PaiementFacture_NoPaiement",
                table: "PaiementFacture",
                column: "NoPaiement");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PaiementFacture");

            migrationBuilder.DropColumn(
                name: "Annule",
                table: "Paiement");

            migrationBuilder.DropColumn(
                name: "DateAnnulation",
                table: "Paiement");

            migrationBuilder.DropColumn(
                name: "DemandeAnnulation",
                table: "Paiement");
        }
    }
}
