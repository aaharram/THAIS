using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPropertyManagementBlocks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BonDeCommande",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NumeroBonCommande = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    NoPrestataire = table.Column<int>(type: "int", nullable: false),
                    DateCommande = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DateReception = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Compte = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CompteComptable = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StatutApprobation = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BonDeCommande", x => x.Numero);
                });

            migrationBuilder.CreateTable(
                name: "Charge",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NoBuilding = table.Column<int>(type: "int", nullable: false),
                    NoTypologieCharge = table.Column<int>(type: "int", nullable: false),
                    NoPrestataire = table.Column<int>(type: "int", nullable: true),
                    Annee = table.Column<int>(type: "int", nullable: false),
                    Montant = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Realisation = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    DateDecaissement = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CodeCharge = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Inactif = table.Column<bool>(type: "bit", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Charge", x => x.Numero);
                });

            migrationBuilder.CreateTable(
                name: "PrestationAchat",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NoBonCommande = table.Column<int>(type: "int", nullable: false),
                    NoBuilding = table.Column<int>(type: "int", nullable: false),
                    NoTypologieCharge = table.Column<int>(type: "int", nullable: false),
                    PrixUnitaireHT = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Quantite = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TauxTVA = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    DureeAmortissementMois = table.Column<int>(type: "int", nullable: true),
                    TauxAmortissement = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    EstAmorti = table.Column<bool>(type: "bit", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrestationAchat", x => x.Numero);
                });

            migrationBuilder.CreateTable(
                name: "Reclamation",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NoBuilding = table.Column<int>(type: "int", nullable: false),
                    NoLocal = table.Column<int>(type: "int", nullable: true),
                    NoLocataire = table.Column<int>(type: "int", nullable: false),
                    Etat = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    DateReclamation = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Objet = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reclamation", x => x.Numero);
                });

            migrationBuilder.CreateTable(
                name: "Sinistre",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NoBuilding = table.Column<int>(type: "int", nullable: false),
                    NoLocal = table.Column<int>(type: "int", nullable: true),
                    NoAssurance = table.Column<int>(type: "int", nullable: true),
                    NoTypeSinistre = table.Column<int>(type: "int", nullable: false),
                    EtapeSuivi = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    DateDeclaration = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DateExpertise = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DateReclamation = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DateRemboursement = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EstimationDegatBailleur = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    EstimationDegatLocataire = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    MontantFacture = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    MontantRemuneration = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    NomExpert = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RefDossierAssurance = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IdSinistre = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sinistre", x => x.Numero);
                });

            migrationBuilder.CreateTable(
                name: "Syndic",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nom = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Prenom = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Poste = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Telephone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DebutMandat = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FinMandat = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IdSyndic = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Inactif = table.Column<bool>(type: "bit", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Syndic", x => x.Numero);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BonDeCommande_NoPrestataire",
                table: "BonDeCommande",
                column: "NoPrestataire");

            migrationBuilder.CreateIndex(
                name: "IX_BonDeCommande_NumeroBonCommande",
                table: "BonDeCommande",
                column: "NumeroBonCommande",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Charge_NoBuilding",
                table: "Charge",
                column: "NoBuilding");

            migrationBuilder.CreateIndex(
                name: "IX_Charge_NoBuilding_Annee",
                table: "Charge",
                columns: new[] { "NoBuilding", "Annee" });

            migrationBuilder.CreateIndex(
                name: "IX_PrestationAchat_NoBonCommande",
                table: "PrestationAchat",
                column: "NoBonCommande");

            migrationBuilder.CreateIndex(
                name: "IX_PrestationAchat_NoBuilding",
                table: "PrestationAchat",
                column: "NoBuilding");

            migrationBuilder.CreateIndex(
                name: "IX_Reclamation_NoBuilding",
                table: "Reclamation",
                column: "NoBuilding");

            migrationBuilder.CreateIndex(
                name: "IX_Reclamation_NoLocataire",
                table: "Reclamation",
                column: "NoLocataire");

            migrationBuilder.CreateIndex(
                name: "IX_Sinistre_NoAssurance",
                table: "Sinistre",
                column: "NoAssurance");

            migrationBuilder.CreateIndex(
                name: "IX_Sinistre_NoBuilding",
                table: "Sinistre",
                column: "NoBuilding");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BonDeCommande");

            migrationBuilder.DropTable(
                name: "Charge");

            migrationBuilder.DropTable(
                name: "PrestationAchat");

            migrationBuilder.DropTable(
                name: "Reclamation");

            migrationBuilder.DropTable(
                name: "Sinistre");

            migrationBuilder.DropTable(
                name: "Syndic");
        }
    }
}
