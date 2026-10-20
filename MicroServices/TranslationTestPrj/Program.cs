using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

class Program
{
    static readonly string apiKey = "AQ.Ab8RN6LDTQe4W0UuxN4fOYHLK8BRYFqAcS9xpRTJP6DCMFa0VA";
    static readonly HttpClient client = new HttpClient();

    static async Task Main(string[] args)
    {
        // Câu lệnh yêu cầu Gemini dịch thuật theo đúng mô tả[cite: 3]
        string textToTranslate = "Dịch sang tiếng Anh: Con voi là loài động vật lớn nhất trên cạn.";
        
        Console.WriteLine($"Đang gửi yêu cầu: \"{textToTranslate}\"...\n");
        await TranslateWithGemini(textToTranslate);
    }

    static async Task TranslateWithGemini(string prompt)
    {
        string url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key={apiKey}";

        // Cấu trúc JSON gửi lên API của Gemini
        var requestBody = new
        {
            contents = new[]
            {
                new { parts = new[] { new { text = prompt } } }
            }
        };

        string json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await client.PostAsync(url, content);
        string responseString = await response.Content.ReadAsStringAsync();

        if (response.IsSuccessStatusCode)
        {
            // Parse JSON để lấy nội dung text trả về
            using JsonDocument doc = JsonDocument.Parse(responseString);
            var translatedText = doc.RootElement
                                    .GetProperty("candidates")[0]
                                    .GetProperty("content")
                                    .GetProperty("parts")[0]
                                    .GetProperty("text")
                                    .GetString();
            
            Console.WriteLine("=> Kết quả dịch từ Gemini:");
            Console.WriteLine(translatedText?.Trim() ?? string.Empty);
        }
        else
        {
            Console.WriteLine("Lỗi khi gọi API: " + responseString);
        }
    }
}