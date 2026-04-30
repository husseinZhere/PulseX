namespace PulseX.Core.Models
{
    public class DoctorScheduleSlot
    {
        public int Id { get; set; }
        public int DoctorId { get; set; }

        // "Weekly" for recurring schedule, "Single" for a one-off slot
        public string SlotType { get; set; } = string.Empty;

        // Used when SlotType == "Weekly": 0=Sunday ... 6=Saturday (DayOfWeek enum value)
        public int? DayOfWeek { get; set; }

        // Used when SlotType == "Single": the specific date
        public DateTime? SlotDate { get; set; }

        // Egypt local time stored as "HH:mm" (e.g. "17:30")
        public string StartTime { get; set; } = string.Empty;
        public string EndTime   { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public Doctor Doctor { get; set; } = null!;
    }
}
