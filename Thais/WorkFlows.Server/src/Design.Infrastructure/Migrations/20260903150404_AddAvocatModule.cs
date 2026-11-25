using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAvocatModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Avocat",
                table: "SuiviContentieux");

            migrationBuilder.CreateTable(
                name: "Avocat",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NoContentieux = table.Column<int>(type: "int", nullable: false),
                    Nom = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    Prenom = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    Cabinet = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    Contrat = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Avocat", x => x.Numero);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Avocat_NoContentieux",
                table: "Avocat",
                column: "NoContentieux");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Avocat");

            migrationBuilder.AddColumn<string>(
                name: "Avocat",
                table: "SuiviContentieux",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: true);
        }
    }
}
