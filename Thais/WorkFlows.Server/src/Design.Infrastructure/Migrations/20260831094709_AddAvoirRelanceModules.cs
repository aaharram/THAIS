using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAvoirRelanceModules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Avoir",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NoLocation = table.Column<int>(type: "int", nullable: false),
                    NoFacture = table.Column<int>(type: "int", nullable: false),
                    DateAvoir = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Montant = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Avoir", x => x.Numero);
                });

            migrationBuilder.CreateTable(
                name: "Relance",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NoLocation = table.Column<int>(type: "int", nullable: false),
                    TypeRelance = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    DateRelance = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TypeEnvoi = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Relance", x => x.Numero);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Avoir_NoFacture",
                table: "Avoir",
                column: "NoFacture");

            migrationBuilder.CreateIndex(
                name: "IX_Avoir_NoLocation",
                table: "Avoir",
                column: "NoLocation");

            migrationBuilder.CreateIndex(
                name: "IX_Relance_NoLocation",
                table: "Relance",
                column: "NoLocation");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Avoir");

            migrationBuilder.DropTable(
                name: "Relance");
        }
    }
}
