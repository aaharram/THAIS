using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPieceJointeToAvocatAndSuiviContentieux : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PieceJointe",
                table: "SuiviContentieux",
                type: "nvarchar(260)",
                maxLength: 260,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PieceJointe",
                table: "Avocat",
                type: "nvarchar(260)",
                maxLength: 260,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PieceJointe",
                table: "SuiviContentieux");

            migrationBuilder.DropColumn(
                name: "PieceJointe",
                table: "Avocat");
        }
    }
}
