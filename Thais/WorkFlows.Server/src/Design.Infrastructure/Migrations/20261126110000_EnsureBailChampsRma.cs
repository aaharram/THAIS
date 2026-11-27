using Design.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    // RMANew (DataEntryLocation) : champs du formulaire de bail absents de Thais (garantie, état des loyers, contrat...).
    // On n'ajoute que les colonnes manquantes de la table Location ; une base qui les a déjà n'est pas modifiée.
    /// <inheritdoc />
    [DbContext(typeof(DbDesignContext))]
    [Migration("20261126110000_EnsureBailChampsRma")]
    public partial class EnsureBailChampsRma : Migration
    {
        private static readonly (string Nom, string Type, bool Booleen)[] Colonnes =
        [
            ("TypeSequenceComptable", "nvarchar(20)", false),
            ("TauxRevisionLoyer", "decimal(18,4)", false),
            ("Duree", "int", false),
            ("DepotGarantie", "bit", true),
            ("CautionFichier", "nvarchar(500)", false),
            ("Reference", "nvarchar(100)", false),
            ("DateReglement", "datetime2", false),
            ("ResteCaution", "decimal(18,2)", false),
            ("UtiliseeCaution", "bit", true),
            ("Observation", "nvarchar(max)", false),
            ("LoyersImpayes", "decimal(18,2)", false),
            ("DebutImpayes", "datetime2", false),
            ("FinImpayes", "datetime2", false),
            ("NbMoisImpayes", "int", false),
            ("ArrieresAugmentation", "decimal(18,2)", false),
            ("Contentieux", "bit", true),
            ("DebutArriere", "datetime2", false),
            ("FinArriere", "datetime2", false),
            ("FraisJustice", "decimal(18,2)", false),
            ("ContratFichier", "nvarchar(500)", false),
        ];

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            foreach ((string nom, string type, bool booleen) in Colonnes)
            {
                string definition = booleen
                    ? $"{type} NOT NULL CONSTRAINT [DF_Location_{nom}] DEFAULT 0"
                    : $"{type} NULL";
                migrationBuilder.Sql(
                    $"IF COL_LENGTH(N'dbo.Location', N'{nom}') IS NULL ALTER TABLE [dbo].[Location] ADD [{nom}] {definition};");
            }
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Volontairement vide : les colonnes peuvent préexister à cette migration (et contenir des données).
        }
    }
}
