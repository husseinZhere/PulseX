using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SignalR;
using PulseX.API.Hubs;
using PulseX.Core.DTOs.Message;
using PulseX.Core.Enums;
using PulseX.Core.Interfaces;
using PulseX.Core.Models;

namespace PulseX.API.Services
{
    public class MessageService
    {
        private readonly IMessageRepository _messageRepository;
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IDoctorRepository _doctorRepository;
        private readonly IWebHostEnvironment _environment;
        private readonly IHubContext<ChatHub> _chatHubContext;
        private readonly ILogger<MessageService> _logger;
        private readonly string _chatUploadPath;
        private readonly string _webRoot;

        private static readonly HashSet<string> AllowedAttachmentExtensions =
            new() { ".jpg", ".jpeg", ".png", ".gif", ".pdf", ".doc", ".docx" };

        public MessageService(
            IMessageRepository messageRepository,
            IAppointmentRepository appointmentRepository,
            IPatientRepository patientRepository,
            IDoctorRepository doctorRepository,
            IWebHostEnvironment environment,
            IHubContext<ChatHub> chatHubContext,
            ILogger<MessageService> logger)
        {
            _messageRepository = messageRepository;
            _appointmentRepository = appointmentRepository;
            _patientRepository = patientRepository;
            _doctorRepository = doctorRepository;
            _environment = environment;
            _chatHubContext = chatHubContext;
            _logger = logger;

            _webRoot = string.IsNullOrEmpty(_environment.WebRootPath)
                ? _environment.ContentRootPath
                : _environment.WebRootPath;

            _chatUploadPath = Path.Combine(_webRoot, "uploads", "chat");
            if (!Directory.Exists(_chatUploadPath))
            {
                Directory.CreateDirectory(_chatUploadPath);
            }
        }

        public async Task<MessageDto> SendMessageAsync(
            int userId,
            UserRole role,
            SendMessageDto dto,
            IFormFile? attachment = null)
        {
            if (string.IsNullOrWhiteSpace(dto.Content) && attachment == null)
            {
                throw new Exception("Message must have content or an attachment");
            }

            var appointment = await _appointmentRepository.GetByIdAsync(dto.AppointmentId);
            if (appointment == null)
            {
                throw new Exception("Appointment not found");
            }

            string senderName;
            string senderRole;

            if (role == UserRole.Patient)
            {
                var patient = await _patientRepository.GetByUserIdAsync(userId);
                if (patient == null || appointment.PatientId != patient.Id)
                {
                    throw new Exception("Unauthorized");
                }

                senderName = appointment.Patient?.User?.FullName ?? patient.User?.FullName ?? "Unknown";
                senderRole = "Patient";
            }
            else if (role == UserRole.Doctor)
            {
                var doctor = await _doctorRepository.GetByUserIdAsync(userId);
                if (doctor == null || appointment.DoctorId != doctor.Id)
                {
                    throw new Exception("Unauthorized");
                }

                senderName = appointment.Doctor?.User?.FullName ?? doctor.User?.FullName ?? "Unknown";
                senderRole = "Doctor";
            }
            else
            {
                throw new Exception("Only doctors and patients can send messages");
            }

            string? attachmentPath = null;
            string? attachmentType = null;
            long? attachmentSize = null;

            if (attachment != null && attachment.Length > 0)
            {
                var ext = Path.GetExtension(attachment.FileName).ToLowerInvariant();

                if (!AllowedAttachmentExtensions.Contains(ext))
                {
                    throw new Exception("Attachment type not allowed. Supported: JPG, PNG, GIF, PDF, DOC, DOCX");
                }

                if (attachment.Length > 10 * 1024 * 1024)
                {
                    throw new Exception("Attachment must not exceed 10 MB");
                }

                var uniqueFileName = $"chat_{userId}_{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid()}{ext}";
                var fullPath = Path.Combine(_chatUploadPath, uniqueFileName);

                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await attachment.CopyToAsync(stream);
                }

                attachmentPath = $"/uploads/chat/{uniqueFileName}";
                attachmentType = attachment.ContentType;
                attachmentSize = attachment.Length;

                _logger.LogInformation("Chat attachment saved: {Path}", attachmentPath);
            }

            var message = new Message
            {
                AppointmentId = dto.AppointmentId,
                SenderId = userId,
                Content = dto.Content ?? string.Empty,
                AttachmentPath = attachmentPath,
                AttachmentType = attachmentType,
                AttachmentSize = attachmentSize
            };

            await _messageRepository.AddAsync(message);

            var savedMessage = await _messageRepository.GetByIdAsync(message.Id)
                ?? throw new Exception("Failed to retrieve message after creation");

            var messageDto = new MessageDto
            {
                Id = savedMessage.Id,
                AppointmentId = savedMessage.AppointmentId,
                SenderId = savedMessage.SenderId,
                SenderName = senderName,
                SenderRole = senderRole,
                Content = savedMessage.Content,
                AttachmentPath = savedMessage.AttachmentPath,
                AttachmentType = savedMessage.AttachmentType,
                AttachmentSize = savedMessage.AttachmentSize,
                AttachmentSizeFormatted = savedMessage.AttachmentSize.HasValue
                    ? FormatFileSize(savedMessage.AttachmentSize.Value)
                    : null,
                SentAt = NormalizeToUtc(savedMessage.SentAt),
                IsRead = savedMessage.IsRead
            };

            try
            {
                var conversationGroup = ChatHub.GetConversationGroup(savedMessage.AppointmentId);
                await _chatHubContext.Clients
                    .Group(conversationGroup)
                    .SendAsync("ReceiveMessage", messageDto);

                var participantUserIds = new[]
                {
                    appointment.Patient?.UserId,
                    appointment.Doctor?.UserId
                }
                .Where(id => id.HasValue)
                .Select(id => id!.Value.ToString())
                .Distinct()
                .ToArray();

                if (participantUserIds.Length > 0)
                {
                    await _chatHubContext.Clients
                        .Users(participantUserIds)
                        .SendAsync("ReceiveMessage", messageDto);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Realtime broadcast failed for message {MessageId}", savedMessage.Id);
            }

            return messageDto;
        }

        public async Task<IEnumerable<MessageDto>> GetAppointmentMessagesAsync(
            int appointmentId,
            int userId,
            UserRole role)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(appointmentId);
            if (appointment == null)
            {
                throw new Exception("Appointment not found");
            }

            if (role == UserRole.Patient)
            {
                var patient = await _patientRepository.GetByUserIdAsync(userId);
                if (patient == null || appointment.PatientId != patient.Id)
                {
                    throw new Exception("Unauthorized");
                }
            }
            else if (role == UserRole.Doctor)
            {
                var doctor = await _doctorRepository.GetByUserIdAsync(userId);
                if (doctor == null || appointment.DoctorId != doctor.Id)
                {
                    throw new Exception("Unauthorized");
                }
            }
            else
            {
                throw new Exception("Only doctors and patients can access chat history");
            }

            var patientUserId = appointment.Patient?.UserId;
            var doctorUserId = appointment.Doctor?.UserId;
            var patientName = appointment.Patient?.User?.FullName ?? "Patient";
            var doctorName = appointment.Doctor?.User?.FullName ?? "Doctor";

            var messages = (await _messageRepository.GetByAppointmentIdAsync(appointmentId)).ToList();
            var unreadIncomingMessages = messages
                .Where(message => !message.IsRead && message.SenderId != userId)
                .ToList();

            foreach (var message in unreadIncomingMessages)
            {
                message.IsRead = true;
                await _messageRepository.UpdateAsync(message);
            }

            return messages.Select(message =>
            {
                var isPatientSender = patientUserId.HasValue && message.SenderId == patientUserId.Value;
                var isDoctorSender = doctorUserId.HasValue && message.SenderId == doctorUserId.Value;

                var senderRole = isPatientSender ? "Patient" : isDoctorSender ? "Doctor" : "Unknown";
                var senderName = isPatientSender ? patientName : isDoctorSender ? doctorName : "Unknown";

                return new MessageDto
                {
                    Id = message.Id,
                    AppointmentId = message.AppointmentId,
                    SenderId = message.SenderId,
                    SenderName = senderName,
                    SenderRole = senderRole,
                    Content = message.Content,
                    AttachmentPath = message.AttachmentPath,
                    AttachmentType = message.AttachmentType,
                    AttachmentSize = message.AttachmentSize,
                    AttachmentSizeFormatted = message.AttachmentSize.HasValue
                        ? FormatFileSize(message.AttachmentSize.Value)
                        : null,
                    SentAt = NormalizeToUtc(message.SentAt),
                    IsRead = message.IsRead
                };
            });
        }

        public async Task<MessageInboxResponseDto> GetUnreadInboxAsync(int userId, UserRole role)
        {
            IEnumerable<Appointment> appointments;

            if (role == UserRole.Patient)
            {
                var patient = await _patientRepository.GetByUserIdAsync(userId)
                    ?? throw new Exception("Patient not found");
                appointments = await _appointmentRepository.GetByPatientIdAsync(patient.Id);
            }
            else if (role == UserRole.Doctor)
            {
                var doctor = await _doctorRepository.GetByUserIdAsync(userId)
                    ?? throw new Exception("Doctor not found");
                appointments = await _appointmentRepository.GetByDoctorIdAsync(doctor.Id);
            }
            else
            {
                throw new Exception("Only doctors and patients can access inbox");
            }

            var conversations = new List<MessageInboxItemDto>();

            foreach (var appointment in appointments)
            {
                var messages = (await _messageRepository.GetByAppointmentIdAsync(appointment.Id)).ToList();
                var unreadIncoming = messages
                    .Where(message => !message.IsRead && message.SenderId != userId)
                    .OrderByDescending(message => message.SentAt)
                    .ToList();

                if (unreadIncoming.Count == 0)
                {
                    continue;
                }

                var last = unreadIncoming.First();
                var isPatientViewer = role == UserRole.Patient;
                var otherUser = isPatientViewer ? appointment.Doctor?.User : appointment.Patient?.User;

                conversations.Add(new MessageInboxItemDto
                {
                    AppointmentId = appointment.Id,
                    OtherUserId = otherUser?.Id ?? 0,
                    OtherUserName = otherUser?.FullName ?? (isPatientViewer ? "Doctor" : "Patient"),
                    OtherUserRole = isPatientViewer ? "Doctor" : "Patient",
                    OtherUserAvatar = isPatientViewer ? appointment.Doctor?.ProfilePicture : appointment.Patient?.User?.ProfilePicture,
                    LastMessage = last.Content,
                    LastMessageAt = NormalizeToUtc(last.SentAt),
                    UnreadCount = unreadIncoming.Count
                });
            }

            return new MessageInboxResponseDto
            {
                UnreadCount = conversations.Sum(item => item.UnreadCount),
                Conversations = conversations
                    .OrderByDescending(item => item.LastMessageAt)
                    .ToList()
            };
        }

        private static DateTime NormalizeToUtc(DateTime value)
        {
            return value.Kind switch
            {
                DateTimeKind.Utc => value,
                DateTimeKind.Local => value.ToUniversalTime(),
                _ => DateTime.SpecifyKind(value, DateTimeKind.Utc)
            };
        }

        private static string FormatFileSize(long bytes)
        {
            string[] sizes = { "B", "KB", "MB", "GB" };
            double length = bytes;
            var order = 0;

            while (length >= 1024 && order < sizes.Length - 1)
            {
                order++;
                length /= 1024;
            }

            return $"{length:0.##} {sizes[order]}";
        }
    }
}
