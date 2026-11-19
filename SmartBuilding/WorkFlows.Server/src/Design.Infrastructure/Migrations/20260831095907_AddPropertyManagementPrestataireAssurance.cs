using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPropertyManagementPrestataireAssurance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Assurance",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NumPolice = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    NoAssureur = table.Column<int>(type: "int", nullable: false),
                    NoCourtier = table.Column<int>(type: "int", nullable: true),
                    TypeCouverture = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    DateEffetContrat = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Montant = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Statut = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Inactif = table.Column<bool>(type: "bit", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Assurance", x => x.Numero);
                });

            // NOTE: "Prestataire" est déjà présente en base (créée hors dépôt git, cf.
            // conversation) - on ne la recrée pas, EF la mappe simplement telle quelle.
            // "Facture" et "RevisionLoyer" existent aussi déjà (Facture contient une ligne
            // réelle) - un décalage préexistant du snapshot EF (sans rapport avec ce
            // changement) les faisait apparaître comme nouvelles ; retirées de cette
            // migration pour ne pas écraser ces tables.

            migrationBuilder.CreateTable(
                name: "PrestataireContrat",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NoPrestataire = table.Column<int>(type: "int", nullable: false),
                    NumeroContrat = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Objet = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    DateContrat = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DateDebut = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DateFin = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Montant = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    PieceJointe = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Inactif = table.Column<bool>(type: "bit", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrestataireContrat", x => x.Numero);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Assurance_NoAssureur",
                table: "Assurance",
                column: "NoAssureur");

            migrationBuilder.CreateIndex(
                name: "IX_PrestataireContrat_NoPrestataire",
                table: "PrestataireContrat",
                column: "NoPrestataire");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Assurance");

            migrationBuilder.DropTable(
                name: "PrestataireContrat");
        }
    }
}
