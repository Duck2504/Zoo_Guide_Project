using ZooAudioGuide.API.DTOs;
using ZooAudioGuide.API.Models;
using ZooAudioGuide.API.Repositories;

namespace ZooAudioGuide.API.Services
{
    public class ScanLogService : IScanLogService
    {
        private readonly IScanLogRepository _repository;
        public ScanLogService(IScanLogRepository repository) => _repository = repository;

        public async Task RecordLogAsync(ScanLogCreateDto dto, string? userAgent)
        {
            // QR in sẵn của con vật đã xóa vẫn tính lượt truy cập, chỉ bỏ liên kết con vật (tránh lỗi khóa ngoại)
            var animalId = dto.AnimalId is int id && await _repository.AnimalExistsAsync(id) ? dto.AnimalId : null;
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