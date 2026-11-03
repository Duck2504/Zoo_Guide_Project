using Microsoft.Extensions.Logging.Abstractions;
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
        var gen = new NarrationGenerator(new FakeTranslator(), new FakeTts(), new FakeStore(), NullLogger<NarrationGenerator>.Instance);

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
    public async Task Generate_WithoutVietnameseScript_Throws()
    {
        var service = new AnimalService(new FakeRepo(new Animal { Id = 1 }));
        var gen = new NarrationGenerator(new FakeTranslator(), new FakeTts(), new FakeStore(), NullLogger<NarrationGenerator>.Instance);

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

    private sealed class FakeTranslator : ITranslator
    {
        public Task<string> TranslateAsync(string text, string lang) =>
            lang == "ko" ? throw new Exception("Gemini lỗi") : Task.FromResult($"{lang.ToUpper()}:{text}");
    }

    private sealed class FakeTts : ITtsService
    {
        public Task<byte[]> SynthesizeAsync(string text, string lang) => Task.FromResult(new byte[] { 1 });
    }

    private sealed class FakeStore : IAudioStore
    {
        public string GetPublicUrl(string path) => $"https://cdn/{path}";
        public Task<string?> TryReadTextAsync(string path) => Task.FromResult<string?>(null);
        public Task UploadAsync(string path, byte[] data, string contentType) => Task.CompletedTask;
        public Task DeleteAsync(IEnumerable<string> paths) => Task.CompletedTask;
        public Task<IReadOnlyList<string>> ListAsync(string folder) => Task.FromResult<IReadOnlyList<string>>([]);
    }
}
