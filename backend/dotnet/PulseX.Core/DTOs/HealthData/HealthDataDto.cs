namespace PulseX.Core.DTOs.HealthData
{
    public class HealthDataDto
    {
        public int Id { get; set; }
        public string DataType { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string? Unit { get; set; }
        public DateTime RecordedAt { get; set; }
        public string? Notes { get; set; }
    }
}
