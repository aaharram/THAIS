using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPatrimoineBuildingModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Building",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CodeImmeuble = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Designation = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    EnExploitation = table.Column<bool>(type: "bit", nullable: false),
                    NoArticle = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    NoBuildingType = table.Column<int>(type: "int", nullable: true),
                    CompteGeneral = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    NAffectation = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    NoEncaisseur = table.Column<int>(type: "int", nullable: true),
                    ProvenanceActif = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    AjouterContrainte = table.Column<bool>(type: "bit", nullable: false),
                    NoProprieteType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    NoProprietaire = table.Column<int>(type: "int", nullable: true),
                    Responsable = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ContactResponsable = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    TitreFoncier = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    TypeTF = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    AVendre = table.Column<bool>(type: "bit", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Address1 = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    PostalCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    NoCity = table.Column<int>(type: "int", nullable: true),
                    NoCountry = table.Column<int>(type: "int", nullable: true),
                    Latitude = table.Column<decimal>(type: "decimal(10,6)", nullable: true),
                    Longitude = table.Column<decimal>(type: "decimal(10,6)", nullable: true),
                    ValeurEntreeTerrain = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ValeurEntreeConstruction = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ValeurAmenagement = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ValeurInventaire = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    DateAcquisition = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DateModificationValeur = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UnitCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    SurfaceTerrain = table.Column<decimal>(type: "decimal(12,2)", nullable: true),
                    SurfaceUtile = table.Column<decimal>(type: "decimal(12,2)", nullable: true),
                    SurfaceEspaceVert = table.Column<decimal>(type: "decimal(12,2)", nullable: true),
                    SurfaceParking = table.Column<decimal>(type: "decimal(12,2)", nullable: true),
                    NombrePlacesParking = table.Column<int>(type: "int", nullable: true),
                    NombreAscenseurs = table.Column<int>(type: "int", nullable: true),
                    MarqueAscenseur = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    NombreEtages = table.Column<int>(type: "int", nullable: true),
                    Accueil = table.Column<bool>(type: "bit", nullable: false),
                    Securite = table.Column<bool>(type: "bit", nullable: false),
                    Revetement = table.Column<bool>(type: "bit", nullable: false),
                    Peinture = table.Column<bool>(type: "bit", nullable: false),
                    FauxPlafond = table.Column<bool>(type: "bit", nullable: false),
                    Reseaux = table.Column<bool>(type: "bit", nullable: false),
                    Climatisation = table.Column<bool>(type: "bit", nullable: false),
                    Inactif = table.Column<bool>(type: "bit", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Building", x => x.Numero);
                });

            migrationBuilder.CreateTable(
                name: "BuildingType",
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
                    table.PrimaryKey("PK_BuildingType", x => x.Numero);
                });

            migrationBuilder.CreateTable(
                name: "Pays",
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
                    table.PrimaryKey("PK_Pays", x => x.Numero);
                });

            migrationBuilder.CreateTable(
                name: "Proprietaire",
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
                    table.PrimaryKey("PK_Proprietaire", x => x.Numero);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Building");

            migrationBuilder.DropTable(
                name: "BuildingType");

            migrationBuilder.DropTable(
                name: "Pays");

            migrationBuilder.DropTable(
                name: "Proprietaire");
        }
    }
}
