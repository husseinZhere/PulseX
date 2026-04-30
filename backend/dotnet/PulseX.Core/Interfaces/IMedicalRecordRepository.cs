using PulseX.Core.Models;

namespace PulseX.Core.Interfaces
{
    public interface IMedicalRecordRepository
    {
        Task<MedicalRecord?> GetByIdAsync(int id);
        Task<IEnumerable<MedicalRecord>> GetByPatientIdAsync(int patientId);
        Task<MedicalRecord> AddAsync(MedicalRecord record);
        Task DeleteAsync(int id);
    }
}
