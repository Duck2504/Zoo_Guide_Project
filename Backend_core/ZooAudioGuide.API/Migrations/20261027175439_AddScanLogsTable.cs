using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ZooAudioGuide.API.Migrations
{
    /// <inheritdoc />
    public partial class AddScanLogsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SCAN_LOGS",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AnimalId = table.Column<int>(type: "int", nullable: false),
                    ScannedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UserAgent = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    SessionId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Source = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    LanguageCode = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SCAN_LOGS", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SCAN_LOGS_Animals_AnimalId",
                        column: x => x.AnimalId,
                        principalTable: "Animals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SCAN_LOGS_AnimalId_ScannedAt",
                table: "SCAN_LOGS",
                columns: new[] { "AnimalId", "ScannedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_SCAN_LOGS_ScannedAt",
                table: "SCAN_LOGS",
                column: "ScannedAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SCAN_LOGS");
        }
    }
}
