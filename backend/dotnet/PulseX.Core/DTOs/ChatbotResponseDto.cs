namespace PulseX.Core.DTOs
{
    public class ChatbotResponseDto
    {
        public string Response { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
