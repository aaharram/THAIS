using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPaiementModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Paiement",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NoLocation = table.Column<int>(type: "int", nullable: false),
                    NoEncaisseur = table.Column<int>(type: "int", nullable: true),
                    Montant = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ModePaiement = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    DatePaiement = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Reference = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Paiement", x => x.Numero);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Paiement_NoLocation",
                table: "Paiement",
                column: "NoLocation");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Paiement");
        }
    }
}
