using Microsoft.EntityFrameworkCore;
using PulseX.Core.Interfaces;
using PulseX.Core.Models;
using PulseX.Data;

namespace PulseX.Data.Repositories
{
    public class RiskAssessmentRepository : IRiskAssessmentRepository
    {
        private readonly ApplicationDbContext _context;

        public RiskAssessmentRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<RiskAssessment?> GetByIdAsync(int id)
        {
            return await _context.RiskAssessments
                .Include(r => r.Patient)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<RiskAssessment?> GetLatestByPatientIdAsync(int patientId)
        {
            return await _context.RiskAssessments
                .Where(r => r.PatientId == patientId)
                .OrderByDescending(r => r.AssessedAt)
                .FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<RiskAssessment>> GetByPatientIdAsync(int patientId)
        {
            return await _context.RiskAssessments
                .Where(r => r.PatientId == patientId)
                .OrderByDescending(r => r.AssessedAt)
                .ToListAsync();
        }

        public async Task AddAsync(RiskAssessment riskAssessment)
        {
            await _context.RiskAssessments.AddAsync(riskAssessment);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(RiskAssessment riskAssessment)
        {
            _context.RiskAssessments.Update(riskAssessment);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var riskAssessment = await GetByIdAsync(id);
            if (riskAssessment != null)
            {
                _context.RiskAssessments.Remove(riskAssessment);
                await _context.SaveChangesAsync();
            }
        }
    }
}
