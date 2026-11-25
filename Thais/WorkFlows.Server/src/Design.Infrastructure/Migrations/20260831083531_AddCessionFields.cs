using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCessionFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Acquereur",
                table: "Local",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateEnregistrementContratVente",
                table: "Local",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateReglementCession",
                table: "Local",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateSignatureContratVente",
                table: "Local",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateSignaturePromesseVente",
                table: "Local",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "EncaissementRecuCession",
                table: "Local",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PrixCession",
                table: "Local",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PromesseContratVente",
                table: "Local",
                type: "nvarchar(260)",
                maxLength: 260,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Vendu",
                table: "Local",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Acquereur",
                table: "Building",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateEnregistrementContratVente",
                table: "Building",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateReglementCession",
                table: "Building",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateSignatureContratVente",
                table: "Building",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateSignaturePromesseVente",
                table: "Building",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "EncaissementRecuCession",
                table: "Building",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Observation",
                table: "Building",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PrixCession",
                table: "Building",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PromesseContratVente",
                table: "Building",
                type: "nvarchar(260)",
                maxLength: 260,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ValeurRealisation",
                table: "Building",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Vendu",
                table: "Building",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Acquereur",
                table: "Local");

            migrationBuilder.DropColumn(
                name: "DateEnregistrementContratVente",
                table: "Local");

            migrationBuilder.DropColumn(
                name: "DateReglementCession",
                table: "Local");

            migrationBuilder.DropColumn(
                name: "DateSignatureContratVente",
                table: "Local");

            migrationBuilder.DropColumn(
                name: "DateSignaturePromesseVente",
                table: "Local");

            migrationBuilder.DropColumn(
                name: "EncaissementRecuCession",
                table: "Local");

            migrationBuilder.DropColumn(
                name: "PrixCession",
                table: "Local");

            migrationBuilder.DropColumn(
                name: "PromesseContratVente",
                table: "Local");

            migrationBuilder.DropColumn(
                name: "Vendu",
                table: "Local");

            migrationBuilder.DropColumn(
                name: "Acquereur",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "DateEnregistrementContratVente",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "DateReglementCession",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "DateSignatureContratVente",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "DateSignaturePromesseVente",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "EncaissementRecuCession",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "Observation",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "PrixCession",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "PromesseContratVente",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "ValeurRealisation",
                table: "Building");

            migrationBuilder.DropColumn(
                name: "Vendu",
                table: "Building");
        }
    }
}
