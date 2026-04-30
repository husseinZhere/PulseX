using Microsoft.EntityFrameworkCore;
using PulseX.Core.Interfaces;
using PulseX.Core.Models;

namespace PulseX.Data.Repositories
{
    public class ActivityLogRepository : IActivityLogRepository
    {
        private readonly ApplicationDbContext _context;

        public ActivityLogRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ActivityLog>> GetAllAsync()
        {
            return await _context.ActivityLogs
                .OrderByDescending(a => a.Timestamp)
                .ToListAsync();
        }

        public async Task<IEnumerable<ActivityLog>> GetByUserIdAsync(int userId)
        {
            return await _context.ActivityLogs
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.Timestamp)
                .ToListAsync();
        }

        public async Task<ActivityLog> AddAsync(ActivityLog log)
        {
            await _context.ActivityLogs.AddAsync(log);
            await _context.SaveChangesAsync();
            return log;
        }
    }
}
