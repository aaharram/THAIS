using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSinistreRMANewFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // NOTE : cette migration a été éditée à la main. La commande `dotnet ef migrations add`
            // avait généré un AddColumn pour 12 colonnes, mais 10 d'entre elles existent déjà
            // physiquement dans la base partagée (ajoutées par une migration
            // 20260902150143_AddSinistreCumulRefDagDevis absente de ce dépôt git - cf. commit
            // message). Seules AgentAyantReclame et NoSinistre sont réellement nouvelles ;
            // les 10 autres colonnes sont simplement mappées dans Sinistre.cs / SinistreConfiguration.cs
            // vers les colonnes existantes (CumulDossiersRemis, CheminExpertise*, DevisFacture, etc.)
            // sans instruction DDL correspondante ici.
            migrationBuilder.AddColumn<string>(
                name: "AgentAyantReclame",
                table: "Sinistre",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NoSinistre",
                table: "Sinistre",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AgentAyantReclame",
                table: "Sinistre");

            migrationBuilder.DropColumn(
                name: "NoSinistre",
                table: "Sinistre");
        }
    }
}
