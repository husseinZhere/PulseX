namespace PulseX.Core.DTOs.RiskAssessment
{
    public class CreateRiskAssessmentDto
    {
        public int PatientId { get; set; }
        
        // Lifestyle & Health Behavior Data
        public string? CholesterolLevel { get; set; } // Low, Normal, Borderline, High
        public int? SleepHours { get; set; }
        public string? PhysicalActivity { get; set; } // Sedentary, Light, Moderate, Active
        public string? AlcoholConsumption { get; set; } // None, Light, Moderate, Heavy
        public bool FamilyHistory { get; set; }
    }
}
