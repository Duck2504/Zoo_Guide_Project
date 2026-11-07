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

        // Danh sách cũng theo ngôn ngữ (dùng cho danh sách con vật trong khu)
        var list = await service.GetAllAnimalsAsync("en");
        Assert.AreEqual("EN:Con hổ", list.Single().ScriptText);
    }

    [TestMethod]
    public async Task Update_ChangesVietnameseRow_AndMarksAudioPending()
    {
        var animal = new Animal { Id = 3, ZoneId = 1, ScientificName = "Old" };
        animal.AnimalContents.Add(new AnimalContent { LanguageCode = "vi", LocalName = "Cũ", ScriptText = "Bài cũ", SyncStatus = "Done", AudioUrl = "u-vi" });
        animal.AnimalContents.Add(new AnimalContent { LanguageCode = "en", ScriptText = "Old text", SyncStatus = "Done", AudioUrl = "u-en" });
        var repo = new FakeRepo(animal);
        var service = new AnimalService(repo);

        var ok = await service.UpdateAnimalAsync(3, new() { ZoneId = 2, ScientificName = "New", LocalName = "Mới", ScriptText = "Bài mới", ConservationStatus = "EN", LifespanYears = 40 });

        Assert.IsTrue(ok);
        Assert.IsTrue(repo.Saved);
        Assert.AreEqual(2, animal.ZoneId);
        Assert.AreEqual("EN", animal.ConservationStatus);
        Assert.AreEqual(40, (await service.GetAnimalByIdAsync(3))!.LifespanYears);
        var vi = animal.AnimalContents.Single(c => c.LanguageCode == "vi");
        Assert.AreEqual("Mới", vi.LocalName);
        Assert.AreEqual("Bài mới", vi.ScriptText);
        Assert.IsTrue(animal.AnimalContents.All(c => c.SyncStatus == "Pending"));
        Assert.AreEqual("u-en", animal.AnimalContents.Single(c => c.LanguageCode == "en").AudioUrl);

        Assert.IsFalse(await service.UpdateAnimalAsync(999, new()));
    }

    [TestMethod]
    public async Task Generate_TranslatesName_ButKeepsNamesTheAdminEdited()
    {
        var animal = new Animal { Id = 8, ScientificName = "Pongo pygmaeus" };
        animal.AnimalContents.Add(new AnimalContent { LanguageCode = "vi", LocalName = "Đười ươi", ScriptText = "Bài" });
        animal.AnimalContents.Add(new AnimalContent { LanguageCode = "en", LocalName = "Đười ươi", ScriptText = "x" }); // bản chép cũ
        animal.AnimalContents.Add(new AnimalContent { LanguageCode = "ja", LocalName = "オランウータン", ScriptText = "x" }); // admin đã sửa
        var service = new AnimalService(new FakeRepo(animal));
        var gen = new FakeNarration { FailLangs = [] };

        await service.GenerateNarrationAsync(8, ["vi", "en", "ja", "ko"], gen);

        string Name(string l) => animal.AnimalContents.Single(c => c.LanguageCode == l).LocalName;
        Assert.AreEqual("Đười ươi", gen.LastName);
        Assert.AreEqual("Đười ươi", Name("vi"));
        Assert.AreEqual("en:Đười ươi", Name("en"));       // bản chép được thay
        Assert.AreEqual("オランウータン", Name("ja"));     // tên đã sửa giữ nguyên
        Assert.AreEqual("ko:Đười ươi", Name("ko"));       // dòng mới lấy tên đã dịch
    }

    [TestMethod]
    public async Task Generate_OldMicroservice_FallsBackToVietnameseName()
    {
        var animal = new Animal { Id = 9 };
        animal.AnimalContents.Add(new AnimalContent { LanguageCode = "vi", LocalName = "Hổ", ScriptText = "Bài" });
        var service = new AnimalService(new FakeRepo(animal));

        await service.GenerateNarrationAsync(9, ["en"], new FakeNarration { OldService = true });

        Assert.AreEqual("Hổ", animal.AnimalContents.Single(c => c.LanguageCode == "en").LocalName);
    }

    [TestMethod]
    public async Task Generate_WithoutVietnameseScript_Throws()
    {
        var service = new AnimalService(new FakeRepo(new Animal { Id = 1 }));
        var gen = new FakeNarration();

        await Assert.ThrowsExactlyAsync<InvalidOperationException>(() => service.GenerateNarrationAsync(1, ["vi"], gen));
    }

    [TestMethod]
    public async Task UpdateContent_SavesEditedTranslation_AndVoicesItWithoutTranslating()
    {
        var animal = new Animal { Id = 4 };
        animal.AnimalContents.Add(new AnimalContent { LanguageCode = "vi", LocalName = "Hổ", ScriptText = "Con hổ" });
        animal.AnimalContents.Add(new AnimalContent { LanguageCode = "en", LocalName = "Tiger", ScriptText = "Old", AudioUrl = "old", SyncStatus = "Done" });
        animal.AnimalContents.Add(new AnimalContent { LanguageCode = "ko", LocalName = "호랑이", ScriptText = "옛", AudioUrl = "old-ko", SyncStatus = "Done" });
        var repo = new FakeRepo(animal);
        var service = new AnimalService(repo);
        var gen = new FakeNarration();

        var r = await service.UpdateContentAsync(4, "en", new() { LocalName = " Bengal tiger ", ScriptText = " The tiger. " }, gen);

        Assert.AreEqual("DONE", r!.Status);
        Assert.IsTrue(gen.LastTextIsFinal);
        Assert.AreEqual("The tiger.", gen.LastText);
        var en = animal.AnimalContents.Single(c => c.LanguageCode == "en");
        Assert.AreEqual("Bengal tiger", en.LocalName);
        Assert.AreEqual("https://cdn/animals/4/en-x.mp3", en.AudioUrl);
        Assert.IsTrue(repo.Saved);

        // Đọc lỗi: chữ vẫn lưu, audio cũ giữ nhưng đánh dấu Failed
        await service.UpdateContentAsync(4, "ko", new() { LocalName = "호랑이", ScriptText = "새 글" }, gen);
        var ko = animal.AnimalContents.Single(c => c.LanguageCode == "ko");
        Assert.AreEqual("새 글", ko.ScriptText);
        Assert.AreEqual("Failed", ko.SyncStatus);

        Assert.IsNull(await service.UpdateContentAsync(4, "ja", new() { LocalName = "x", ScriptText = "y" }, gen));
        await Assert.ThrowsExactlyAsync<InvalidOperationException>(() => service.UpdateContentAsync(4, "vi", new() { LocalName = "x", ScriptText = "y" }, gen));

        var all = (await service.GetAllContentsAsync()).Single();
        CollectionAssert.AreEqual(new[] { "vi", "en", "ko" }, all.Contents.Select(c => c.LanguageCode).ToArray());
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
        public bool LastTextIsFinal;
        public string? LastText;

        public Task<(string? Url, string? Error)> UploadImageAsync(byte[] data, string contentType) => Task.FromResult<(string?, string?)>(("u", null));

        public string? LastName;
        public bool OldService; // microservice bản cũ: không trả tên đã dịch
        public string[] FailLangs = ["ko"];

        public Task<LangResult[]> GenerateAsync(int animalId, string text, string[] langs, bool textIsFinal = false, string? name = null, string? scientificName = null)
        {
            LastTextIsFinal = textIsFinal;
            LastText = text;
            LastName = name;
            return Task.FromResult(langs.Select(l => FailLangs.Contains(l)
                ? new LangResult(l, "FAILED", null, null, "Gemini lỗi")
                : new LangResult(l, "DONE", l == "vi" || textIsFinal ? text : $"{l.ToUpper()}:{text}", $"https://cdn/animals/{animalId}/{l}-x.mp3", null,
                                 name == null || l == "vi" || OldService ? null : $"{l}:{name}")).ToArray());
        }
    }
}
