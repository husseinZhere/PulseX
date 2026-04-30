using PulseX.Core.Models;

namespace PulseX.Core.Interfaces
{
    public interface IDoctorRatingRepository
    {
        Task<DoctorRating?> GetByIdAsync(int id);
        Task<DoctorRating?> GetByAppointmentIdAsync(int appointmentId);
        Task<IEnumerable<DoctorRating>> GetByDoctorIdAsync(int doctorId);
        Task<DoctorRating> AddAsync(DoctorRating rating);
        Task<bool> HasRatedAppointmentAsync(int appointmentId);
    }
}
