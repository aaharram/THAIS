using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSuspensionModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Suspension",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NoBuilding = table.Column<int>(type: "int", nullable: false),
                    NoContratLocation = table.Column<int>(type: "int", nullable: false),
                    MotifSuspension = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StatutValidation = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    DateSuspension = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DateArretSuspension = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Inactif = table.Column<bool>(type: "bit", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Suspension", x => x.Numero);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Suspension_NoBuilding",
                table: "Suspension",
                column: "NoBuilding");

            migrationBuilder.CreateIndex(
                name: "IX_Suspension_NoContratLocation",
                table: "Suspension",
                column: "NoContratLocation");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Suspension");
        }
    }
}
