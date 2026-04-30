using System.Text.Json.Serialization;

namespace PulseX.Core.DTOs.RiskAssessment
{
    public class CreateHeartRiskAssessmentDto
    {
        // Health Metrics
        [JsonPropertyName("cholesterol_level")]
        public string CholesterolLevel { get; set; } = string.Empty; // normal, borderline, high
        
        [JsonPropertyName("sleep_hours")]
        public string SleepHours { get; set; } = string.Empty; // <6, 6-8, >8
        
        [JsonPropertyName("alcohol_consumption")]
        public string AlcoholConsumption { get; set; } = string.Empty; // low, medium, high
        
        [JsonPropertyName("physical_activity")]
        public string PhysicalActivity { get; set; } = string.Empty; // low, medium, high
        
        // Medical History
        [JsonPropertyName("previous_heart_issues")]
        public bool PreviousHeartIssues { get; set; }
        
        [JsonPropertyName("family_history")]
        public bool FamilyHistory { get; set; }

        // Optional: Latest Vitals (auto-fetched from HealthData)
        [JsonPropertyName("heart_rate")]
        public decimal? HeartRate { get; set; }
        
        [JsonPropertyName("blood_pressure")]
        public string? BloodPressure { get; set; }
        
        [JsonPropertyName("blood_sugar")]
        public decimal? BloodSugar { get; set; }
    }

    public class HeartRiskAssessmentResultDto
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        
        // Risk Score & Classification
        public decimal RiskScore { get; set; }
        public string RiskLevel { get; set; } = string.Empty; // Low, Medium, High
        public string RiskCategory { get; set; } = string.Empty; // Stable, Monitor Closely, Immediate Action Required
        
        // Visual styling hints for frontend (Low=green, Medium=yellow/orange, High=red)
        public string StatusColor { get; set; } = string.Empty;
        public string StatusIcon { get; set; } = string.Empty; // success, warning, alert
        
        // AI Analysis
        public string Summary { get; set; } = string.Empty;
        public string Recommendation { get; set; } = string.Empty;
        public List<string> KeyFactors { get; set; } = new();
        
        // Dynamic AI Recommendations
        public List<AIRecommendationDto> Recommendations { get; set; } = new();
        
        // AI Metadata
        public bool IsAIGenerated { get; set; }
        public string? AIModelVersion { get; set; }
        public decimal? AIConfidenceScore { get; set; }
        public decimal ModelAccuracy { get; set; } = 98.5m;
        
        // Timestamps
        public DateTime AssessedAt { get; set; }
        
        // Input Data (for reference)
        public string CholesterolLevel { get; set; } = string.Empty;
        public string SleepHours { get; set; } = string.Empty;
        public string AlcoholConsumption { get; set; } = string.Empty;
        public string PhysicalActivity { get; set; } = string.Empty;
        public bool PreviousHeartIssues { get; set; }
        public bool FamilyHistory { get; set; }
    }
}
