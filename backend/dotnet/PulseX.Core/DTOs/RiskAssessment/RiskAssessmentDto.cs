namespace PulseX.Core.DTOs.RiskAssessment
{
    public class RiskAssessmentDto
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public decimal RiskScore { get; set; }
        public string RiskLevel { get; set; } = string.Empty;
        public string? Recommendations { get; set; }
        public DateTime AssessmentDate { get; set; }
        public string? CholesterolLevel { get; set; }
        public int? SleepHours { get; set; }
        public string? PhysicalActivity { get; set; }
        public string? AlcoholConsumption { get; set; }
        public bool FamilyHistory { get; set; }
    }
}
