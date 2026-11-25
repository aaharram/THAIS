using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSignatureAndAchatOptionsToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "GestionAdministrative",
                table: "User",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "GestionFinanciere",
                table: "User",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "GestionMetier",
                table: "User",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "SignatureUrl",
                table: "User",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "User",
                keyColumn: "numero",
                keyValue: 1,
                columns: new[] { "GestionAdministrative", "GestionFinanciere", "GestionMetier", "SignatureUrl" },
                values: new object[] { false, false, false, null });

            migrationBuilder.UpdateData(
                table: "User",
                keyColumn: "numero",
                keyValue: 2,
                columns: new[] { "GestionAdministrative", "GestionFinanciere", "GestionMetier", "SignatureUrl" },
                values: new object[] { false, false, false, null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GestionAdministrative",
                table: "User");

            migrationBuilder.DropColumn(
                name: "GestionFinanciere",
                table: "User");

            migrationBuilder.DropColumn(
                name: "GestionMetier",
                table: "User");

            migrationBuilder.DropColumn(
                name: "SignatureUrl",
                table: "User");
        }
    }
}
