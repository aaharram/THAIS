using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTaxeModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Taxe et TypeTaxe existent déjà en base (créées par une autre session en
            // parallèle) avec un schéma identique à celui-ci - CreateTable/index déjà
            // existant volontairement omis pour ne pas dupliquer/écraser cette table.
            migrationBuilder.CreateIndex(
                name: "IX_Taxe_NoBuilding_Annee",
                table: "Taxe",
                columns: new[] { "NoBuilding", "Annee" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Taxe_NoBuilding_Annee",
                table: "Taxe");
        }
    }
}
