using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class PruneReferenceDataToRmaScope : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Categorie");

            migrationBuilder.DropTable(
                name: "Classe");

            migrationBuilder.DropTable(
                name: "Commune");

            migrationBuilder.DropTable(
                name: "Destinataire");

            migrationBuilder.DropTable(
                name: "ExigibilitePaiement");

            migrationBuilder.DropTable(
                name: "MailFinance");

            migrationBuilder.DropTable(
                name: "NatureAO");

            migrationBuilder.DropTable(
                name: "NatureCharge");

            migrationBuilder.DropTable(
                name: "NatureContrat");

            migrationBuilder.DropTable(
                name: "Notaire");

            migrationBuilder.DropTable(
                name: "Periodicity");

            migrationBuilder.DropTable(
                name: "Province");

            migrationBuilder.DropTable(
                name: "Region");

            migrationBuilder.DropTable(
                name: "SousCategorie");

            migrationBuilder.DropTable(
                name: "TauxTSC");

            migrationBuilder.DropTable(
                name: "TauxTVA");

            migrationBuilder.DropTable(
                name: "TypeRecette");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Categorie",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    Designation = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categorie", x => x.Numero);
                });

            migrationBuilder.CreateTable(
                name: "Classe",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    Designation = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Classe", x => x.Numero);
                });

            migrationBuilder.CreateTable(
                name: "Commune",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    Designation = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    NoProvince = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Commune", x => x.Numero);
                });

            migrationBuilder.CreateTable(
                name: "Destinataire",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    Designation = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Destinataire", x => x.Numero);
                });

            migrationBuilder.CreateTable(
                name: "ExigibilitePaiement",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    JoursExigibilite = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExigibilitePaiement", x => x.Numero);
                });

            migrationBuilder.CreateTable(
                name: "MailFinance",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    Designation = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MailFinance", x => x.Numero);
                });

            migrationBuilder.CreateTable(
                name: "NatureAO",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    Designation = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NatureAO", x => x.Numero);
                });

            migrationBuilder.CreateTable(
                name: "NatureCharge",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    Designation = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NatureCharge", x => x.Numero);
                });

            migrationBuilder.CreateTable(
                name: "NatureContrat",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    IsAssainissementFoncier = table.Column<bool>(type: "bit", nullable: false),
                    IsEtudeValorisation = table.Column<bool>(type: "bit", nullable: false),
                    IsGare = table.Column<bool>(type: "bit", nullable: false),
                    IsTelecom = table.Column<bool>(type: "bit", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    Titre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NatureContrat", x => x.Numero);
                });

            migrationBuilder.CreateTable(
                name: "Notaire",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    Adresse = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Ice = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Localite = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Mail = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    Nom = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Rc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Tele = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notaire", x => x.Numero);
                });

            migrationBuilder.CreateTable(
                name: "Periodicity",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    Designation = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Periodicity", x => x.Numero);
                });

            migrationBuilder.CreateTable(
                name: "Province",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    Designation = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    NoRegion = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Province", x => x.Numero);
                });

            migrationBuilder.CreateTable(
                name: "Region",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    Designation = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Region", x => x.Numero);
                });

            migrationBuilder.CreateTable(
                name: "SousCategorie",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    Designation = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    NoCategorie = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SousCategorie", x => x.Numero);
                });

            migrationBuilder.CreateTable(
                name: "TauxTSC",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    Designation = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    Taux = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TauxTSC", x => x.Numero);
                });

            migrationBuilder.CreateTable(
                name: "TauxTVA",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    Designation = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    Taux = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TauxTVA", x => x.Numero);
                });

            migrationBuilder.CreateTable(
                name: "TypeRecette",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    Designation = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    IsAssainissementFoncier = table.Column<bool>(type: "bit", nullable: false),
                    IsEtudeValorisation = table.Column<bool>(type: "bit", nullable: false),
                    IsFO = table.Column<bool>(type: "bit", nullable: false),
                    IsGSMR = table.Column<bool>(type: "bit", nullable: false),
                    IsGare = table.Column<bool>(type: "bit", nullable: false),
                    IsOT = table.Column<bool>(type: "bit", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TypeRecette", x => x.Numero);
                });
        }
    }
}
