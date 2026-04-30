using Microsoft.EntityFrameworkCore;
using PulseX.Core.Interfaces;
using PulseX.Core.Models;

namespace PulseX.Data.Repositories
{
    public class DoctorRatingRepository : IDoctorRatingRepository
    {
        private readonly ApplicationDbContext _context;

        public DoctorRatingRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<DoctorRating?> GetByIdAsync(int id)
        {
            return await _context.DoctorRatings
                .Include(r => r.Patient).ThenInclude(p => p.User)
                .Include(r => r.Doctor).ThenInclude(d => d.User)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<DoctorRating?> GetByAppointmentIdAsync(int appointmentId)
        {
            return await _context.DoctorRatings
                .Include(r => r.Patient).ThenInclude(p => p.User)
                .Include(r => r.Doctor).ThenInclude(d => d.User)
                .FirstOrDefaultAsync(r => r.AppointmentId == appointmentId);
        }

        public async Task<IEnumerable<DoctorRating>> GetByDoctorIdAsync(int doctorId)
        {
            return await _context.DoctorRatings
                .Include(r => r.Patient).ThenInclude(p => p.User)
                .Where(r => r.DoctorId == doctorId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<DoctorRating> AddAsync(DoctorRating rating)
        {
            await _context.DoctorRatings.AddAsync(rating);
            await _context.SaveChangesAsync();
            return rating;
        }

        public async Task<bool> HasRatedAppointmentAsync(int appointmentId)
        {
            return await _context.DoctorRatings
                .AnyAsync(r => r.AppointmentId == appointmentId);
        }
    }
}
