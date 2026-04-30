using PulseX.Core.Models;

namespace PulseX.Core.Interfaces
{
    public interface IActivityLogRepository
    {
        Task<IEnumerable<ActivityLog>> GetAllAsync();
        Task<IEnumerable<ActivityLog>> GetByUserIdAsync(int userId);
        Task<ActivityLog> AddAsync(ActivityLog log);
    }
}
