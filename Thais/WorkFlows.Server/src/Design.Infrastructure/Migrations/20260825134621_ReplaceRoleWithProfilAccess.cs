using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ReplaceRoleWithProfilAccess : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MemberType");

            migrationBuilder.DropColumn(
                name: "NoType",
                table: "User");

            migrationBuilder.AddColumn<bool>(
                name: "AccesComplet",
                table: "ServiceProfil",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.InsertData(
                table: "ServiceProfil",
                columns: new[] { "Numero", "AccesComplet", "AddDate", "AddUser", "Designation", "ModDate", "ModUser" },
                values: new object[] { 1, true, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, "Administrateur", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1 });

            migrationBuilder.UpdateData(
                table: "User",
                keyColumn: "numero",
                keyValue: 1,
                column: "PatrimoineType",
                value: 1);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ServiceProfil",
                keyColumn: "Numero",
                keyValue: 1);

            migrationBuilder.DropColumn(
                name: "AccesComplet",
                table: "ServiceProfil");

            migrationBuilder.AddColumn<int>(
                name: "NoType",
                table: "User",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "MemberType",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Actif = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    Code = table.Column<string>(type: "char(5)", unicode: false, fixedLength: true, maxLength: 5, nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    NoType = table.Column<int>(type: "int", nullable: false),
                    Title_E = table.Column<string>(type: "char(35)", unicode: false, fixedLength: true, maxLength: 35, nullable: false),
                    Title_F = table.Column<string>(type: "char(35)", unicode: false, fixedLength: true, maxLength: 35, nullable: false),
                    Title_P = table.Column<string>(type: "char(35)", unicode: false, fixedLength: true, maxLength: 35, nullable: false),
                    Title_S = table.Column<string>(type: "char(35)", unicode: false, fixedLength: true, maxLength: 35, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("MemberTypeNumero", x => x.Numero);
                });

            migrationBuilder.InsertData(
                table: "MemberType",
                columns: new[] { "Numero", "Actif", "AddDate", "AddUser", "Code", "ModDate", "ModUser", "NoType", "Title_E", "Title_F", "Title_P", "Title_S" },
                values: new object[,]
                {
                    { 1, true, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, "ADMIN", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, 1, "Contractor", "Contractor", "Contractor", "Contractor" },
                    { 2, true, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, "EMP", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, 2, "Employee", "Ouvrier", "Employee", "Employee" }
                });

            migrationBuilder.UpdateData(
                table: "User",
                keyColumn: "numero",
                keyValue: 1,
                columns: new[] { "NoType", "PatrimoineType" },
                values: new object[] { 1, null });

            migrationBuilder.UpdateData(
                table: "User",
                keyColumn: "numero",
                keyValue: 2,
                column: "NoType",
                value: 2);
        }
    }
}
