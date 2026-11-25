using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAttestationModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TypeAttestation",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NoLocation = table.Column<int>(type: "int", nullable: false),
                    NoLocataire = table.Column<int>(type: "int", nullable: false),
                    TypeAttestation = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false),
                    DateAttestation = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DateDebut = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DateFin = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Inactif = table.Column<bool>(type: "bit", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TypeAttestation", x => x.Numero);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TypeAttestation_NoLocataire",
                table: "TypeAttestation",
                column: "NoLocataire");

            migrationBuilder.CreateIndex(
                name: "IX_TypeAttestation_NoLocation",
                table: "TypeAttestation",
                column: "NoLocation");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TypeAttestation");
        }
    }
}
