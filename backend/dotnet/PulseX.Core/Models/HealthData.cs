namespace PulseX.Core.Models
{
    public class HealthData
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public string DataType { get; set; } = string.Empty; // e.g., "BloodPressure", "HeartRate", "Temperature"
        public string Value { get; set; } = string.Empty;
        public string? Unit { get; set; }
        public DateTime RecordedAt { get; set; } = DateTime.UtcNow;
        public string? Notes { get; set; }

        // Navigation properties
        public Patient Patient { get; set; } = null!;
    }
}
