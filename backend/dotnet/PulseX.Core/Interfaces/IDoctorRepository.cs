using PulseX.Core.Models;

namespace PulseX.Core.Interfaces
{
    public interface IDoctorRepository
    {
        Task<Doctor?> GetByIdAsync(int id);
        Task<Doctor?> GetByUserIdAsync(int userId);
        Task<IEnumerable<Doctor>> GetAllAsync();
        Task<Doctor> AddAsync(Doctor doctor);
        Task UpdateAsync(Doctor doctor);
    }
}
