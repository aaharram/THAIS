using System;
using Design.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(DbDesignContext))]
    [Migration("20261014120000_AddBuildingPiecesJointes")]
    public partial class AddBuildingPiecesJointes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BuildingPlanCadastrale",
                table: "Building",
                type: "nvarchar(260)",
                maxLength: 260,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CertificatPropriete",
                table: "Building",
                type: "nvarchar(260)",
                maxLength: 260,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Certifconformite",
                table: "Building",
                type: "nvarchar(260)",
                maxLength: 260,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContratAcquisition",
                table: "Building",
                type: "nvarchar(260)",
                maxLength: 260,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RegInterieur",
                table: "Building",
                type: "nvarchar(260)",
                maxLength: 260,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "BuildingPieceJointe",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NoBuilding = table.Column<int>(type: "int", nullable: false),
                    FileName = table.Column<string>(type: "nvarchar(260)", maxLength: 260, nullable: false),
                    PieceJointe = table.Column<string>(type: "nvarchar(260)", maxLength: 260, nullable: false),
                    Taille = table.Column<long>(type: "bigint", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BuildingPieceJointe", x => x.Numero);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BuildingPieceJointe_NoBuilding",
                table: "BuildingPieceJointe",
                column: "NoBuilding");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "BuildingPieceJointe");

            migrationBuilder.DropColumn(name: "BuildingPlanCadastrale", table: "Building");
            migrationBuilder.DropColumn(name: "CertificatPropriete", table: "Building");
            migrationBuilder.DropColumn(name: "Certifconformite", table: "Building");
            migrationBuilder.DropColumn(name: "ContratAcquisition", table: "Building");
            migrationBuilder.DropColumn(name: "RegInterieur", table: "Building");
        }
    }
}
