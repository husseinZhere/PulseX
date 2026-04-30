using PulseX.Core.Models;

namespace PulseX.Core.Interfaces
{
    public interface IPatientHealthInfoRepository
    {
        Task<PatientHealthInfo?> GetByPatientIdAsync(int patientId);
        Task<PatientHealthInfo> AddAsync(PatientHealthInfo healthInfo);
        Task UpdateAsync(PatientHealthInfo healthInfo);
        Task<PatientHealthInfo?> GetLatestByPatientIdAsync(int patientId);
    }
}
