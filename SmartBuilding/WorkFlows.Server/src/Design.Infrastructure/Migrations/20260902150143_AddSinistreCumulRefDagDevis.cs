using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSinistreCumulRefDagDevis : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Cumul",
                table: "Sinistre",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "DevisFacture",
                table: "Sinistre",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RefDossierDAG",
                table: "Sinistre",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Cumul",
                table: "Sinistre");

            migrationBuilder.DropColumn(
                name: "DevisFacture",
                table: "Sinistre");

            migrationBuilder.DropColumn(
                name: "RefDossierDAG",
                table: "Sinistre");
        }
    }
}
