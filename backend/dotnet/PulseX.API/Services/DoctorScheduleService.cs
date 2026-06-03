using PulseX.Core.DTOs.Doctor;
using PulseX.Core.Interfaces;
using PulseX.Core.Models;
using PulseX.Core.Enums;

namespace PulseX.API.Services
{
    public class DoctorScheduleService
    {
        private readonly IDoctorScheduleRepository _scheduleRepository;
        private readonly IDoctorRepository _doctorRepository;
        private readonly ILogger<DoctorScheduleService> _logger;

        // Egypt Standard Time (UTC+2, no DST)
        private static readonly TimeZoneInfo EgyptTz =
            TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");

        private readonly IAppointmentRepository _appointmentRepository;

        public DoctorScheduleService(
            IDoctorScheduleRepository scheduleRepository,
            IDoctorRepository doctorRepository,
            ILogger<DoctorScheduleService> logger,
            IAppointmentRepository appointmentRepository)
        {
            _scheduleRepository = scheduleRepository;
            _doctorRepository = doctorRepository;
            _logger = logger;
            _appointmentRepository = appointmentRepository;
        }

        // ?? Doctor: Save/replace the full weekly recurring schedule ??????????
        public async Task<DoctorScheduleSummaryDto> SaveWeeklyScheduleAsync(int userId, SaveWeeklyScheduleDto dto)
        {
            var doctor = await _doctorRepository.GetByUserIdAsync(userId)
                ?? throw new Exception("Doctor not found");

            // Replace all existing weekly slots for this doctor
            await _scheduleRepository.DeleteWeeklyByDoctorIdAsync(doctor.Id);

            var newSlots = dto.Days
                .Where(d => !string.IsNullOrWhiteSpace(d.StartTime) && !string.IsNullOrWhiteSpace(d.EndTime))
                .Select(d => new DoctorScheduleSlot
                {
                    DoctorId  = doctor.Id,
                    SlotType  = "Weekly",
                    DayOfWeek = d.DayOfWeek,
                    StartTime = d.StartTime!,
                    EndTime   = d.EndTime!,
                    IsActive  = true,
                    CreatedAt = DateTime.UtcNow
                })
                .ToList();

            if (newSlots.Any())
                await _scheduleRepository.AddRangeAsync(newSlots);

            _logger.LogInformation("Weekly schedule saved for Doctor {DoctorId}: {Count} days", doctor.Id, newSlots.Count);

            return await BuildSummaryAsync(doctor.Id);
        }

        // ?? Doctor: Add a single one-off slot ????????????????????????????????
        public async Task<DoctorScheduleSummaryDto> AddSingleSlotAsync(int userId, AddSingleSlotDto dto)
        {
            var doctor = await _doctorRepository.GetByUserIdAsync(userId)
                ?? throw new Exception("Doctor not found");

            if (string.IsNullOrWhiteSpace(dto.StartTime) || string.IsNullOrWhiteSpace(dto.EndTime))
                throw new Exception("Start time and end time are required");

            if (dto.SlotDate.Date < DateTime.UtcNow.Date)
                throw new Exception("Cannot add a slot in the past");

            var slot = new DoctorScheduleSlot
            {
                DoctorId  = doctor.Id,
                SlotType  = "Single",
                SlotDate  = dto.SlotDate.Date,
                StartTime = dto.StartTime,
                EndTime   = dto.EndTime,
                IsActive  = true,
                CreatedAt = DateTime.UtcNow
            };

            await _scheduleRepository.AddAsync(slot);

            _logger.LogInformation("Single slot added for Doctor {DoctorId} on {Date}", doctor.Id, dto.SlotDate.Date);

            return await BuildSummaryAsync(doctor.Id);
        }

        // ?? Doctor: Delete a slot by ID ???????????????????????????????????????
        public async Task<DoctorScheduleSummaryDto> DeleteSlotAsync(int userId, int slotId)
        {
            var doctor = await _doctorRepository.GetByUserIdAsync(userId)
                ?? throw new Exception("Doctor not found");

            var slot = await _scheduleRepository.GetByIdAsync(slotId)
                ?? throw new Exception("Slot not found");

            if (slot.DoctorId != doctor.Id)
                throw new Exception("Unauthorized: slot does not belong to you");

            await _scheduleRepository.DeleteAsync(slotId);

            return await BuildSummaryAsync(doctor.Id);
        }

        // ?? Doctor: Get full schedule summary ????????????????????????????????
        public async Task<DoctorScheduleSummaryDto> GetScheduleAsync(int userId)
        {
            var doctor = await _doctorRepository.GetByUserIdAsync(userId)
                ?? throw new Exception("Doctor not found");

            return await BuildSummaryAsync(doctor.Id);
        }

        // ?? Patient: Get available time strings for a specific date ??????????
        public async Task<List<string>> GetAvailableTimesForDateAsync(int doctorId, DateTime date)
        {
            var result = await GetTimesWithBookingStatusAsync(doctorId, date);
            return result.Where(s => !s.IsBooked).Select(s => s.Time).ToList();
        }

        public async Task<List<(string Time, bool IsBooked)>> GetTimesWithBookingStatusAsync(int doctorId, DateTime date)
        {
            var slots = await _scheduleRepository.GetByDoctorIdAsync(doctorId);
            var slotList = slots.ToList();

            var times = new List<string>();
            var dow = (int)date.DayOfWeek;

            // Weekly = work hours → expand each StartTime–EndTime range into
            // hourly bookable slots (09:00, 10:00, … up to but excluding EndTime).
            foreach (var s in slotList.Where(s => s.SlotType == "Weekly" && s.DayOfWeek == dow))
            {
                times.AddRange(ExpandToHourlySlots(s.StartTime, s.EndTime));
            }

            // Single = specific one-off slot at its StartTime.
            times.AddRange(
                slotList
                    .Where(s => s.SlotType == "Single" && s.SlotDate.HasValue && s.SlotDate.Value.Date == date.Date)
                    .Select(s => s.StartTime));

            var allTimes = times.Distinct().OrderBy(t => t).ToList();

            // Get booked appointments for this doctor on this date
            var allAppointments = await _appointmentRepository.GetByDoctorIdAsync(doctorId);
            var bookedTimes = allAppointments
                .Where(a => a.AppointmentDate.Date == date.Date &&
                            a.Status != AppointmentStatus.Cancelled)
                .Select(a => a.AppointmentDate.ToString("HH:mm"))
                .ToHashSet();

            return allTimes
                .Select(t => (Time: t, IsBooked: bookedTimes.Contains(t)))
                .ToList();
        }

        // Expand a "HH:mm" work-hours range into hourly slot start times.
        // e.g. 09:00–12:00 → ["09:00","10:00","11:00"]. Falls back to just the
        // start time when the range is empty/invalid or under an hour.
        private static IEnumerable<string> ExpandToHourlySlots(string startTime, string endTime)
        {
            if (!TimeSpan.TryParse(startTime, out var start))
                return new[] { startTime };
            if (!TimeSpan.TryParse(endTime, out var end) || end <= start)
                return new[] { startTime };

            var slots = new List<string>();
            for (var t = start; t < end; t = t.Add(TimeSpan.FromHours(1)))
            {
                slots.Add($"{t.Hours:D2}:{t.Minutes:D2}");
            }
            return slots.Count > 0 ? slots : new[] { startTime };
        }

        // ?? Helpers ??????????????????????????????????????????????????????????
        private async Task<DoctorScheduleSummaryDto> BuildSummaryAsync(int doctorId)
        {
            var slots = (await _scheduleRepository.GetByDoctorIdAsync(doctorId)).ToList();

            var todayEgypt = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, EgyptTz);
            var todayDow   = (int)todayEgypt.DayOfWeek;

            // Today's time strings from weekly slots
            var todayFromWeekly = slots
                .Where(s => s.SlotType == "Weekly" && s.DayOfWeek == todayDow)
                .Select(s => s.StartTime);

            // Today's time strings from single slots
            var todayFromSingle = slots
                .Where(s => s.SlotType == "Single" && s.SlotDate.HasValue && s.SlotDate.Value.Date == todayEgypt.Date)
                .Select(s => s.StartTime);

            var todaySlots = todayFromWeekly.Concat(todayFromSingle)
                .Distinct()
                .OrderBy(t => t)
                .ToList();

            return new DoctorScheduleSummaryDto
            {
                WeeklySlots = slots
                    .Where(s => s.SlotType == "Weekly")
                    .Select(MapToDto)
                    .ToList(),

                SingleSlots = slots
                    .Where(s => s.SlotType == "Single")
                    .Select(MapToDto)
                    .ToList(),

                TodaySlots      = todaySlots,
                TotalSlotsToday = todaySlots.Count
            };
        }

        private static ScheduleSlotDto MapToDto(DoctorScheduleSlot s) => new()
        {
            Id        = s.Id,
            SlotType  = s.SlotType,
            DayOfWeek = s.DayOfWeek,
            SlotDate  = s.SlotDate,
            StartTime = s.StartTime,
            EndTime   = s.EndTime
        };
    }
}
