using Microsoft.EntityFrameworkCore;
using PulseX.Core.Interfaces;
using PulseX.Core.Models;

namespace PulseX.Data.Repositories
{
    public class HealthDataRepository : IHealthDataRepository
    {
        private readonly ApplicationDbContext _context;

        public HealthDataRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<HealthData?> GetByIdAsync(int id)
        {
            return await _context.HealthData.FindAsync(id);
        }

        public async Task<IEnumerable<HealthData>> GetByPatientIdAsync(int patientId)
        {
            return await _context.HealthData
                .Where(h => h.PatientId == patientId)
                .OrderByDescending(h => h.RecordedAt)
                .ToListAsync();
        }

        public async Task<HealthData> AddAsync(HealthData healthData)
        {
            await _context.HealthData.AddAsync(healthData);
            await _context.SaveChangesAsync();
            return healthData;
        }
    }
}
