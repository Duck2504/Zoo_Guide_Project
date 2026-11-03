using System.Linq;
using ZooAudioGuide.API.DTOs;
using ZooAudioGuide.API.Models;
using ZooAudioGuide.API.Repositories;
using ZooAudioGuide.API.Services;

namespace ZooAudioGuide.Tests;

[TestClass]
public sealed class ZoneAndScanLogTests
{
    [TestMethod]
    public async Task RecordLog_UnknownAnimalBecomesNull_KnownKept_UserAgentCut()
    {
        var repo = new FakeScanLogRepo(knownAnimalId: 5);
        var service = new ScanLogService(repo);

        await service.RecordLogAsync(new ScanLogCreateDto { AnimalId = 999, SessionId = "s" }, new string('u', 300));
        await service.RecordLogAsync(new ScanLogCreateDto { AnimalId = 5, SessionId = "s" }, "short");

        Assert.IsNull(repo.Logs[0].AnimalId);
        Assert.AreEqual(255, repo.Logs[0].UserAgent!.Length);
        Assert.AreEqual(5, repo.Logs[1].AnimalId);
        Assert.AreEqual("short", repo.Logs[1].UserAgent);
    }

    private sealed class FakeScanLogRepo(int knownAnimalId) : IScanLogRepository
    {
        public List<ScanLog> Logs = [];
        public Task AddLogAsync(ScanLog log) { Logs.Add(log); return Task.CompletedTask; }
        public Task<bool> AnimalExistsAsync(int animalId) => Task.FromResult(animalId == knownAnimalId);
    }
}
