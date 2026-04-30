using PulseX.Core.Models;

namespace PulseX.Core.Interfaces
{
    public interface IPatientNotificationRepository
    {
        Task<PatientNotification> AddAsync(PatientNotification notification);
        Task<PatientNotification?> GetByIdAsync(int id);
        Task<IEnumerable<PatientNotification>> GetByPatientIdAsync(int patientId);
        Task<IEnumerable<PatientNotification>> GetUnreadByPatientIdAsync(int patientId);
        Task<int> GetUnreadCountAsync(int patientId);
        Task<int> GetTotalCountAsync(int patientId);
        Task<IEnumerable<PatientNotification>> GetByTypeAsync(int patientId, string type);
        Task<IEnumerable<PatientNotification>> GetRecentAsync(int patientId, int count = 10);
        Task MarkAsReadAsync(int notificationId);
        Task MarkAllAsReadAsync(int patientId);
        Task DeleteAsync(int id);
        Task DeleteAllByPatientIdAsync(int patientId);
    }
}
