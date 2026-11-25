using Design.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    // Comme pour "Prestataire" : la migration AddSinistreCumulRefDagDevis part du principe que certaines colonnes de la
    // table "Sinistre" existent déjà (« étendue en amont, absente de ce dépôt »). Sur une base neuve (ELeaseCore), elles
    // manquent, et l'écran Sinistres échoue (« Nom de colonne non valide »). Cette migration ajoute seulement celles qui
    // sont absentes : une base qui les a déjà (SmartBuildingCore) n'est pas modifiée. Le modèle EF ne change pas.
    /// <inheritdoc />
    [DbContext(typeof(DbDesignContext))]
    [Migration("20261119130000_EnsureSinistreColumns")]
    public partial class EnsureSinistreColumns : Migration
    {
        private static readonly (string Nom, string Type)[] Colonnes =
        [
            ("CheminExpertiseBailleur", "nvarchar(500)"),
            ("CheminExpertiseLocataire", "nvarchar(500)"),
            ("CheminPVExpertise", "nvarchar(500)"),
            ("CompteurFicheIntervention", "nvarchar(100)"),
            ("ObjetReclamation", "nvarchar(max)"),
            ("ReferenceDossierDAG", "nvarchar(100)"),
            ("ReferenceFacture", "nvarchar(100)"),
            ("Site", "nvarchar(200)"),
        ];

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            foreach ((string nom, string type) in Colonnes)
            {
                migrationBuilder.Sql(
                    $"IF COL_LENGTH(N'dbo.Sinistre', N'{nom}') IS NULL ALTER TABLE [dbo].[Sinistre] ADD [{nom}] {type} NULL;");
            }
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Volontairement vide : les colonnes peuvent préexister à cette migration (et contenir des données).
        }
    }
}
