namespace PulseX.Core.DTOs.Auth
{
    public class VerifyOtpResponseDto
    {
        public bool IsValid { get; set; }
        public string ResetToken { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
