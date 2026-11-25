using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRemiseModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Remise",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NumRemise = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Montant = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MontantRestant = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Statut = table.Column<int>(type: "int", nullable: false),
                    Reference = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    IsAnnuler = table.Column<bool>(type: "bit", nullable: false),
                    DateAnnulation = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Remise", x => x.Numero);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Remise_NumRemise",
                table: "Remise",
                column: "NumRemise");

            migrationBuilder.CreateIndex(
                name: "IX_Remise_Statut",
                table: "Remise",
                column: "Statut");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Remise");
        }
    }
}
