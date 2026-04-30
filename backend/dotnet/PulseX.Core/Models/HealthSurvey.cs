namespace PulseX.Core.Models
{
    /// <summary>
    /// Health Lifestyle Survey - Quick assessment before full risk analysis
    /// </summary>
    public class HealthSurvey
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        
        // Survey Questions
        public string CholesterolLevel { get; set; } = string.Empty; // "Normal", "Borderline", "High"
        public string SleepHours { get; set; } = string.Empty; // "< 6", "6-8", "> 8"
        public bool IsSmoker { get; set; }
        public string AlcoholConsumption { get; set; } = string.Empty; // "Low", "Medium", "High"
        public string PhysicalActivity { get; set; } = string.Empty; // "Low", "Medium", "High"
        public bool HasPreviousHeartIssues { get; set; }
        public bool HasFamilyHistory { get; set; }
        
        // AI Analysis Result
        public string RiskLevel { get; set; } = string.Empty; // "Low", "Medium", "High"
        public string RiskMessage { get; set; } = string.Empty;
        public bool RequiresFullAssessment { get; set; }
        
        // Metadata
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation
        public Patient Patient { get; set; } = null!;
    }
}
