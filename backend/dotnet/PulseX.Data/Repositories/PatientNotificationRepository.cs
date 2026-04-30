using Microsoft.EntityFrameworkCore;
using PulseX.Core.Interfaces;
using PulseX.Core.Models;

namespace PulseX.Data.Repositories
{
    public class PatientNotificationRepository : IPatientNotificationRepository
    {
        private readonly ApplicationDbContext _context;

        public PatientNotificationRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PatientNotification> AddAsync(PatientNotification notification)
        {
            _context.PatientNotifications.Add(notification);
            await _context.SaveChangesAsync();
            return notification;
        }

        public async Task<PatientNotification?> GetByIdAsync(int id)
        {
            return await _context.PatientNotifications
                .Include(n => n.RelatedRiskAssessment)
                .Include(n => n.RelatedAppointment)
                .Include(n => n.RelatedPrescription)
                .FirstOrDefaultAsync(n => n.Id == id);
        }

        public async Task<IEnumerable<PatientNotification>> GetByPatientIdAsync(int patientId)
        {
            return await _context.PatientNotifications
                .Where(n => n.PatientId == patientId)
                .Include(n => n.RelatedRiskAssessment)
                .Include(n => n.RelatedAppointment)
                .Include(n => n.RelatedPrescription)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<PatientNotification>> GetUnreadByPatientIdAsync(int patientId)
        {
            return await _context.PatientNotifications
                .Where(n => n.PatientId == patientId && !n.IsRead)
                .Include(n => n.RelatedRiskAssessment)
                .Include(n => n.RelatedAppointment)
                .Include(n => n.RelatedPrescription)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        public async Task<int> GetUnreadCountAsync(int patientId)
        {
            return await _context.PatientNotifications
                .Where(n => n.PatientId == patientId && !n.IsRead)
                .CountAsync();
        }

        public async Task<int> GetTotalCountAsync(int patientId)
        {
            return await _context.PatientNotifications
                .Where(n => n.PatientId == patientId)
                .CountAsync();
        }

        public async Task<IEnumerable<PatientNotification>> GetByTypeAsync(int patientId, string type)
        {
            return await _context.PatientNotifications
                .Where(n => n.PatientId == patientId && n.Type == type)
                .Include(n => n.RelatedRiskAssessment)
                .Include(n => n.RelatedAppointment)
                .Include(n => n.RelatedPrescription)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<PatientNotification>> GetRecentAsync(int patientId, int count = 10)
        {
            return await _context.PatientNotifications
                .Where(n => n.PatientId == patientId)
                .Include(n => n.RelatedRiskAssessment)
                .Include(n => n.RelatedAppointment)
                .Include(n => n.RelatedPrescription)
                .OrderByDescending(n => n.CreatedAt)
                .Take(count)
                .ToListAsync();
        }

        public async Task MarkAsReadAsync(int notificationId)
        {
            var notification = await _context.PatientNotifications.FindAsync(notificationId);
            if (notification != null)
            {
                notification.IsRead = true;
                notification.ReadAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        public async Task MarkAllAsReadAsync(int patientId)
        {
            var notifications = await _context.PatientNotifications
                .Where(n => n.PatientId == patientId && !n.IsRead)
                .ToListAsync();

            foreach (var notification in notifications)
            {
                notification.IsRead = true;
                notification.ReadAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var notification = await _context.PatientNotifications.FindAsync(id);
            if (notification != null)
            {
                _context.PatientNotifications.Remove(notification);
                await _context.SaveChangesAsync();
            }
        }

        public async Task DeleteAllByPatientIdAsync(int patientId)
        {
            var notifications = await _context.PatientNotifications
                .Where(n => n.PatientId == patientId)
                .ToListAsync();

            _context.PatientNotifications.RemoveRange(notifications);
            await _context.SaveChangesAsync();
        }
    }
}
