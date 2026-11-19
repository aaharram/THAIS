using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRevisionLoyerModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RevisionLoyer",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NoLocation = table.Column<int>(type: "int", nullable: false),
                    AncienLoyer = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    NouveauLoyer = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TauxRevision = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    DateRevision = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DateProchaineRevision = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Reliquat = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RevisionLoyer", x => x.Numero);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RevisionLoyer_NoLocation",
                table: "RevisionLoyer",
                column: "NoLocation");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RevisionLoyer");
        }
    }
}
