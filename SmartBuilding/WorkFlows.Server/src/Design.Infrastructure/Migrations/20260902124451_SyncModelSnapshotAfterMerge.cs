using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    // Migration "no-op" : ne fait que réaligner le snapshot EF après la fusion des travaux
    // en parallèle avec Adamou (résolution du conflit git du 2026-09-02). La table
    // "SyndicReunion" que le snapshot ne connaissait pas encore existe déjà en base
    // (créée par les migrations AddPropertyManagementTaxeSyndic et
    // AddSyndicReunionTypeAndReglee, déjà appliquées) - rien à créer physiquement ici.
    public partial class SyncModelSnapshotAfterMerge : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
