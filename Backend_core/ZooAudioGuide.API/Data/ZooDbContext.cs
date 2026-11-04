using Microsoft.EntityFrameworkCore;
using ZooAudioGuide.API.Models;

namespace ZooAudioGuide.API.Data
{
    public class ZooDbContext : DbContext
    {
        // Constructor nhận cấu hình từ Program.cs truyền vào
        public ZooDbContext(DbContextOptions<ZooDbContext> options) : base(options)
        {
        }

        // Khai báo các DbSet tương đương với các bảng trong SQL Server
        public DbSet<Zone> Zones { get; set; } = null!;
        public DbSet<Animal> Animals { get; set; } = null!;
        public DbSet<Language> Languages { get; set; } = null!;
        public DbSet<AnimalContent> AnimalContents { get; set; } = null!;
        
        // Bổ sung DbSet cho bảng ghi nhận lượt truy cập
        public DbSet<ScanLog> ScanLogs { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Cấu hình rõ ràng khóa ngoại cho bảng AnimalContent và Language
            // (Vì tên cột là LanguageCode thay vì LanguageId, nên mình cần báo cho EF Core biết)
            modelBuilder.Entity<AnimalContent>()
                .HasOne(ac => ac.Language)
                .WithMany()
                .HasForeignKey(ac => ac.LanguageCode);

            // Cấu hình Index cho bảng SCAN_LOGS (Tối ưu hóa hiệu năng truy vấn cho Dashboard)
            modelBuilder.Entity<ScanLog>()
                .HasIndex(s => s.ScannedAt);
                
            modelBuilder.Entity<ScanLog>()
                .HasIndex(s => new { s.AnimalId, s.ScannedAt });
        }
    }
}