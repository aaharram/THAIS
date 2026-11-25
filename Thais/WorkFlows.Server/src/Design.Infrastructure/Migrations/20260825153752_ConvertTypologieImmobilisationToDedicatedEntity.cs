using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ConvertTypologieImmobilisationToDedicatedEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Designation",
                table: "TypologieImmobilisation",
                newName: "ImmobilisationConcernee");

            migrationBuilder.AddColumn<string>(
                name: "CompteAmortissement",
                table: "TypologieImmobilisation",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CompteComptable",
                table: "TypologieImmobilisation",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CompteDotation",
                table: "TypologieImmobilisation",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Duree",
                table: "TypologieImmobilisation",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Taux",
                table: "TypologieImmobilisation",
                type: "decimal(5,2)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompteAmortissement",
                table: "TypologieImmobilisation");

            migrationBuilder.DropColumn(
                name: "CompteComptable",
                table: "TypologieImmobilisation");

            migrationBuilder.DropColumn(
                name: "CompteDotation",
                table: "TypologieImmobilisation");

            migrationBuilder.DropColumn(
                name: "Duree",
                table: "TypologieImmobilisation");

            migrationBuilder.DropColumn(
                name: "Taux",
                table: "TypologieImmobilisation");

            migrationBuilder.RenameColumn(
                name: "ImmobilisationConcernee",
                table: "TypologieImmobilisation",
                newName: "Designation");
        }
    }
}
