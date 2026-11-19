using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddVncModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "VNC",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NoBuilding = table.Column<int>(type: "int", nullable: false),
                    MontantVNC = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    DateVNC = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VNC", x => x.Numero);
                });

            migrationBuilder.CreateIndex(
                name: "IX_VNC_NoBuilding",
                table: "VNC",
                column: "NoBuilding");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "VNC");
        }
    }
}
