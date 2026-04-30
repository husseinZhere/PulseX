namespace PulseX.Core.DTOs.Doctor
{
    // ?? Doctor-facing DTOs ??????????????????????????????????????????????????

    public class WeeklyScheduleDayDto
    {
        // 0=Sunday, 1=Monday … 6=Saturday
        public int DayOfWeek { get; set; }
        public string? StartTime { get; set; }
        public string? EndTime { get; set; }
    }

    public class SaveWeeklyScheduleDto
    {
        public List<WeeklyScheduleDayDto> Days { get; set; } = new();
    }

    public class AddSingleSlotDto
    {
        public DateTime SlotDate { get; set; }
        public string StartTime { get; set; } = string.Empty;
        public string EndTime { get; set; } = string.Empty;
    }

    public class ScheduleSlotDto
    {
        public int Id { get; set; }
        public string SlotType { get; set; } = string.Empty;
        public int? DayOfWeek { get; set; }
        public DateTime? SlotDate { get; set; }
        public string StartTime { get; set; } = string.Empty;
        public string EndTime { get; set; } = string.Empty;
    }

    public class DoctorScheduleSummaryDto
    {
        public List<ScheduleSlotDto> WeeklySlots { get; set; } = new();
        public List<ScheduleSlotDto> SingleSlots { get; set; } = new();
        public List<string> TodaySlots { get; set; } = new();
        public int TotalSlotsToday { get; set; }
    }

    // ?? Patient-facing DTOs (reuses existing AvailableSlotsDto / TimeSlotDto) ?
}
