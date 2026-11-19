using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Design.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialUsersAuth : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MemberType",
                columns: table => new
                {
                    Numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    NoType = table.Column<int>(type: "int", nullable: false),
                    Code = table.Column<string>(type: "char(5)", unicode: false, fixedLength: true, maxLength: 5, nullable: false),
                    Title_E = table.Column<string>(type: "char(35)", unicode: false, fixedLength: true, maxLength: 35, nullable: false),
                    Title_F = table.Column<string>(type: "char(35)", unicode: false, fixedLength: true, maxLength: 35, nullable: false),
                    Title_S = table.Column<string>(type: "char(35)", unicode: false, fixedLength: true, maxLength: 35, nullable: false),
                    Title_P = table.Column<string>(type: "char(35)", unicode: false, fixedLength: true, maxLength: 35, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("MemberTypeNumero", x => x.Numero);
                });

            migrationBuilder.CreateTable(
                name: "User",
                columns: table => new
                {
                    numero = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AddUser = table.Column<int>(type: "int", nullable: false),
                    AddDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModUser = table.Column<int>(type: "int", nullable: false),
                    ModDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Username = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false),
                    Password = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: false),
                    FirstName = table.Column<string>(type: "nchar(30)", fixedLength: true, maxLength: 30, nullable: false),
                    LastName = table.Column<string>(type: "nchar(30)", fixedLength: true, maxLength: 30, nullable: false),
                    Name = table.Column<string>(type: "nchar(60)", fixedLength: true, maxLength: 60, nullable: false),
                    Company = table.Column<string>(type: "nchar(40)", fixedLength: true, maxLength: 40, nullable: false),
                    Email = table.Column<string>(type: "nchar(80)", fixedLength: true, maxLength: 80, nullable: false),
                    Address = table.Column<string>(type: "nchar(80)", fixedLength: true, maxLength: 80, nullable: false),
                    Code = table.Column<string>(type: "nchar(10)", fixedLength: true, maxLength: 10, nullable: false),
                    Tel = table.Column<string>(type: "nchar(20)", fixedLength: true, maxLength: 20, nullable: false),
                    Fax = table.Column<string>(type: "nchar(20)", fixedLength: true, maxLength: 20, nullable: false),
                    NoCountry = table.Column<int>(type: "int", nullable: false),
                    NoProvince = table.Column<int>(type: "int", nullable: false),
                    noCity = table.Column<int>(type: "int", nullable: true),
                    UrlPicture = table.Column<string>(type: "nchar(120)", fixedLength: true, maxLength: 120, nullable: false),
                    NoType = table.Column<int>(type: "int", nullable: false),
                    LastLogin = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastHit = table.Column<DateTime>(type: "datetime2", nullable: false),
                    NeedPasswordReset = table.Column<int>(type: "int", nullable: false),
                    Ipaddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Refreshtoken = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Refreshtokenexp = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Statut = table.Column<int>(type: "int", nullable: false),
                    Enabled = table.Column<bool>(type: "bit", nullable: false),
                    NoQuartDeTravail = table.Column<int>(type: "int", nullable: false),
                    NoTempsPause = table.Column<int>(type: "int", nullable: false),
                    DateDebutAbsence = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DateFinAbsence = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RaisonAbsence = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NoRaisonAbandon = table.Column<int>(type: "int", nullable: false),
                    SalaireHoraire = table.Column<decimal>(type: "decimal(18,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_User", x => x.numero);
                });

            migrationBuilder.InsertData(
                table: "MemberType",
                columns: new[] { "Numero", "AddDate", "AddUser", "Code", "ModDate", "ModUser", "NoType", "Title_E", "Title_F", "Title_P", "Title_S" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, "ADMIN", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, 1, "Contractor", "Contractor", "Contractor", "Contractor" },
                    { 2, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, "EMP", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, 2, "Employee", "Ouvrier", "Employee", "Employee" }
                });

            migrationBuilder.InsertData(
                table: "User",
                columns: new[] { "numero", "AddDate", "AddUser", "Address", "Code", "Company", "DateDebutAbsence", "DateFinAbsence", "Email", "Enabled", "Fax", "FirstName", "Ipaddress", "LastHit", "LastLogin", "LastName", "ModDate", "ModUser", "Name", "NeedPasswordReset", "noCity", "NoCountry", "NoProvince", "NoQuartDeTravail", "NoRaisonAbandon", "NoTempsPause", "NoType", "Password", "RaisonAbsence", "Refreshtoken", "Refreshtokenexp", "SalaireHoraire", "Statut", "Tel", "UrlPicture", "Username" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, "", "", "", null, null, "admin@local.dev", true, "", "Admin", null, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "User", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, "Admin User", 0, 0, 0, 0, 0, 0, 0, 1, "$2a$11$6OZ/8eRT8ibXOQisN8MT0.d3Dh9I4ZLjFH5yjfg/a26p/PmDjam3i", "", null, null, null, 0, "", "", "admin" },
                    { 2, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, "", "", "", null, null, "employee@local.dev", true, "", "Employee", null, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "User", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, "Employee User", 0, 0, 0, 0, 0, 0, 0, 2, "$2a$11$6OZ/8eRT8ibXOQisN8MT0.d3Dh9I4ZLjFH5yjfg/a26p/PmDjam3i", "", null, null, null, 0, "", "", "employee" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_User_Username",
                table: "User",
                column: "Username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MemberType");

            migrationBuilder.DropTable(
                name: "User");
        }
    }
}
