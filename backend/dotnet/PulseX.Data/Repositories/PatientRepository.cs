using Microsoft.EntityFrameworkCore;
using PulseX.Core.Interfaces;
using PulseX.Core.Models;

namespace PulseX.Data.Repositories
{
    public class PatientRepository : IPatientRepository
    {
        private readonly ApplicationDbContext _context;

        public PatientRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Patient?> GetByIdAsync(int id)
        {
            return await _context.Patients
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Patient?> GetByUserIdAsync(int userId)
        {
            return await _context.Patients
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.UserId == userId);
        }

        public async Task<Patient?> GetLastPatientAsync()
        {
            return await _context.Patients
                .Where(p => p.PatientId != null && p.PatientId.StartsWith("PAT") && p.PatientId.Length == 6)
                .OrderByDescending(p => p.PatientId)
                .FirstOrDefaultAsync();
        }

        public async Task<Patient> AddAsync(Patient patient)
        {
            await _context.Patients.AddAsync(patient);
            await _context.SaveChangesAsync();
            return patient;
        }

        public async Task UpdateAsync(Patient patient)
        {
            _context.Patients.Update(patient);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Patient>> SearchPatientsAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                return new List<Patient>();
            }

            searchTerm = searchTerm.ToLower();

            return await _context.Patients
                .Include(p => p.User)
                .Where(p => 
                    p.User!.FullName.ToLower().Contains(searchTerm) ||
                    p.PatientId.ToLower().Contains(searchTerm))
                .Take(10)
                .ToListAsync();
        }
    }
}
