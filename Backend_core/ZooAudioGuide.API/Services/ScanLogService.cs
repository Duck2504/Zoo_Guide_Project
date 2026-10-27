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
            var log = new ScanLog
            {
                AnimalId = dto.AnimalId,
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