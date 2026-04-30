using PulseX.Core.Models;

namespace PulseX.Core.Interfaces
{
    public interface IHealthDataRepository
    {
        Task<HealthData?> GetByIdAsync(int id);
        Task<IEnumerable<HealthData>> GetByPatientIdAsync(int patientId);
        Task<HealthData> AddAsync(HealthData healthData);
    }
}
