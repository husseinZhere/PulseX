using System.ComponentModel.DataAnnotations;

namespace PulseX.Core.DTOs.HealthSurvey
{
    /// <summary>
    /// DTO for submitting Health Lifestyle Survey
    /// </summary>
    public class SubmitHealthSurveyDto
    {
        [Required]
        public string CholesterolLevel { get; set; } = string.Empty; // "Normal", "Borderline", "High"
        
        [Required]
        public string SleepHours { get; set; } = string.Empty; // "< 6", "6-8", "> 8"
        
        [Required]
        public bool IsSmoker { get; set; }
        
        [Required]
        public string AlcoholConsumption { get; set; } = string.Empty; // "Low", "Medium", "High"
        
        [Required]
        public string PhysicalActivity { get; set; } = string.Empty; // "Low", "Medium", "High"
        
        [Required]
        public bool HasPreviousHeartIssues { get; set; }
        
        [Required]
        public bool HasFamilyHistory { get; set; }
    }
}
