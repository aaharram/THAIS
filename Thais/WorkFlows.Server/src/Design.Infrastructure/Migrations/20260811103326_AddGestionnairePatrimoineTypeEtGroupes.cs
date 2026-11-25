using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddGestionnairePatrimoineTypeEtGroupes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "NoGestionnaire",
                table: "User",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PatrimoineType",
                table: "User",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Group",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Designation = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Actif = table.Column<bool>(type: "bit", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Group", x => x.Numero);
                });

            migrationBuilder.CreateTable(
                name: "GroupMembership",
                columns: table => new
                {
                    NoGroup = table.Column<int>(type: "int", nullable: false),
                    NoUser = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GroupMembership", x => new { x.NoGroup, x.NoUser });
                });

            migrationBuilder.CreateTable(
                name: "ServiceProfil",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Designation = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceProfil", x => x.Numero);
                });

            migrationBuilder.UpdateData(
                table: "User",
                keyColumn: "numero",
                keyValue: 1,
                columns: new[] { "NoGestionnaire", "PatrimoineType" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "User",
                keyColumn: "numero",
                keyValue: 2,
                columns: new[] { "NoGestionnaire", "PatrimoineType" },
                values: new object[] { null, null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Group");

            migrationBuilder.DropTable(
                name: "GroupMembership");

            migrationBuilder.DropTable(
                name: "ServiceProfil");

            migrationBuilder.DropColumn(
                name: "NoGestionnaire",
                table: "User");

            migrationBuilder.DropColumn(
                name: "PatrimoineType",
                table: "User");
        }
    }
}
