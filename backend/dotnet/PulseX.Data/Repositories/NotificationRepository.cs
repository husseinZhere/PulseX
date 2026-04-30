using Microsoft.EntityFrameworkCore;
using PulseX.Core.Interfaces;
using PulseX.Core.Models;

namespace PulseX.Data.Repositories
{
    public class NotificationRepository : INotificationRepository
    {
        private readonly ApplicationDbContext _context;

        public NotificationRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<DoctorNotification> AddAsync(DoctorNotification notification)
        {
            _context.DoctorNotifications.Add(notification);
            await _context.SaveChangesAsync();
            return notification;
        }

        public async Task<DoctorNotification?> GetByIdAsync(int id)
        {
            return await _context.DoctorNotifications
                .Include(n => n.RelatedPatient)
                    .ThenInclude(p => p!.User)
                .Include(n => n.RelatedAppointment)
                .FirstOrDefaultAsync(n => n.Id == id);
        }

        public async Task<IEnumerable<DoctorNotification>> GetByDoctorIdAsync(int doctorId)
        {
            return await _context.DoctorNotifications
                .Where(n => n.DoctorId == doctorId)
                .Include(n => n.RelatedPatient)
                    .ThenInclude(p => p!.User)
                .Include(n => n.RelatedAppointment)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<DoctorNotification>> GetUnreadByDoctorIdAsync(int doctorId)
        {
            return await _context.DoctorNotifications
                .Where(n => n.DoctorId == doctorId && !n.IsRead)
                .Include(n => n.RelatedPatient)
                    .ThenInclude(p => p!.User)
                .Include(n => n.RelatedAppointment)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        public async Task<int> GetUnreadCountAsync(int doctorId)
        {
            return await _context.DoctorNotifications
                .Where(n => n.DoctorId == doctorId && !n.IsRead)
                .CountAsync();
        }

        public async Task MarkAsReadAsync(int notificationId)
        {
            var notification = await _context.DoctorNotifications.FindAsync(notificationId);
            if (notification != null)
            {
                notification.IsRead = true;
                notification.ReadAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        public async Task MarkAllAsReadAsync(int doctorId)
        {
            var notifications = await _context.DoctorNotifications
                .Where(n => n.DoctorId == doctorId && !n.IsRead)
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
            var notification = await _context.DoctorNotifications.FindAsync(id);
            if (notification != null)
            {
                _context.DoctorNotifications.Remove(notification);
                await _context.SaveChangesAsync();
            }
        }
    }
}
