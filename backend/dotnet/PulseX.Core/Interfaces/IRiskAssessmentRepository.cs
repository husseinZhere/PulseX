using PulseX.Core.Models;

namespace PulseX.Core.Interfaces
{
    public interface IRiskAssessmentRepository
    {
        Task<RiskAssessment?> GetByIdAsync(int id);
        Task<RiskAssessment?> GetLatestByPatientIdAsync(int patientId);
        Task<IEnumerable<RiskAssessment>> GetByPatientIdAsync(int patientId);
        Task AddAsync(RiskAssessment riskAssessment);
        Task UpdateAsync(RiskAssessment riskAssessment);
        Task DeleteAsync(int id);
    }
}
