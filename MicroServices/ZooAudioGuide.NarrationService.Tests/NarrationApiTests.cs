using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;

// Dịch vụ giả: không gọi API thật
public class FakeTranslator : ITranslator
{
    public int CallCount;
    public Task<string> TranslateAsync(string text, string targetLang)
    {
        CallCount++;
        return Task.FromResult("translated: " + text);
    }
}

public class FakeTts : ITtsService
{
    public Task<byte[]> SynthesizeAsync(string text, string lang)
        => Task.FromResult(new byte[] { 1, 2, 3 });
}

public class NarrationFactory : WebApplicationFactory<Program>
{
    public FakeTranslator Translator { get; } = new();

    protected override void ConfigureWebHost(Microsoft.AspNetCore.Hosting.IWebHostBuilder builder)
    {
        builder.ConfigureTestServices(services =>
        {
            services.AddSingleton<ITranslator>(Translator);
            services.AddSingleton<ITtsService>(new FakeTts());
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
    }

    // Text duy nhất mỗi lần chạy để cache cũ không làm sai kết quả
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

    [Fact]
    public async Task SameRequestTwice_UsesCache()
    {
        var body = new { text = UniqueText(), targetLang = "en" };
        var before = _factory.Translator.CallCount;

        await _client.PostAsJsonAsync("/api/narration", body);
        await _client.PostAsJsonAsync("/api/narration", body);

        Assert.Equal(before + 1, _factory.Translator.CallCount); // lần 2 lấy từ cache
    }
}