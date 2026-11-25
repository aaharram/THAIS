using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddExpertiseModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Expertise",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CabinetExpert = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    NoBuilding = table.Column<int>(type: "int", nullable: false),
                    NoLocal = table.Column<int>(type: "int", nullable: false),
                    ValeurTerrain = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ValeurConstruction = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ValeurExpertiseActualiser = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    DateExpertiseActualiser = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Expertise", x => x.Numero);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Expertise_NoBuilding_NoLocal",
                table: "Expertise",
                columns: new[] { "NoBuilding", "NoLocal" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Expertise");
        }
    }
}
