using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SyncModelSnapshotSinistreCumul : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // No-op intentionnel : Sinistre.Cumul (int) existe déjà physiquement en base
            // (colonne préexistante, cf. AddSinistreRMANewFields). Cette migration ne fait
            // que resynchroniser le snapshot EF avec le modèle C# actuel (qui mappe
            // désormais Sinistre.Cumul au lieu de l'orpheline CumulDossiersRemis), sans
            // toucher au schéma physique.
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
