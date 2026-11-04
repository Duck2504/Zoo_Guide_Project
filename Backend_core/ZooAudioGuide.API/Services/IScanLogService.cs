using ZooAudioGuide.API.DTOs;

namespace ZooAudioGuide.API.Services
{
    public interface IScanLogService
    {
        Task RecordLogAsync(ScanLogCreateDto dto, string? userAgent);
    }
}