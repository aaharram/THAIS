using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCpcImmobilierModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CpcImmobilier",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NoBuilding = table.Column<int>(type: "int", nullable: false),
                    Annee = table.Column<int>(type: "int", nullable: false),
                    RevenusImmobilierVie = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    RevenusImmobilierNonVie = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PlusValuesImmobilieresVie = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PlusValuesImmobilieresNonVie = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ReprisesImmobilieresLoyersVie = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ReprisesImmobilieresLoyersNonVie = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ChargesImmobilieresVie = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ChargesImmobilieresNonVie = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MoinsValuesImmobilieresVie = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MoinsValuesImmobilieresNonVie = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DotationsImmobilieresVie = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DotationsImmobilieresNonVie = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ProvisionsImmobilieresVie = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ProvisionsImmobilieresNonVie = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CpcImmobilier", x => x.Numero);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CpcImmobilier_NoBuilding_Annee",
                table: "CpcImmobilier",
                columns: new[] { "NoBuilding", "Annee" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CpcImmobilier");
        }
    }
}
