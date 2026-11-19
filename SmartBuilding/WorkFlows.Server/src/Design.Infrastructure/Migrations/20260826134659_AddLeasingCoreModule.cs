using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLeasingCoreModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Locataire",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TypeLocataire = table.Column<int>(type: "int", nullable: false),
                    Nom = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Prenom = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    DesignationEntreprise = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Rc = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    IdF = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    NoCIN = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ICE = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CodeLocataire = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Telephone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    Adresse = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    PostalCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    NoCity = table.Column<int>(type: "int", nullable: true),
                    NoCountry = table.Column<int>(type: "int", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AutreContactNom = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    AutreContactPrenom = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    AutreContactTelephone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    AutreContactPoste = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    AutreContactEmail = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    Inactif = table.Column<bool>(type: "bit", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Locataire", x => x.Numero);
                });

            migrationBuilder.CreateTable(
                name: "Location",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NoBuilding = table.Column<int>(type: "int", nullable: false),
                    NoLocal = table.Column<int>(type: "int", nullable: false),
                    NoLocataire = table.Column<int>(type: "int", nullable: false),
                    NoEncaisseur = table.Column<int>(type: "int", nullable: true),
                    NoPeriodicity = table.Column<int>(type: "int", nullable: true),
                    Usage = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    DateDebut = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DateGestion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DateFin = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Franchise = table.Column<int>(type: "int", nullable: true),
                    LoyerNet = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Charges = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TVA = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Taxe = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    LoyerGarage = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Autres = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Montant = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    GenererQuittance = table.Column<bool>(type: "bit", nullable: false),
                    Garantie = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Caution = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ModeReglement = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    Etat = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Inactif = table.Column<bool>(type: "bit", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Location", x => x.Numero);
                });

            migrationBuilder.CreateTable(
                name: "Periodicity",
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
                    table.PrimaryKey("PK_Periodicity", x => x.Numero);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Location_NoBuilding",
                table: "Location",
                column: "NoBuilding");

            migrationBuilder.CreateIndex(
                name: "IX_Location_NoLocal",
                table: "Location",
                column: "NoLocal");

            migrationBuilder.CreateIndex(
                name: "IX_Location_NoLocataire",
                table: "Location",
                column: "NoLocataire");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Locataire");

            migrationBuilder.DropTable(
                name: "Location");

            migrationBuilder.DropTable(
                name: "Periodicity");
        }
    }
}
