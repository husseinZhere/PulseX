namespace PulseX.Core.Models
{
    public class PasswordResetToken
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty; // OTP (4 digits)
        public string? ResetToken { get; set; } // GUID for reset password step
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime ExpiresAt { get; set; } // OTP expiration (15 minutes)
        public DateTime? ResetTokenExpiresAt { get; set; } // ResetToken expiration (5 minutes)
        public bool IsUsed { get; set; } = false;

        public User? User { get; set; }
    }
}
