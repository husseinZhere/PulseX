namespace PulseX.Core.DTOs.HealthData
{
    public class CreateHealthDataDto
    {
        public string DataType { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string? Unit { get; set; }
        public string? Notes { get; set; }
    }
}
