using Design.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    // RMANew (DataEntryLocation, « Pièces jointes ») : documents libres d'un bail.
    // Comme EnsureBailChampsRma : on ne crée la table que si elle est absente.
    /// <inheritdoc />
    [DbContext(typeof(DbDesignContext))]
    [Migration("20261126120000_EnsureBailPiecesJointes")]
    public partial class EnsureBailPiecesJointes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF OBJECT_ID(N'[dbo].[BailPieceJointe]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[BailPieceJointe] (
        [Numero] int NOT NULL IDENTITY(1,1),
        [NoLocation] int NOT NULL,
        [FileName] nvarchar(260) NOT NULL,
        [PieceJointe] nvarchar(260) NOT NULL,
        [Taille] bigint NOT NULL,
        [AddUser] int NOT NULL,
        [AddDate] datetime2 NOT NULL,
        [ModUser] int NOT NULL,
        [ModDate] datetime2 NOT NULL,
        CONSTRAINT [PK_BailPieceJointe] PRIMARY KEY ([Numero])
    );
    CREATE INDEX [IX_BailPieceJointe_NoLocation] ON [dbo].[BailPieceJointe] ([NoLocation]);
END");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("IF OBJECT_ID(N'[dbo].[BailPieceJointe]', N'U') IS NOT NULL DROP TABLE [dbo].[BailPieceJointe];");
        }
    }
}
