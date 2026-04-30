namespace PulseX.Core.Models
{
    public class RiskAssessment
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public decimal RiskScore { get; set; }
        public string RiskLevel { get; set; } = string.Empty; // Low, Medium, High
        public string? Summary { get; set; }
        public string? Recommendation { get; set; }
        public DateTime AssessedAt { get; set; } = DateTime.UtcNow;
        
        // Health Metrics (Professional Enums)
        public string CholesterolLevel { get; set; } = string.Empty; // normal, borderline, high
        public string SleepHours { get; set; } = string.Empty; // <6, 6-8, >8
        public string AlcoholConsumption { get; set; } = string.Empty; // low, medium, high
        public string PhysicalActivity { get; set; } = string.Empty; // low, medium, high
        
        // Medical History
        public bool PreviousHeartIssues { get; set; }
        public bool FamilyHistory { get; set; }

        // AI-Generated Dynamic Fields
        public string? AIModelVersion { get; set; } // Version of AI model used
        public decimal? AIConfidenceScore { get; set; } // AI confidence percentage
        public string? RecommendationsJson { get; set; } // JSON array of dynamic recommendations from AI
        public string? KeyFactorsJson { get; set; } // JSON array of key risk factors identified by AI
        public string? RiskCategory { get; set; } // Stable, Monitor Closely, Immediate Action Required
        public bool IsAIGenerated { get; set; } = false; // Flag to indicate if assessment is from external AI
        public string? AIRequestId { get; set; } // External AI request tracking ID
        public DateTime? AIProcessedAt { get; set; } // When AI processed the request

        // Navigation properties
        public Patient Patient { get; set; } = null!;
    }
}
