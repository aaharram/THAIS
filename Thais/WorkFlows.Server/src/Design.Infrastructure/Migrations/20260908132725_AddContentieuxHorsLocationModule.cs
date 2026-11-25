using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddContentieuxHorsLocationModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ContentieuxHorsLocation",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Locataire = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CodeLocataire = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Immeuble = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    LoyerMensuelTTC = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    DateDebutImpaye = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DateFinImpaye = table.Column<DateTime>(type: "datetime2", nullable: false),
                    MontantLoyerImpaye = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Type = table.Column<int>(type: "int", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContentieuxHorsLocation", x => x.Numero);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ContentieuxHorsLocation");
        }
    }
}
