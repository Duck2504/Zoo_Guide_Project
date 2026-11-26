using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ZooAudioGuide.API.Migrations
{
    /// <inheritdoc />
    public partial class AddZoneName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Zones",
                type: "nvarchar(max)",
                nullable: true);

            // Tên hiển thị cho 5 khu đang có + bán kính 45 m.
            // 45 m: hai khu gần nhất (1 và 2) cách nhau 104 m, nên 2 x 45 + 10 m vùng đệm vẫn không chồng nhau.
            // Khớp cả Id lẫn ZoneCode: DB khác (dev/test) không có đúng khu đó thì câu lệnh không sửa gì.
            foreach (var z in ZoneData)
                migrationBuilder.Sql($"UPDATE Zones SET Name = N'{z.Name}', Radius = 45 WHERE Id = {z.Id} AND ZoneCode = N'{z.Code}';");
        }

        private static readonly (int Id, string Code, string Name, int OldRadius)[] ZoneData =
        [
            (1, "ZONE-LINHTRUONG", "Khu Linh trưởng", 20),
            (2, "ZONE-BOSAT", "Khu Bò sát", 15),
            (3, "ZONE-THUDU", "Khu Thú dữ", 25),
            (4, "ZONE-CHIMCHOC", "Khu Chim", 20),
            (5, "ZONE-MONGGUOC", "Khu Thú móng guốc", 30),
        ];

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            foreach (var z in ZoneData)
                migrationBuilder.Sql($"UPDATE Zones SET Radius = {z.OldRadius} WHERE Id = {z.Id} AND ZoneCode = N'{z.Code}';");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "Zones");
        }
    }
}
