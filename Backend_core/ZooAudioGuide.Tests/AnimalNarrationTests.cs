using ZooAudioGuide.API.Models;
using ZooAudioGuide.API.Repositories;
using ZooAudioGuide.API.Services;

namespace ZooAudioGuide.Tests;

[TestClass]
public sealed class AnimalNarrationTests
{
    [TestMethod]
    public async Task Generate_SavesTranslatedAudio_AndGetFallsBackToVietnamese()
    {
        var animal = new Animal { Id = 7, ScientificName = "Panthera tigris" };
        animal.AnimalContents.Add(new AnimalContent { LanguageCode = "vi", LocalName = "Hổ", ScriptText = "Con hổ" });
        var repo = new FakeRepo(animal);
        var service = new AnimalService(repo);
        var gen = new FakeNarration();

        var results = await service.GenerateNarrationAsync(7, ["vi", "en", "ko"], gen);

        Assert.IsNotNull(results);
        Assert.AreEqual("FAILED", results.Single(r => r.Lang == "ko").Status);
        Assert.IsTrue(repo.Saved);
        CollectionAssert.AreEqual(new[] { "en" }, repo.EnsuredLanguages);

        var en = await service.GetAnimalByIdAsync(7, "en");
        Assert.AreEqual("EN:Con hổ", en!.ScriptText);
        StringAssert.StartsWith(en.AudioUrl, "https://cdn/animals/7/en-");

        var vi = await service.GetAnimalByIdAsync(7, "vi");
        StringAssert.StartsWith(vi!.AudioUrl, "https://cdn/animals/7/vi-");

        // ko lỗi nên không có dòng ko → trả bản tiếng Việt
        var ko = await service.GetAnimalByIdAsync(7, "ko");
        Assert.AreEqual("Con hổ", ko!.ScriptText);
        Assert.AreEqual(vi.AudioUrl, ko.AudioUrl);
    }

    [TestMethod]
    public async Task Update_ChangesVietnameseRow_AndMarksAudioPending()
    {
        var animal = new Animal { Id = 3, ZoneId = 1, ScientificName = "Old" };
        animal.AnimalContents.Add(new AnimalContent { LanguageCode = "vi", LocalName = "Cũ", ScriptText = "Bài cũ", SyncStatus = "Done", AudioUrl = "u-vi" });
        animal.AnimalContents.Add(new AnimalContent { LanguageCode = "en", ScriptText = "Old text", SyncStatus = "Done", AudioUrl = "u-en" });
        var repo = new FakeRepo(animal);
        var service = new AnimalService(repo);

        var ok = await service.UpdateAnimalAsync(3, new() { ZoneId = 2, ScientificName = "New", LocalName = "Mới", ScriptText = "Bài mới" });

        Assert.IsTrue(ok);
        Assert.IsTrue(repo.Saved);
        Assert.AreEqual(2, animal.ZoneId);
        var vi = animal.AnimalContents.Single(c => c.LanguageCode == "vi");
        Assert.AreEqual("Mới", vi.LocalName);
        Assert.AreEqual("Bài mới", vi.ScriptText);
        Assert.IsTrue(animal.AnimalContents.All(c => c.SyncStatus == "Pending"));
        Assert.AreEqual("u-en", animal.AnimalContents.Single(c => c.LanguageCode == "en").AudioUrl);

        Assert.IsFalse(await service.UpdateAnimalAsync(999, new()));
    }

    [TestMethod]
    public async Task Generate_WithoutVietnameseScript_Throws()
    {
        var service = new AnimalService(new FakeRepo(new Animal { Id = 1 }));
        var gen = new FakeNarration();

        await Assert.ThrowsExactlyAsync<InvalidOperationException>(() => service.GenerateNarrationAsync(1, ["vi"], gen));
    }

    private sealed class FakeRepo(Animal animal) : IAnimalRepository
    {
        public bool Saved;
        public List<string> EnsuredLanguages = [];
        public Task<IEnumerable<Animal>> GetAllAsync() => Task.FromResult<IEnumerable<Animal>>([animal]);
        public Task<Animal?> GetByIdAsync(int id) => Task.FromResult(id == animal.Id ? animal : null);
        public Task AddAsync(Animal a) => Task.CompletedTask;
        public Task DeleteAsync(Animal a) => Task.CompletedTask;
        public Task SaveChangesAsync() { Saved = true; return Task.CompletedTask; }
        public Task EnsureLanguageAsync(string code) { EnsuredLanguages.Add(code); return Task.CompletedTask; }
    }

    // Giả microservice: ko lỗi, các ngôn ngữ khác trả bản dịch + link mp3
    private sealed class FakeNarration : INarrationClient
    {
        public Task<LangResult[]> GenerateAsync(int animalId, string text, string[] langs) =>
            Task.FromResult(langs.Select(l => l == "ko"
                ? new LangResult(l, "FAILED", null, null, "Gemini lỗi")
                : new LangResult(l, "DONE", l == "vi" ? text : $"{l.ToUpper()}:{text}", $"https://cdn/animals/{animalId}/{l}-x.mp3", null)).ToArray());
    }
}
