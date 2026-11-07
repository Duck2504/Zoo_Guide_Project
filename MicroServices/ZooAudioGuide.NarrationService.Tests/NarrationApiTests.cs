using System.Collections.Concurrent;
using System.Net;
using System.Net.Http.Json;
using System.Text;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;

// ===== Các dịch vụ giả: không gọi Gemini, edge-tts hay Supabase thật =====
public class FakeTranslator : ITranslator
{
    public int CallCount;
    public Task<string> TranslateAsync(string text, string targetLang)
    {
        Interlocked.Increment(ref CallCount);
        return Task.FromResult("translated: " + text);
    }

    public int NameCallCount;
    public Task<string> TranslateNameAsync(string name, string? scientificName, string targetLang)
    {
        Interlocked.Increment(ref NameCallCount);
        return Task.FromResult($"**\"{targetLang}:{name}.\"**\nGiải thích thêm");   // kiểu Gemini hay trả
    }
}

public class FakeTts : ITtsService
{
    public Task<byte[]> SynthesizeAsync(string text, string lang)
        => Task.FromResult(new byte[] { 1, 2, 3 });
}

// Kho lưu trữ giả, lưu trong bộ nhớ
public class FakeStore : IAudioStore
{
    public ConcurrentDictionary<string, byte[]> Files = new();

    public string GetPublicUrl(string path) => "https://fake/" + path;

    public Task<string?> TryReadTextAsync(string path) =>
        Task.FromResult(Files.TryGetValue(path, out var b) ? Encoding.UTF8.GetString(b) : null);

    public Task UploadAsync(string path, byte[] data, string contentType)
    {
        Files[path] = data;
        return Task.CompletedTask;
    }

    public Task DeleteAsync(IEnumerable<string> paths)
    {
        foreach (var p in paths) Files.TryRemove(p, out _);
        return Task.CompletedTask;
    }

    public Task<IReadOnlyList<string>> ListAsync(string folder) =>
        Task.FromResult<IReadOnlyList<string>>(
            Files.Keys.Where(k => k.StartsWith(folder + "/"))
                      .Select(k => k[(folder.Length + 1)..])
                      .ToList());
}

public class NarrationFactory : WebApplicationFactory<Program>
{
    public FakeTranslator Translator { get; } = new();
    public FakeStore Store { get; } = new();

    protected override void ConfigureWebHost(Microsoft.AspNetCore.Hosting.IWebHostBuilder builder)
    {
        builder.UseSetting("Admin:ApiKey", "test-key");
        builder.ConfigureTestServices(services =>
        {
            services.AddSingleton<ITranslator>(Translator);
            services.AddSingleton<ITtsService>(new FakeTts());
            services.AddSingleton<IAudioStore>(Store);
        });
    }
}

public class NarrationApiTests : IClassFixture<NarrationFactory>
{
    private readonly NarrationFactory _factory;
    private readonly HttpClient _client;

    public NarrationApiTests(NarrationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
        _client.DefaultRequestHeaders.Add("X-Admin-Key", "test-key");
    }

    [Fact]
    public async Task Narration_WithoutKey_Returns401()
    {
        var anon = _factory.CreateClient();
        var res = await anon.PostAsJsonAsync("/api/narration", new { text = UniqueText(), targetLang = "vi" });
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
        var gen = await anon.PostAsJsonAsync("/api/narration/generate", new { animalId = 1, text = UniqueText(), targetLangs = new[] { "vi" } });
        Assert.Equal(HttpStatusCode.Unauthorized, gen.StatusCode);
    }

    [Fact]
    public async Task Health_WithoutKey_StillOk()
    {
        var res = await _factory.CreateClient().GetAsync("/health");
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
    }

    [Fact]
    public async Task TooLongText_Returns400()
    {
        var res = await _client.PostAsJsonAsync("/api/narration", new { text = new string('a', 5001), targetLang = "vi" });
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    private static string UniqueText() => "Con voi " + Guid.NewGuid();

    [Fact]
    public async Task Health_ReturnsOk()
    {
        var res = await _client.GetAsync("/health");
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        Assert.Equal("OK", await res.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task EmptyText_Returns400()
    {
        var res = await _client.PostAsJsonAsync("/api/narration", new { text = "  ", targetLang = "en" });
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task UnsupportedLanguage_Returns400()
    {
        var res = await _client.PostAsJsonAsync("/api/narration", new { text = UniqueText(), targetLang = "xx" });
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task Vietnamese_SkipsTranslation()
    {
        var before = _factory.Translator.CallCount;
        var res = await _client.PostAsJsonAsync("/api/narration", new { text = UniqueText(), targetLang = "vi" });

        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        Assert.Equal("audio/mpeg", res.Content.Headers.ContentType?.MediaType);
        Assert.Equal(before, _factory.Translator.CallCount);
    }

    [Fact]
    public async Task English_TranslatesAndReturnsMp3()
    {
        var before = _factory.Translator.CallCount;
        var res = await _client.PostAsJsonAsync("/api/narration", new { text = UniqueText(), targetLang = "en" });

        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        Assert.Equal("audio/mpeg", res.Content.Headers.ContentType?.MediaType);
        Assert.Equal(before + 1, _factory.Translator.CallCount);
    }

    // ===== Test cho endpoint /generate (đẩy lên đám mây) =====

    [Fact]
    public async Task Generate_InvalidRequest_Returns400()
    {
        var res = await _client.PostAsJsonAsync("/api/narration/generate",
            new { animalId = 0, text = UniqueText(), targetLangs = new[] { "en" } });
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task Generate_UploadsToCloud_AndSecondCallReusesIt()
    {
        var body = new { animalId = 99, text = UniqueText(), targetLangs = new[] { "en", "vi" } };
        var before = _factory.Translator.CallCount;

        var res1 = await _client.PostAsJsonAsync("/api/narration/generate", body);
        Assert.Equal(HttpStatusCode.OK, res1.StatusCode);
        Assert.Equal(before + 1, _factory.Translator.CallCount);   // chỉ "en" cần dịch
        Assert.Equal(4, _factory.Store.Files.Keys.Count(k => k.StartsWith("animals/99/")));  // 2 mp3 + 2 txt

        await _client.PostAsJsonAsync("/api/narration/generate", body);
        Assert.Equal(before + 1, _factory.Translator.CallCount);   // lần 2 dùng lại, không dịch nữa
    }

    [Fact]
    public async Task Image_StoredUnderServerName_OnlyImageTypes()
    {
        var png = new ByteArrayContent([0x89, 0x50, 0x4E, 0x47, 1, 2]);
        png.Headers.ContentType = new("image/png");
        var ok = await _client.PostAsync("/api/narration/image", png);
        Assert.Equal(HttpStatusCode.OK, ok.StatusCode);
        var url = (await ok.Content.ReadFromJsonAsync<Dictionary<string, string>>())!["url"];
        Assert.Matches(@"^https://fake/images/[0-9a-f]{32}\.png$", url);

        var html = new StringContent("<script>", Encoding.UTF8, "text/html");
        Assert.Equal(HttpStatusCode.BadRequest, (await _client.PostAsync("/api/narration/image", html)).StatusCode);

        var anon = _factory.CreateClient();
        Assert.Equal(HttpStatusCode.Unauthorized, (await anon.PostAsync("/api/narration/image", png)).StatusCode);
    }

    [Fact]
    public async Task Generate_WithName_TranslatesNameOnce_AndKeepsItWhenScriptChanges()
    {
        var name = "Hổ " + Guid.NewGuid().ToString()[..6];
        var before = _factory.Translator.NameCallCount;
        object Body(string text) => new { animalId = 97, text, targetLangs = new[] { "vi", "en" }, name, scientificName = "Panthera tigris" };

        var res = await _client.PostAsJsonAsync("/api/narration/generate", Body(UniqueText()));
        var json = await res.Content.ReadAsStringAsync();
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        Assert.Contains($"\"translatedName\":\"en:{name}\"", json);    // đã bỏ ** " . và dòng giải thích
        Assert.Equal(before + 1, _factory.Translator.NameCallCount);      // vi không dịch tên

        // Đổi bài: file mp3/txt cũ bị dọn, nhưng tên vẫn lấy từ kho, không gọi Gemini lại
        await _client.PostAsJsonAsync("/api/narration/generate", Body(UniqueText()));
        Assert.Equal(before + 1, _factory.Translator.NameCallCount);
        Assert.Single(_factory.Store.Files.Keys, k => k.StartsWith("animals/97/name-en-"));
    }

    [Theory]
    [InlineData("Tiger", "Tiger")]
    [InlineData("**\"Orangutan.\"**\nThe name means…", "Orangutan")]
    [InlineData("「トラ」。", "トラ")]
    [InlineData("  \n ", null)]
    public void CleanName_KeepsOnlyTheName(string raw, string? expected) =>
        Assert.Equal(expected, NarrationGenerator.CleanName(raw));

    [Fact]
    public async Task Generate_TextIsFinal_ReadsTextAsIs_WithoutTranslating()
    {
        var text = "The tiger " + Guid.NewGuid();
        var before = _factory.Translator.CallCount;

        var res = await _client.PostAsJsonAsync("/api/narration/generate",
            new { animalId = 98, text, targetLangs = new[] { "en" }, textIsFinal = true });

        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        Assert.Equal(before, _factory.Translator.CallCount);
        Assert.Contains(text, await res.Content.ReadAsStringAsync());
    }
}