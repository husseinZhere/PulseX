using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PulseX.Core.DTOs.Auth
{
    public class RegisterPatientDto
    {
        // ? Changed: Split FullName into FirstName and LastName
        [Required(ErrorMessage = "First name is required")]
        public string FirstName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Last name is required")]
        public string LastName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required")]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "Phone number is required")]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required(ErrorMessage = "Gender is required")]
        public string Gender { get; set; } = string.Empty;

        [Required(ErrorMessage = "Date of birth is required")]
        public DateTime DateOfBirth { get; set; }

        // Helper property for internal use (not exposed in JSON)
        [JsonIgnore]
        public string FullName => $"{FirstName} {LastName}".Trim();
    }
}

