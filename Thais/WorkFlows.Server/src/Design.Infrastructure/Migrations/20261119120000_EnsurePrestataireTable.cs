using Design.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    // La table "Prestataire" n'a jamais été créée par une migration (la migration AddPropertyManagementPrestataireAssurance
    // part du principe qu'elle existe déjà, « créée hors dépôt »). Sur une base neuve (ELeaseCore), elle manque donc, et les
    // écrans Prestataires, Contrats, Charges, Bons de commande... échouent. Cette migration la crée seulement si elle est
    // absente : une base qui l'a déjà (SmartBuildingCore) n'est pas modifiée. Le modèle EF ne change pas (pas de Designer).
    /// <inheritdoc />
    [DbContext(typeof(DbDesignContext))]
    [Migration("20261119120000_EnsurePrestataireTable")]
    public partial class EnsurePrestataireTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF OBJECT_ID(N'[dbo].[Prestataire]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Prestataire] (
        [Numero] int NOT NULL IDENTITY(1,1),
        [Designation] nvarchar(200) NOT NULL,
        [Activite] nvarchar(max) NOT NULL,
        [TypePrestataire] nvarchar(max) NOT NULL,
        [Enseigne] nvarchar(max) NOT NULL,
        [Rc] nvarchar(max) NOT NULL,
        [Idf] nvarchar(max) NOT NULL,
        [Ice] nvarchar(max) NOT NULL,
        [Adresse] nvarchar(max) NOT NULL,
        [PostalCode] nvarchar(max) NOT NULL,
        [NoVille] int NULL,
        [Pays] nvarchar(max) NOT NULL,
        [Notes] nvarchar(max) NOT NULL,
        [AddUser] int NOT NULL,
        [AddDate] datetime2 NOT NULL,
        [ModUser] int NOT NULL,
        [ModDate] datetime2 NOT NULL,
        CONSTRAINT [PK_Prestataire] PRIMARY KEY ([Numero])
    );
END");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Volontairement vide : la table peut préexister à cette migration (et contenir des données).
        }
    }
}
