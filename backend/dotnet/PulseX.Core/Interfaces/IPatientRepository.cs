using PulseX.Core.Models;

namespace PulseX.Core.Interfaces
{
    public interface IPatientRepository
    {
        Task<Patient?> GetByIdAsync(int id);
        Task<Patient?> GetByUserIdAsync(int userId);
        Task<Patient?> GetLastPatientAsync(); // Get last patient for ID generation
        Task<Patient> AddAsync(Patient patient);
        Task UpdateAsync(Patient patient);
        Task<List<Patient>> SearchPatientsAsync(string searchTerm);
    }
}
