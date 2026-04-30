using PulseX.Core.DTOs.Notification;
using PulseX.Core.Interfaces;
using PulseX.Core.Models;

namespace PulseX.API.Services
{
    public class PatientNotificationService
    {
        private readonly IPatientNotificationRepository _notificationRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly ILogger<PatientNotificationService> _logger;

        public PatientNotificationService(
            IPatientNotificationRepository notificationRepository,
            IPatientRepository patientRepository,
            ILogger<PatientNotificationService> logger)
        {
            _notificationRepository = notificationRepository;
            _patientRepository = patientRepository;
            _logger = logger;
        }

        /// <summary>
        /// Get all notifications for a patient
        /// </summary>
        public async Task<PatientNotificationsResponseDto> GetPatientNotificationsAsync(int patientId)
        {
            var notifications = await _notificationRepository.GetByPatientIdAsync(patientId);
            var unreadCount = await _notificationRepository.GetUnreadCountAsync(patientId);
            var totalCount = await _notificationRepository.GetTotalCountAsync(patientId);

            return new PatientNotificationsResponseDto
            {
                UnreadCount = unreadCount,
                TotalCount = totalCount,
                Notifications = notifications.Select(MapToDto).ToList()
            };
        }

        /// <summary>
        /// Get unread notifications for a patient
        /// </summary>
        public async Task<PatientNotificationsResponseDto> GetUnreadNotificationsAsync(int patientId)
        {
            var notifications = await _notificationRepository.GetUnreadByPatientIdAsync(patientId);
            var unreadCount = notifications.Count();

            return new PatientNotificationsResponseDto
            {
                UnreadCount = unreadCount,
                TotalCount = unreadCount,
                Notifications = notifications.Select(MapToDto).ToList()
            };
        }

        /// <summary>
        /// Get recent notifications (for dashboard)
        /// </summary>
        public async Task<PatientNotificationsResponseDto> GetRecentNotificationsAsync(int patientId, int count = 5)
        {
            var notifications = await _notificationRepository.GetRecentAsync(patientId, count);
            var unreadCount = await _notificationRepository.GetUnreadCountAsync(patientId);
            var totalCount = await _notificationRepository.GetTotalCountAsync(patientId);

            return new PatientNotificationsResponseDto
            {
                UnreadCount = unreadCount,
                TotalCount = totalCount,
                Notifications = notifications.Select(MapToDto).ToList()
            };
        }

        /// <summary>
        /// Get notifications by type (e.g., HeartRiskAssessment)
        /// </summary>
        public async Task<PatientNotificationsResponseDto> GetNotificationsByTypeAsync(int patientId, string type)
        {
            var notifications = await _notificationRepository.GetByTypeAsync(patientId, type);
            var unreadCount = notifications.Count(n => !n.IsRead);

            return new PatientNotificationsResponseDto
            {
                UnreadCount = unreadCount,
                TotalCount = notifications.Count(),
                Notifications = notifications.Select(MapToDto).ToList()
            };
        }

        /// <summary>
        /// Create a heart risk assessment notification
        /// </summary>
        public async Task<PatientNotificationDto> CreateHeartRiskNotificationAsync(
            int patientId, 
            int riskAssessmentId, 
            string riskLevel, 
            decimal riskScore)
        {
            var (title, message, iconType, priority, statusColor) = GetRiskNotificationContent(riskLevel, riskScore);

            var notification = new PatientNotification
            {
                PatientId = patientId,
                Type = "HeartRiskAssessment",
                Priority = priority,
                Title = title,
                Message = message,
                RelatedRiskAssessmentId = riskAssessmentId,
                RiskLevel = riskLevel,
                ActionUrl = "/patient/heart-risk",
                IconType = iconType,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            await _notificationRepository.AddAsync(notification);
            _logger.LogInformation($"Heart risk notification created for Patient {patientId}, Assessment {riskAssessmentId}");

            var dto = MapToDto(notification);
            dto.StatusColor = statusColor;
            return dto;
        }

        /// <summary>
        /// Create a general health alert notification
        /// </summary>
        public async Task<PatientNotificationDto> CreateHealthAlertAsync(
            int patientId,
            string title,
            string message,
            string priority = "Normal",
            string? actionUrl = null)
        {
            var notification = new PatientNotification
            {
                PatientId = patientId,
                Type = "HealthAlert",
                Priority = priority,
                Title = title,
                Message = message,
                ActionUrl = actionUrl,
                IconType = GetIconTypeFromPriority(priority),
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            await _notificationRepository.AddAsync(notification);
            _logger.LogInformation($"Health alert created for Patient {patientId}: {title}");

            return MapToDto(notification);
        }

        /// <summary>
        /// Create an appointment reminder notification
        /// </summary>
        public async Task<PatientNotificationDto> CreateAppointmentReminderAsync(
            int patientId,
            int appointmentId,
            string doctorName,
            DateTime appointmentDate)
        {
            var notification = new PatientNotification
            {
                PatientId = patientId,
                Type = "AppointmentReminder",
                Priority = "Normal",
                Title = "Upcoming Appointment Reminder",
                Message = $"You have an appointment with Dr. {doctorName} on {appointmentDate:MMM dd, yyyy} at {appointmentDate:hh:mm tt}.",
                RelatedAppointmentId = appointmentId,
                ActionUrl = $"/appointments/{appointmentId}",
                IconType = "calendar",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            await _notificationRepository.AddAsync(notification);
            return MapToDto(notification);
        }

        public async Task<PatientNotificationDto> CreateAppointmentStatusAsync(
            int patientId,
            int appointmentId,
            string title,
            string message,
            string priority = "Normal")
        {
            var notification = new PatientNotification
            {
                PatientId = patientId,
                Type = "AppointmentStatus",
                Priority = priority,
                Title = title,
                Message = message,
                RelatedAppointmentId = appointmentId,
                ActionUrl = "/patient/appointments",
                IconType = priority.Equals("High", StringComparison.OrdinalIgnoreCase) ? "warning" : "calendar",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            await _notificationRepository.AddAsync(notification);
            return MapToDto(notification);
        }

        /// <summary>
        /// Create a prescription ready notification
        /// </summary>
        public async Task<PatientNotificationDto> CreatePrescriptionReadyAsync(
            int patientId,
            int prescriptionId,
            string doctorName)
        {
            var notification = new PatientNotification
            {
                PatientId = patientId,
                Type = "PrescriptionReady",
                Priority = "Normal",
                Title = "New Prescription Available",
                Message = $"Dr. {doctorName} has issued a new prescription for you.",
                RelatedPrescriptionId = prescriptionId,
                ActionUrl = $"/patient/prescription/{prescriptionId}",
                IconType = "prescription",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            await _notificationRepository.AddAsync(notification);
            return MapToDto(notification);
        }

        public async Task<PatientNotificationDto> CreateStoryInteractionAsync(
            int patientId,
            string title,
            string message,
            int storyId)
        {
            var notification = new PatientNotification
            {
                PatientId = patientId,
                Type = "StoryInteraction",
                Priority = "Low",
                Title = title,
                Message = message,
                ActionUrl = $"/patient/stories/{storyId}",
                IconType = "info",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            await _notificationRepository.AddAsync(notification);
            return MapToDto(notification);
        }

        /// <summary>
        /// Mark a notification as read
        /// </summary>
        public async Task MarkAsReadAsync(int notificationId)
        {
            await _notificationRepository.MarkAsReadAsync(notificationId);
        }

        /// <summary>
        /// Mark all notifications as read for a patient
        /// </summary>
        public async Task MarkAllAsReadAsync(int patientId)
        {
            await _notificationRepository.MarkAllAsReadAsync(patientId);
        }

        /// <summary>
        /// Delete a notification
        /// </summary>
        public async Task DeleteNotificationAsync(int notificationId)
        {
            await _notificationRepository.DeleteAsync(notificationId);
        }

        /// <summary>
        /// Get notification by ID
        /// </summary>
        public async Task<PatientNotificationDto?> GetNotificationByIdAsync(int notificationId)
        {
            var notification = await _notificationRepository.GetByIdAsync(notificationId);
            return notification != null ? MapToDto(notification) : null;
        }

        #region Private Helper Methods

        private PatientNotificationDto MapToDto(PatientNotification notification)
        {
            return new PatientNotificationDto
            {
                Id = notification.Id,
                PatientId = notification.PatientId,
                Type = notification.Type,
                Priority = notification.Priority,
                Title = notification.Title,
                Message = notification.Message,
                RelatedRiskAssessmentId = notification.RelatedRiskAssessmentId,
                RelatedAppointmentId = notification.RelatedAppointmentId,
                RelatedPrescriptionId = notification.RelatedPrescriptionId,
                RiskLevel = notification.RiskLevel,
                ActionUrl = notification.ActionUrl,
                IconType = notification.IconType,
                StatusColor = GetStatusColorFromRiskLevel(notification.RiskLevel),
                IsRead = notification.IsRead,
                CreatedAt = notification.CreatedAt,
                ReadAt = notification.ReadAt
            };
        }

        private (string title, string message, string iconType, string priority, string statusColor) GetRiskNotificationContent(string riskLevel, decimal riskScore)
        {
            return riskLevel.ToLower() switch
            {
                "low" => (
                    "Heart Assessment Complete - Low Risk",
                    $"Great news! Your heart risk score is {riskScore}%. Continue maintaining your healthy lifestyle.",
                    "success",
                    "Low",
                    "green"
                ),
                "medium" => (
                    "Heart Assessment Complete - Moderate Risk",
                    $"Your heart risk score is {riskScore}%. Review the recommendations to improve your heart health.",
                    "warning",
                    "Normal",
                    "orange"
                ),
                "high" => (
                    "Heart Assessment Alert - High Risk",
                    $"Important: Your heart risk score is {riskScore}%. Please consult a cardiologist soon.",
                    "alert",
                    "Urgent",
                    "red"
                ),
                _ => (
                    "Heart Assessment Complete",
                    $"Your heart risk assessment is complete. Risk score: {riskScore}%",
                    "info",
                    "Normal",
                    "gray"
                )
            };
        }

        private string GetIconTypeFromPriority(string priority)
        {
            return priority.ToLower() switch
            {
                "urgent" => "alert",
                "high" => "warning",
                "low" => "info",
                _ => "info"
            };
        }

        private string GetStatusColorFromRiskLevel(string? riskLevel)
        {
            if (string.IsNullOrEmpty(riskLevel)) return "gray";
            
            return riskLevel.ToLower() switch
            {
                "low" => "green",
                "medium" => "orange",
                "high" => "red",
                _ => "gray"
            };
        }

        #endregion
    }
}
