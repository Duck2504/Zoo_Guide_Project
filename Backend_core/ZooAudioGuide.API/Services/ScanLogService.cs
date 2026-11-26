using ZooAudioGuide.API.DTOs;
using ZooAudioGuide.API.Models;
using ZooAudioGuide.API.Repositories;

namespace ZooAudioGuide.API.Services
{
    public class ScanLogService : IScanLogService
    {
        private readonly IScanLogRepository _repository;
        public ScanLogService(IScanLogRepository repository) => _repository = repository;

        // Chỉ các nguồn trang web thật sự gửi; chuỗi khác là gõ tay hoặc script nên không tính
        private static readonly HashSet<string> Sources = ["web", "web_home", "qr_home", "geo", "map", "zone"];
        private static readonly string[] BotMarks = ["bot", "spider", "crawl", "headless", "lighthouse"];
        // Cùng phiên mở lại cùng trang trong khoảng này (tải lại, quay lại) chỉ tính một lượt
        public static readonly TimeSpan RepeatWindow = TimeSpan.FromMinutes(5);

        public async Task RecordLogAsync(ScanLogCreateDto dto, string? userAgent)
        {
            if (!Sources.Contains(dto.Source) || string.IsNullOrWhiteSpace(dto.SessionId)) return;
            if (string.IsNullOrWhiteSpace(userAgent) || BotMarks.Any(m => userAgent.Contains(m, StringComparison.OrdinalIgnoreCase))) return;

            // QR in sẵn của con vật đã xóa vẫn tính lượt truy cập, chỉ bỏ liên kết con vật (tránh lỗi khóa ngoại)
            var animalId = dto.AnimalId is int id && await _repository.AnimalExistsAsync(id) ? dto.AnimalId : null;
            if (await _repository.HasRecentAsync(dto.SessionId, animalId, DateTime.UtcNow - RepeatWindow)) return;
            // User-Agent lấy từ header, không qua validate DTO được, nên cắt cho vừa cột 255
            if (userAgent?.Length > 255) userAgent = userAgent[..255];

            var log = new ScanLog
            {
                AnimalId = animalId,
                SessionId = dto.SessionId,
                Source = dto.Source,
                LanguageCode = dto.LanguageCode,
                UserAgent = userAgent,
                ScannedAt = DateTime.UtcNow
            };
            await _repository.AddLogAsync(log);
        }
    }
}