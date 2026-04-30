using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace PulseX.API.Services
{
    /// <summary>
    /// HTTP bridge between the .NET Web API and the Python FastAPI AI service.
    /// Base URL configured via appsettings.json -> AiService:BaseUrl (default: http://localhost:8001).
    ///
    /// Endpoint mapping (.NET consumer name -> FastAPI route):
    ///   AnalyzeXRayAsync                -> POST /api/xray/analyze
    ///   UploadEcgAsync                  -> POST /api/ecg/upload
    ///   GetFraminghamRecommendationAsync-> POST /api/recommendation
    ///   GetRecommendationModelInfoAsync -> GET  /api/recommendation/model-info
    ///   ChatAsync                       -> POST /api/chat
    ///   HealthAsync                     -> GET  /health
    /// </summary>
    public class AiServiceClient
    {
        private readonly HttpClient _http;
        private readonly ILogger<AiServiceClient> _logger;
        private static readonly JsonSerializerOptions JsonOpts = new()
        {
            PropertyNameCaseInsensitive = true
        };

        public AiServiceClient(HttpClient http, ILogger<AiServiceClient> logger)
        {
            _http = http;
            _logger = logger;
        }

        public async Task<AiXRayResult?> AnalyzeXRayAsync(Stream fileStream, string fileName, string contentType)
        {
            using var content = new MultipartFormDataContent();
            var fileContent = new StreamContent(fileStream);
            fileContent.Headers.ContentType = new MediaTypeHeaderValue(contentType);
            content.Add(fileContent, "file", fileName);

            var resp = await _http.PostAsync("/api/xray/analyze", content);
            resp.EnsureSuccessStatusCode();
            var payload = await resp.Content.ReadFromJsonAsync<AiXRayResponse>(JsonOpts);
            return payload?.Result;
        }

        public async Task<string?> UploadEcgAsync(Stream fileStream, string fileName, string contentType, string? patientId = null)
        {
            using var content = new MultipartFormDataContent();
            var fileContent = new StreamContent(fileStream);
            fileContent.Headers.ContentType = new MediaTypeHeaderValue(contentType);
            content.Add(fileContent, "file", fileName);
            if (!string.IsNullOrEmpty(patientId))
                content.Add(new StringContent(patientId), "patient_id");

            var resp = await _http.PostAsync("/api/ecg/upload", content);
            resp.EnsureSuccessStatusCode();
            var payload = await resp.Content.ReadFromJsonAsync<AiEcgResponse>(JsonOpts);
            return payload?.FileId;
        }

        public async Task<AiRecommendationResult?> GetFraminghamRecommendationAsync(AiFraminghamRequest request)
        {
            var resp = await _http.PostAsJsonAsync("/api/recommendation", request);
            resp.EnsureSuccessStatusCode();
            var payload = await resp.Content.ReadFromJsonAsync<AiRecommendationResponse>(JsonOpts);
            return payload?.Result;
        }

        public async Task<AiChatResponse?> ChatAsync(AiChatRequest request)
        {
            var resp = await _http.PostAsJsonAsync("/api/chat", request);
            resp.EnsureSuccessStatusCode();
            return await resp.Content.ReadFromJsonAsync<AiChatResponse>(JsonOpts);
        }

        public async Task<JsonElement?> GetRecommendationModelInfoAsync()
        {
            try
            {
                return await _http.GetFromJsonAsync<JsonElement>("/api/recommendation/model-info");
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "AI model-info fetch failed");
                return null;
            }
        }

        public async Task<bool> IsHealthyAsync()
        {
            try
            {
                var resp = await _http.GetAsync("/health");
                return resp.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "AI health check failed");
                return false;
            }
        }
    }

    public class AiXRayResponse
    {
        public bool Success { get; set; }
        public AiXRayResult? Result { get; set; }
        public string? Error { get; set; }
    }

    public class AiXRayResult
    {
        public string? PredictedClass { get; set; }
        public string? Prediction { get; set; }
        public double Confidence { get; set; }
        public Dictionary<string, double>? Probabilities { get; set; }
        public string? Recommendation { get; set; }
        public string? Mode { get; set; }
    }

    public class AiEcgResponse
    {
        public bool Success { get; set; }
        public string? FileId { get; set; }
        public string? Message { get; set; }
        public string? Error { get; set; }
    }

    public class AiRecommendationResponse
    {
        public bool Success { get; set; }
        public AiRecommendationResult? Result { get; set; }
        public string? Error { get; set; }
        public string? Timestamp { get; set; }
    }

    public class AiRecommendationResult
    {
        public string? RiskLevel { get; set; }
        public double RiskScore { get; set; }
        public double Confidence { get; set; }
        public List<string>? Recommendations { get; set; }
        public string? AlertMessage { get; set; }
        public List<string>? RiskFactors { get; set; }
    }

    public class AiFraminghamRequest
    {
        public int Male { get; set; }
        public int Age { get; set; }
        public int Education { get; set; } = 1;
        public int CurrentSmoker { get; set; }
        public double CigsPerDay { get; set; }
        public int BPMeds { get; set; }
        public int PrevalentStroke { get; set; }
        public int PrevalentHyp { get; set; }
        public int Diabetes { get; set; }
        public double TotChol { get; set; }
        public double SysBP { get; set; }
        public double DiaBP { get; set; }
        public double BMI { get; set; }
        public double HeartRate { get; set; }
        public double Glucose { get; set; }
    }

    public class AiChatRequest
    {
        public string Message { get; set; } = string.Empty;
        public string? SessionId { get; set; }
        public Dictionary<string, object>? UserData { get; set; }
    }

    public class AiChatResponse
    {
        public string? Response { get; set; }
        public string? Type { get; set; }
        public string? RiskLevel { get; set; }
        public double? RiskScore { get; set; }
        public string? SessionId { get; set; }
    }
}
