using ZooAudioGuide.API.Models; // Hoặc thư mục chứa entity ScanLog của em

namespace ZooAudioGuide.API.Repositories
{
    public interface IScanLogRepository
    {
        Task AddLogAsync(ScanLog log);
        Task<bool> AnimalExistsAsync(int animalId);
    }
}