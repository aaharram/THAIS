using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveGroupsFeature : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Group");

            migrationBuilder.DropTable(
                name: "GroupMembership");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Group",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Actif = table.Column<bool>(type: "bit", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    Designation = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false)
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
        }
    }
}
