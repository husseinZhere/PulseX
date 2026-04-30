using Microsoft.EntityFrameworkCore;
using PulseX.Core.Interfaces;
using PulseX.Core.Models;

namespace PulseX.Data.Repositories
{
    public class PatientHealthInfoRepository : IPatientHealthInfoRepository
    {
        private readonly ApplicationDbContext _context;

        public PatientHealthInfoRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PatientHealthInfo?> GetByPatientIdAsync(int patientId)
        {
            return await _context.PatientHealthInfos
                .Include(h => h.Patient)
                .Where(h => h.PatientId == patientId)
                .OrderByDescending(h => h.CreatedAt)
                .FirstOrDefaultAsync();
        }

        public async Task<PatientHealthInfo?> GetLatestByPatientIdAsync(int patientId)
        {
            return await _context.PatientHealthInfos
                .Where(h => h.PatientId == patientId && h.IsActive)
                .OrderByDescending(h => h.CreatedAt)
                .FirstOrDefaultAsync();
        }

        public async Task<PatientHealthInfo> AddAsync(PatientHealthInfo healthInfo)
        {
            await _context.PatientHealthInfos.AddAsync(healthInfo);
            await _context.SaveChangesAsync();
            return healthInfo;
        }

        public async Task UpdateAsync(PatientHealthInfo healthInfo)
        {
            _context.PatientHealthInfos.Update(healthInfo);
            await _context.SaveChangesAsync();
        }
    }
}
