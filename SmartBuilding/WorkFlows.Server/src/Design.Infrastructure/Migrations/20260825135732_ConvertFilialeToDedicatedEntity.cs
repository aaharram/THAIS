using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ConvertFilialeToDedicatedEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Proprietaire");

            migrationBuilder.CreateTable(
                name: "Filiale",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nom = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    NumeroReference = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Rib = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    NoBanque = table.Column<int>(type: "int", nullable: true),
                    ModeReglement = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Filiale", x => x.Numero);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Filiale");

            migrationBuilder.CreateTable(
                name: "Proprietaire",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    Designation = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Proprietaire", x => x.Numero);
                });
        }
    }
}
