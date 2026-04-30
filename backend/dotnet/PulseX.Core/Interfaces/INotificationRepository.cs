using PulseX.Core.Models;

namespace PulseX.Core.Interfaces
{
    public interface INotificationRepository
    {
        Task<DoctorNotification> AddAsync(DoctorNotification notification);
        Task<DoctorNotification?> GetByIdAsync(int id);
        Task<IEnumerable<DoctorNotification>> GetByDoctorIdAsync(int doctorId);
        Task<IEnumerable<DoctorNotification>> GetUnreadByDoctorIdAsync(int doctorId);
        Task<int> GetUnreadCountAsync(int doctorId);
        Task MarkAsReadAsync(int notificationId);
        Task MarkAllAsReadAsync(int doctorId);
        Task DeleteAsync(int id);
    }
}
