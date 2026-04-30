using PulseX.Core.Models;

namespace PulseX.Core.Interfaces
{
    public interface IPrescriptionRepository
    {
        Task<Prescription> AddAsync(Prescription prescription);
        Task<Prescription?> GetByIdAsync(int id);
        Task<IEnumerable<Prescription>> GetByDoctorIdAsync(int doctorId);
        Task<IEnumerable<Prescription>> GetByPatientIdAsync(int patientId);
        Task<IEnumerable<Prescription>> GetByAppointmentIdAsync(int appointmentId);
        Task UpdateAsync(Prescription prescription);
        Task DeleteAsync(int id);
    }
}
