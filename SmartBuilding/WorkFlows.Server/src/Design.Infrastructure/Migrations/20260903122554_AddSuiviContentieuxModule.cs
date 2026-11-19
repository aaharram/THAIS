using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSuiviContentieuxModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SuiviContentieux",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NoLocation = table.Column<int>(type: "int", nullable: false),
                    NatureProcedure = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Observation = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Avocat = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    StatutDossier = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    DateDebutContentieux = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DateEncaissement = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SoldeAnneePrecedente = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SuiviContentieux", x => x.Numero);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SuiviContentieux_NoLocation",
                table: "SuiviContentieux",
                column: "NoLocation");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SuiviContentieux");
        }
    }
}
