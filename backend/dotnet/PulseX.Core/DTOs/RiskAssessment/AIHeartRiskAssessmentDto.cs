using System.Text.Json.Serialization;

namespace PulseX.Core.DTOs.RiskAssessment
{
    /// <summary>
    /// DTO for receiving AI-generated heart risk assessment results from external AI service
    /// </summary>
    public class AIHeartRiskResponseDto
    {
        // Risk Score & Classification
        [JsonPropertyName("risk_score")]
        public decimal RiskScore { get; set; }
        
        [JsonPropertyName("risk_level")]
        public string RiskLevel { get; set; } = string.Empty; // Low, Medium, High
        
        [JsonPropertyName("risk_category")]
        public string RiskCategory { get; set; } = string.Empty; // Stable, Monitor Closely, Immediate Action Required
        
        // AI-Generated Summary
        [JsonPropertyName("summary")]
        public string Summary { get; set; } = string.Empty;
        
        // Dynamic Recommendations from AI
        [JsonPropertyName("recommendations")]
        public List<AIRecommendationDto> Recommendations { get; set; } = new();
        
        // Key Risk Factors identified by AI
        [JsonPropertyName("key_factors")]
        public List<AIKeyFactorDto> KeyFactors { get; set; } = new();
        
        // AI Metadata
        [JsonPropertyName("model_version")]
        public string? ModelVersion { get; set; }
        
        [JsonPropertyName("confidence_score")]
        public decimal? ConfidenceScore { get; set; }
        
        [JsonPropertyName("request_id")]
        public string? RequestId { get; set; }
        
        [JsonPropertyName("processed_at")]
        public DateTime? ProcessedAt { get; set; }
    }

    /// <summary>
    /// Individual recommendation from AI
    /// </summary>
    public class AIRecommendationDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }
        
        [JsonPropertyName("type")]
        public string Type { get; set; } = string.Empty; // Medical, Lifestyle, Diet, Exercise, Sleep, Monitoring
        
        [JsonPropertyName("priority")]
        public string Priority { get; set; } = string.Empty; // Urgent, High, Medium, Low
        
        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;
        
        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;
        
        [JsonPropertyName("action_required")]
        public bool ActionRequired { get; set; }
        
        [JsonPropertyName("timeframe")]
        public string? Timeframe { get; set; } // "Immediately", "Within 48 hours", "This week", "Monthly"
        
        [JsonPropertyName("icon")]
        public string? Icon { get; set; } // Icon name for UI
    }

    /// <summary>
    /// Key risk factor identified by AI
    /// </summary>
    public class AIKeyFactorDto
    {
        [JsonPropertyName("factor")]
        public string Factor { get; set; } = string.Empty;
        
        [JsonPropertyName("severity")]
        public string Severity { get; set; } = string.Empty; // Low, Medium, High, Critical
        
        [JsonPropertyName("impact_score")]
        public decimal? ImpactScore { get; set; }
        
        [JsonPropertyName("description")]
        public string? Description { get; set; }
    }

    /// <summary>
    /// DTO for sending patient data to external AI service for assessment
    /// </summary>
    public class AIHeartRiskRequestDto
    {
        [JsonPropertyName("patient_id")]
        public int PatientId { get; set; }
        
        [JsonPropertyName("patient_age")]
        public int? PatientAge { get; set; }
        
        [JsonPropertyName("patient_gender")]
        public string? PatientGender { get; set; }
        
        // Health Metrics
        [JsonPropertyName("cholesterol_level")]
        public string CholesterolLevel { get; set; } = string.Empty;
        
        [JsonPropertyName("sleep_hours")]
        public string SleepHours { get; set; } = string.Empty;
        
        [JsonPropertyName("alcohol_consumption")]
        public string AlcoholConsumption { get; set; } = string.Empty;
        
        [JsonPropertyName("physical_activity")]
        public string PhysicalActivity { get; set; } = string.Empty;
        
        // Medical History
        [JsonPropertyName("previous_heart_issues")]
        public bool PreviousHeartIssues { get; set; }
        
        [JsonPropertyName("family_history")]
        public bool FamilyHistory { get; set; }
        
        // Latest Vitals
        [JsonPropertyName("heart_rate")]
        public decimal? HeartRate { get; set; }
        
        [JsonPropertyName("blood_pressure_systolic")]
        public int? BloodPressureSystolic { get; set; }
        
        [JsonPropertyName("blood_pressure_diastolic")]
        public int? BloodPressureDiastolic { get; set; }
        
        [JsonPropertyName("blood_sugar")]
        public decimal? BloodSugar { get; set; }
        
        [JsonPropertyName("bmi")]
        public decimal? BMI { get; set; }
        
        // Request metadata
        [JsonPropertyName("request_timestamp")]
        public DateTime RequestTimestamp { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Enhanced result DTO that includes AI-generated dynamic recommendations
    /// for displaying on patient dashboard and history screens
    /// </summary>
    public class HeartRiskAssessmentDetailDto
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        
        // Risk Score & Classification
        public decimal RiskScore { get; set; }
        public string RiskLevel { get; set; } = string.Empty;
        public string RiskCategory { get; set; } = string.Empty;
        
        // Visual styling hints for frontend
        public string StatusColor { get; set; } = string.Empty; // green, yellow, orange, red
        public string StatusIcon { get; set; } = string.Empty; // success, warning, alert
        
        // AI Analysis
        public string Summary { get; set; } = string.Empty;
        
        // Dynamic Recommendations
        public List<AIRecommendationDto> Recommendations { get; set; } = new();
        
        // Key Risk Factors
        public List<AIKeyFactorDto> KeyFactors { get; set; } = new();
        
        // AI Metadata
        public bool IsAIGenerated { get; set; }
        public string? AIModelVersion { get; set; }
        public decimal? AIConfidenceScore { get; set; }
        
        // Timestamps
        public DateTime AssessedAt { get; set; }
        public DateTime? AIProcessedAt { get; set; }
        
        // Input Data (for reference/history)
        public string CholesterolLevel { get; set; } = string.Empty;
        public string SleepHours { get; set; } = string.Empty;
        public string AlcoholConsumption { get; set; } = string.Empty;
        public string PhysicalActivity { get; set; } = string.Empty;
        public bool PreviousHeartIssues { get; set; }
        public bool FamilyHistory { get; set; }
    }

    /// <summary>
    /// Summary DTO for dashboard display - shows latest risk assessment at a glance
    /// </summary>
    public class DashboardRiskSummaryDto
    {
        public int Id { get; set; }
        public decimal RiskScore { get; set; }
        public string RiskLevel { get; set; } = string.Empty;
        public string RiskCategory { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        
        // Top priority recommendation for dashboard
        public AIRecommendationDto? TopRecommendation { get; set; }
        
        // Visual styling
        public string StatusColor { get; set; } = string.Empty;
        public string StatusIcon { get; set; } = string.Empty;
        
        public DateTime AssessedAt { get; set; }
        public int TotalRecommendations { get; set; }
        public int UrgentRecommendations { get; set; }
    }

    /// <summary>
    /// DTO for risk assessment history listing
    /// </summary>
    public class RiskAssessmentHistoryDto
    {
        public int Id { get; set; }
        public decimal RiskScore { get; set; }
        public string RiskLevel { get; set; } = string.Empty;
        public string RiskCategory { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public string StatusColor { get; set; } = string.Empty;
        public DateTime AssessedAt { get; set; }
        public int RecommendationCount { get; set; }
        public bool IsAIGenerated { get; set; }
    }

    /// <summary>
    /// DTO for storing AI response directly (for backend processing)
    /// </summary>
    public class ProcessAIResultDto
    {
        [JsonPropertyName("patient_id")]
        public int PatientId { get; set; }
        
        [JsonPropertyName("ai_response")]
        public AIHeartRiskResponseDto AIResponse { get; set; } = null!;
        
        // Original input for auditing
        [JsonPropertyName("original_input")]
        public CreateHeartRiskAssessmentDto OriginalInput { get; set; } = null!;
    }
}
