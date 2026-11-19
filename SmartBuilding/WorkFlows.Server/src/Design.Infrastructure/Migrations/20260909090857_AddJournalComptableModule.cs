using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddJournalComptableModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TypeSequenceComptable",
                table: "Building",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "CompteComptableJournal",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TypeJournal = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TypeSequenceComptable = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CompteDebit = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CompteCredit = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    SousCompte = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompteComptableJournal", x => x.Numero);
                });

            migrationBuilder.CreateTable(
                name: "JournalComptableGeneration",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Annee = table.Column<int>(type: "int", nullable: false),
                    Mois = table.Column<int>(type: "int", nullable: false),
                    NoProprietaire = table.Column<int>(type: "int", nullable: true),
                    TypeJournal = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DateGeneration = table.Column<DateTime>(type: "datetime2", nullable: false),
                    GenerePar = table.Column<int>(type: "int", nullable: false),
                    NbLignes = table.Column<int>(type: "int", nullable: false),
                    MontantTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JournalComptableGeneration", x => x.Numero);
                });

            migrationBuilder.InsertData(
                table: "CompteComptableJournal",
                columns: new[] { "Numero", "AddDate", "AddUser", "CompteCredit", "CompteDebit", "Description", "ModDate", "ModUser", "SousCompte", "TypeJournal", "TypeSequenceComptable" },
                values: new object[,]
                {
                    { 1, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 0, "732110", "348811", "Émission loyers - Admis", new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 0, null, "EmissionLoyers", "ADMIS" },
                    { 2, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 0, "743211", "348819", "Émission loyers - Libre", new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 0, null, "EmissionLoyers", "LIBRE" },
                    { 3, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 0, "348811", "732110", "Annulation émission loyers - Admis", new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 0, null, "AnnulationEmissionLoyers", "ADMIS" },
                    { 4, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 0, "348819", "743211", "Annulation émission loyers - Libre", new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 0, null, "AnnulationEmissionLoyers", "LIBRE" },
                    { 5, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 0, "394800", "639460", "Émission loyers contentieux - Admis", new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 0, null, "EmissionLoyersContentieux", "ADMIS" },
                    { 6, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 0, "394800", "639460", "Émission loyers contentieux - Libre", new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 0, null, "EmissionLoyersContentieux", "LIBRE" },
                    { 7, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 0, "348811", "445210", "Encaissement loyers - Admis", new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 0, null, "EncaissementLoyers", "ADMIS" },
                    { 8, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 0, "348819", "445210", "Encaissement loyers - Libre", new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 0, null, "EncaissementLoyers", "LIBRE" },
                    { 9, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 0, "739460", "394800", "Encaissement loyers contentieux - Admis", new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 0, null, "EncaissementLoyersContentieux", "ADMIS" },
                    { 10, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 0, "739460", "394800", "Encaissement loyers contentieux - Libre", new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 0, null, "EncaissementLoyersContentieux", "LIBRE" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_CompteComptableJournal_TypeJournal_TypeSequenceComptable",
                table: "CompteComptableJournal",
                columns: new[] { "TypeJournal", "TypeSequenceComptable" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JournalComptableGeneration_Annee_Mois_TypeJournal",
                table: "JournalComptableGeneration",
                columns: new[] { "Annee", "Mois", "TypeJournal" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CompteComptableJournal");

            migrationBuilder.DropTable(
                name: "JournalComptableGeneration");

            migrationBuilder.DropColumn(
                name: "TypeSequenceComptable",
                table: "Building");
        }
    }
}
