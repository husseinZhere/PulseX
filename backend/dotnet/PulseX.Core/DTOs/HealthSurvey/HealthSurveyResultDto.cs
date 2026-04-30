namespace PulseX.Core.DTOs.HealthSurvey
{
    /// <summary>
    /// Response after analyzing Health Survey
    /// </summary>
    public class HealthSurveyResultDto
    {
        public int Id { get; set; }
        public string RiskLevel { get; set; } = string.Empty; // "Low", "Medium", "High"
        public string RiskMessage { get; set; } = string.Empty;
        public bool RequiresFullAssessment { get; set; }
        public string RecommendationMessage { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        
        // Risk factors detected
        public List<string> RiskFactors { get; set; } = new();
    }
}
