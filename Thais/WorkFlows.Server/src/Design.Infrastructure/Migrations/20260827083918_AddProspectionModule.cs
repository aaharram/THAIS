using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProspectionModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Prospection",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Description = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    Typologie = table.Column<int>(type: "int", nullable: true),
                    TypeOperation = table.Column<int>(type: "int", nullable: true),
                    SituationProspection = table.Column<int>(type: "int", nullable: true),
                    NbBien = table.Column<int>(type: "int", nullable: false),
                    DateAjout = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DateAdjudication = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DateContrat = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Pv = table.Column<string>(type: "nvarchar(260)", maxLength: 260, nullable: true),
                    AvisBPP = table.Column<string>(type: "nvarchar(260)", maxLength: 260, nullable: true),
                    AvisDPAL = table.Column<string>(type: "nvarchar(260)", maxLength: 260, nullable: true),
                    SupportCA = table.Column<string>(type: "nvarchar(260)", maxLength: 260, nullable: true),
                    BusinesPlan = table.Column<string>(type: "nvarchar(260)", maxLength: 260, nullable: true),
                    Inactif = table.Column<bool>(type: "bit", nullable: false),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Prospection", x => x.Numero);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Prospection");
        }
    }
}
