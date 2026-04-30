using Microsoft.EntityFrameworkCore;
using PulseX.Core.Interfaces;
using PulseX.Core.Models;

namespace PulseX.Data.Repositories
{
    public class DoctorScheduleRepository : IDoctorScheduleRepository
    {
        private readonly ApplicationDbContext _context;

        public DoctorScheduleRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<DoctorScheduleSlot>> GetByDoctorIdAsync(int doctorId)
        {
            return await _context.DoctorScheduleSlots
                .Where(s => s.DoctorId == doctorId && s.IsActive)
                .OrderBy(s => s.SlotType)
                .ThenBy(s => s.DayOfWeek)
                .ThenBy(s => s.SlotDate)
                .ThenBy(s => s.StartTime)
                .ToListAsync();
        }

        public async Task<DoctorScheduleSlot?> GetByIdAsync(int id)
        {
            return await _context.DoctorScheduleSlots.FindAsync(id);
        }

        public async Task<DoctorScheduleSlot> AddAsync(DoctorScheduleSlot slot)
        {
            await _context.DoctorScheduleSlots.AddAsync(slot);
            await _context.SaveChangesAsync();
            return slot;
        }

        public async Task AddRangeAsync(IEnumerable<DoctorScheduleSlot> slots)
        {
            await _context.DoctorScheduleSlots.AddRangeAsync(slots);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var slot = await _context.DoctorScheduleSlots.FindAsync(id);
            if (slot != null)
            {
                _context.DoctorScheduleSlots.Remove(slot);
                await _context.SaveChangesAsync();
            }
        }

        public async Task DeleteWeeklyByDoctorIdAsync(int doctorId)
        {
            var weeklySlots = await _context.DoctorScheduleSlots
                .Where(s => s.DoctorId == doctorId && s.SlotType == "Weekly")
                .ToListAsync();

            if (weeklySlots.Any())
            {
                _context.DoctorScheduleSlots.RemoveRange(weeklySlots);
                await _context.SaveChangesAsync();
            }
        }
    }
}
