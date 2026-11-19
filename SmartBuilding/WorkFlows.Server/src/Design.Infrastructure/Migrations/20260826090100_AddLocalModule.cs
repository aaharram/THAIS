using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLocalModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Local",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NoBuilding = table.Column<int>(type: "int", nullable: false),
                    NoLocalType = table.Column<int>(type: "int", nullable: true),
                    Designation = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    EnExploitation = table.Column<bool>(type: "bit", nullable: false),
                    Nondisponible = table.Column<bool>(type: "bit", nullable: false),
                    MoyensGeneraux = table.Column<bool>(type: "bit", nullable: false),
                    MettreEnLocation = table.Column<bool>(type: "bit", nullable: false),
                    Responsable = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    NbrePiece = table.Column<int>(type: "int", nullable: true),
                    Surface = table.Column<decimal>(type: "decimal(12,2)", nullable: true),
                    Terrasse = table.Column<decimal>(type: "decimal(12,2)", nullable: true),
                    Address1 = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    TitreFoncier = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    AVendre = table.Column<bool>(type: "bit", nullable: false),
                    Etage = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    DateModificationValeur = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DernierLoyer = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ValeurEntree = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ValeurInventaire = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ValeurRealisation = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Observation = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Etat = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Demande = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Suggestion = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    MontantAmenagement = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    OffreLoyerHT = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    OffreCharge = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TVA = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    OffreTSC = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    OffreLoyerTTC = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Inactif = table.Column<bool>(type: "bit", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Local", x => x.Numero);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Local_NoBuilding",
                table: "Local",
                column: "NoBuilding");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Local");
        }
    }
}
