using System.Text.Json.Serialization;

namespace PulseX.Core.DTOs.Auth
{
    public class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        
        // ? Added: Return names separately for frontend
        [JsonPropertyName("first_name")]
        public string FirstName { get; set; } = string.Empty;
        
        [JsonPropertyName("last_name")]
        public string LastName { get; set; } = string.Empty;
        
        // ? Keep FullName for backward compatibility
        [JsonPropertyName("full_name")]
        public string FullName { get; set; } = string.Empty;
        
        public string Role { get; set; } = string.Empty;
        
        [JsonPropertyName("user_id")]
        public int UserId { get; set; }
    }
}
