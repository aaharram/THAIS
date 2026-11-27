using Design.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    // RMANew (DataEntryLocaux) : le local porte une image et un plan (colonnes Image et PlanLocal de la table Local).
    // Comme EnsureSinistreColumns : on n'ajoute que les colonnes absentes, une base qui les a déjà n'est pas modifiée.
    /// <inheritdoc />
    [DbContext(typeof(DbDesignContext))]
    [Migration("20261126100000_EnsureLocalImagePlan")]
    public partial class EnsureLocalImagePlan : Migration
    {
        private static readonly string[] Colonnes = ["Image", "PlanLocal"];

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            foreach (string nom in Colonnes)
            {
                migrationBuilder.Sql(
                    $"IF COL_LENGTH(N'dbo.Local', N'{nom}') IS NULL ALTER TABLE [dbo].[Local] ADD [{nom}] nvarchar(500) NULL;");
            }
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Volontairement vide : les colonnes peuvent préexister à cette migration (et contenir des données).
        }
    }
}
