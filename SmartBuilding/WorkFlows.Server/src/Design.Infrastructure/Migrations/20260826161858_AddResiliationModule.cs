using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddResiliationModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Resiliation",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NoBuilding = table.Column<int>(type: "int", nullable: false),
                    NoContrat = table.Column<int>(type: "int", nullable: false),
                    TypeResiliation = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    MotifResiliation = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DurePreavis = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OrigineResiliation = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    StatutValidation = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    DateResiliation = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DateReception = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DateRestitutionActif = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Inactif = table.Column<bool>(type: "bit", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Resiliation", x => x.Numero);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Resiliation_NoBuilding",
                table: "Resiliation",
                column: "NoBuilding");

            migrationBuilder.CreateIndex(
                name: "IX_Resiliation_NoContrat",
                table: "Resiliation",
                column: "NoContrat");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Resiliation");
        }
    }
}
