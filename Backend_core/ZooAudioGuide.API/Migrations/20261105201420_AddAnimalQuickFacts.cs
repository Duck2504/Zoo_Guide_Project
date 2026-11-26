using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ZooAudioGuide.API.Migrations
{
    /// <inheritdoc />
    public partial class AddAnimalQuickFacts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SCAN_LOGS_Animals_AnimalId",
                table: "SCAN_LOGS");

            // AnimalId nằm trong index này: SQL Server không cho đổi nullability khi index còn
            migrationBuilder.DropIndex(
                name: "IX_SCAN_LOGS_AnimalId_ScannedAt",
                table: "SCAN_LOGS");

            migrationBuilder.AlterColumn<int>(
                name: "AnimalId",
                table: "SCAN_LOGS",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.CreateIndex(
                name: "IX_SCAN_LOGS_AnimalId_ScannedAt",
                table: "SCAN_LOGS",
                columns: new[] { "AnimalId", "ScannedAt" });

            migrationBuilder.AddColumn<string>(
                name: "ConservationStatus",
                table: "Animals",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Diet",
                table: "Animals",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Habitat",
                table: "Animals",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "LifespanYears",
                table: "Animals",
                type: "int",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_SCAN_LOGS_Animals_AnimalId",
                table: "SCAN_LOGS",
                column: "AnimalId",
                principalTable: "Animals",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SCAN_LOGS_Animals_AnimalId",
                table: "SCAN_LOGS");

            // AnimalId nằm trong index này: SQL Server không cho đổi nullability khi index còn
            migrationBuilder.DropIndex(
                name: "IX_SCAN_LOGS_AnimalId_ScannedAt",
                table: "SCAN_LOGS");

            migrationBuilder.DropColumn(
                name: "ConservationStatus",
                table: "Animals");

            migrationBuilder.DropColumn(
                name: "Diet",
                table: "Animals");

            migrationBuilder.DropColumn(
                name: "Habitat",
                table: "Animals");

            migrationBuilder.DropColumn(
                name: "LifespanYears",
                table: "Animals");

            migrationBuilder.AlterColumn<int>(
                name: "AnimalId",
                table: "SCAN_LOGS",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SCAN_LOGS_AnimalId_ScannedAt",
                table: "SCAN_LOGS",
                columns: new[] { "AnimalId", "ScannedAt" });

            migrationBuilder.AddForeignKey(
                name: "FK_SCAN_LOGS_Animals_AnimalId",
                table: "SCAN_LOGS",
                column: "AnimalId",
                principalTable: "Animals",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
