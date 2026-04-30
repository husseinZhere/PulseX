using PulseX.Core.DTOs.Notification;
using PulseX.Core.Interfaces;
using PulseX.Core.Models;

namespace PulseX.API.Services
{
    public class NotificationService
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(
            INotificationRepository notificationRepository,
            IPatientRepository patientRepository,
            ILogger<NotificationService> logger)
        {
            _notificationRepository = notificationRepository;
            _patientRepository = patientRepository;
            _logger = logger;
        }

        // Get all notifications for doctor
        public async Task<DoctorNotificationsResponseDto> GetDoctorNotificationsAsync(int doctorId)
        {
            var notifications = await _notificationRepository.GetByDoctorIdAsync(doctorId);
            var unreadCount = await _notificationRepository.GetUnreadCountAsync(doctorId);

            return new DoctorNotificationsResponseDto
            {
                UnreadCount = unreadCount,
                Notifications = notifications.Select(n => new NotificationDto
                {
                    Id = n.Id,
                    DoctorId = n.DoctorId,
                    Type = n.Type,
                    Priority = n.Priority,
                    Title = n.Title,
                    Message = n.Message,
                    RelatedPatientId = n.RelatedPatientId,
                    PatientName = n.RelatedPatient?.User?.FullName,
                    RelatedAppointmentId = n.RelatedAppointmentId,
                    IsRead = n.IsRead,
                    CreatedAt = n.CreatedAt
                }).ToList()
            };
        }

        // Get unread notifications only
        public async Task<DoctorNotificationsResponseDto> GetUnreadNotificationsAsync(int doctorId)
        {
            var notifications = await _notificationRepository.GetUnreadByDoctorIdAsync(doctorId);
            var unreadCount = notifications.Count();

            return new DoctorNotificationsResponseDto
            {
                UnreadCount = unreadCount,
                Notifications = notifications.Select(n => new NotificationDto
                {
                    Id = n.Id,
                    DoctorId = n.DoctorId,
                    Type = n.Type,
                    Priority = n.Priority,
                    Title = n.Title,
                    Message = n.Message,
                    RelatedPatientId = n.RelatedPatientId,
                    PatientName = n.RelatedPatient?.User?.FullName,
                    RelatedAppointmentId = n.RelatedAppointmentId,
                    IsRead = n.IsRead,
                    CreatedAt = n.CreatedAt
                }).ToList()
            };
        }

        // Create AI Risk Alert
        public async Task<NotificationDto> CreateAIRiskAlertAsync(int doctorId, int patientId, decimal riskScore)
        {
            var patient = await _patientRepository.GetByIdAsync(patientId);
            var patientName = patient?.User?.FullName ?? "Unknown Patient";

            var notification = new DoctorNotification
            {
                DoctorId = doctorId,
                Type = "AIRiskAlert",
                Priority = "Urgent",
                Title = "?? AI High Risk Alert",
                Message = $"Patient {patientName} completed AI risk assessment with HIGH RISK score ({riskScore}%). Please review their profile immediately.",
                RelatedPatientId = patientId,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            await _notificationRepository.AddAsync(notification);

            _logger.LogInformation($"AI Risk Alert created for Doctor {doctorId}, Patient {patientId}");

            return new NotificationDto
            {
                Id = notification.Id,
                DoctorId = notification.DoctorId,
                Type = notification.Type,
                Priority = notification.Priority,
                Title = notification.Title,
                Message = notification.Message,
                RelatedPatientId = notification.RelatedPatientId,
                PatientName = patientName,
                IsRead = notification.IsRead,
                CreatedAt = notification.CreatedAt
            };
        }

        // Create Abnormal Vitals Alert
        public async Task<NotificationDto> CreateAbnormalVitalsAlertAsync(int doctorId, int patientId, string vitalType, string value)
        {
            var patient = await _patientRepository.GetByIdAsync(patientId);
            var patientName = patient?.User?.FullName ?? "Unknown Patient";

            var notification = new DoctorNotification
            {
                DoctorId = doctorId,
                Type = "AbnormalVitals",
                Priority = "High",
                Title = "?? Abnormal Vital Signs",
                Message = $"Alert: Patient {patientName} recorded abnormal {vitalType} reading ({value}) through their profile.",
                RelatedPatientId = patientId,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            await _notificationRepository.AddAsync(notification);

            return new NotificationDto
            {
                Id = notification.Id,
                DoctorId = notification.DoctorId,
                Type = notification.Type,
                Priority = notification.Priority,
                Title = notification.Title,
                Message = notification.Message,
                RelatedPatientId = notification.RelatedPatientId,
                PatientName = patientName,
                IsRead = notification.IsRead,
                CreatedAt = notification.CreatedAt
            };
        }

        // Create Urgent Message Alert
        public async Task<NotificationDto> CreateUrgentMessageAlertAsync(int doctorId, int patientId, int appointmentId, string messageContent)
        {
            var patient = await _patientRepository.GetByIdAsync(patientId);
            var patientName = patient?.User?.FullName ?? "Unknown Patient";

            var notification = new DoctorNotification
            {
                DoctorId = doctorId,
                Type = "UrgentMessage",
                Priority = "Urgent",
                Title = "?? Urgent Patient Message",
                Message = $"Urgent message from {patientName}: \"{messageContent.Substring(0, Math.Min(50, messageContent.Length))}...\"",
                RelatedPatientId = patientId,
                RelatedAppointmentId = appointmentId,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            await _notificationRepository.AddAsync(notification);

            return new NotificationDto
            {
                Id = notification.Id,
                DoctorId = notification.DoctorId,
                Type = notification.Type,
                Priority = notification.Priority,
                Title = notification.Title,
                Message = notification.Message,
                RelatedPatientId = notification.RelatedPatientId,
                PatientName = patientName,
                RelatedAppointmentId = notification.RelatedAppointmentId,
                IsRead = notification.IsRead,
                CreatedAt = notification.CreatedAt
            };
        }

        public async Task<NotificationDto> CreateAppointmentBookedAsync(int doctorId, int patientId, int appointmentId, DateTime appointmentDate)
        {
            var patient = await _patientRepository.GetByIdAsync(patientId);
            var patientName = patient?.User?.FullName ?? "Unknown Patient";

            var notification = new DoctorNotification
            {
                DoctorId = doctorId,
                Type = "AppointmentBooked",
                Priority = "Normal",
                Title = "New Appointment Booked",
                Message = $"{patientName} booked an appointment on {appointmentDate:MMM dd, yyyy} at {appointmentDate:hh:mm tt}.",
                RelatedPatientId = patientId,
                RelatedAppointmentId = appointmentId,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            await _notificationRepository.AddAsync(notification);

            return new NotificationDto
            {
                Id = notification.Id,
                DoctorId = notification.DoctorId,
                Type = notification.Type,
                Priority = notification.Priority,
                Title = notification.Title,
                Message = notification.Message,
                RelatedPatientId = notification.RelatedPatientId,
                PatientName = patientName,
                RelatedAppointmentId = notification.RelatedAppointmentId,
                IsRead = notification.IsRead,
                CreatedAt = notification.CreatedAt
            };
        }

        public async Task<NotificationDto> CreateAppointmentCancelledAsync(int doctorId, int patientId, int appointmentId, DateTime appointmentDate)
        {
            var patient = await _patientRepository.GetByIdAsync(patientId);
            var patientName = patient?.User?.FullName ?? "Unknown Patient";

            var notification = new DoctorNotification
            {
                DoctorId = doctorId,
                Type = "AppointmentCancelled",
                Priority = "High",
                Title = "Appointment Cancelled",
                Message = $"{patientName} cancelled the appointment scheduled for {appointmentDate:MMM dd, yyyy} at {appointmentDate:hh:mm tt}.",
                RelatedPatientId = patientId,
                RelatedAppointmentId = appointmentId,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            await _notificationRepository.AddAsync(notification);

            return new NotificationDto
            {
                Id = notification.Id,
                DoctorId = notification.DoctorId,
                Type = notification.Type,
                Priority = notification.Priority,
                Title = notification.Title,
                Message = notification.Message,
                RelatedPatientId = notification.RelatedPatientId,
                PatientName = patientName,
                RelatedAppointmentId = notification.RelatedAppointmentId,
                IsRead = notification.IsRead,
                CreatedAt = notification.CreatedAt
            };
        }

        // Mark notification as read
        public async Task MarkAsReadAsync(int notificationId)
        {
            await _notificationRepository.MarkAsReadAsync(notificationId);
        }

        // Mark all notifications as read
        public async Task MarkAllAsReadAsync(int doctorId)
        {
            await _notificationRepository.MarkAllAsReadAsync(doctorId);
        }

        // Delete notification
        public async Task DeleteNotificationAsync(int notificationId)
        {
            await _notificationRepository.DeleteAsync(notificationId);
        }
    }
}
