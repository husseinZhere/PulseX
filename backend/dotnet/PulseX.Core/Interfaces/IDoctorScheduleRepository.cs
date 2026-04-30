using PulseX.Core.Models;

namespace PulseX.Core.Interfaces
{
    public interface IDoctorScheduleRepository
    {
        Task<IEnumerable<DoctorScheduleSlot>> GetByDoctorIdAsync(int doctorId);
        Task<DoctorScheduleSlot?> GetByIdAsync(int id);
        Task<DoctorScheduleSlot> AddAsync(DoctorScheduleSlot slot);
        Task AddRangeAsync(IEnumerable<DoctorScheduleSlot> slots);
        Task DeleteAsync(int id);
        Task DeleteWeeklyByDoctorIdAsync(int doctorId);
    }
}
