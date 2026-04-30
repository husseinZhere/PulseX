namespace PulseX.Core.DTOs.Message
{
    public class MessageDto
    {
        public int Id { get; set; }
        public int AppointmentId { get; set; }
        public int SenderId { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public string SenderRole { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;

        // Attachment fields
        public string? AttachmentPath { get; set; }
        public string? AttachmentType { get; set; }
        public long? AttachmentSize { get; set; }
        public string? AttachmentSizeFormatted { get; set; }

        public DateTime SentAt { get; set; }
        public bool IsRead { get; set; }
    }

    public class SendMessageDto
    {
        public int AppointmentId { get; set; }

        // Optional when an attachment is provided
        public string? Content { get; set; }
    }

    public class ChatHistoryDto
    {
        public int AppointmentId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string PatientName { get; set; } = string.Empty;
        public DateTime AppointmentDate { get; set; }
        public DateTime? ChatExpiryDate { get; set; }
        public bool CanChat { get; set; }
        public bool IsVideoCallAvailable { get; set; }
        public List<MessageDto> Messages { get; set; } = new();
    }

    public class MessageInboxItemDto
    {
        public int AppointmentId { get; set; }
        public int OtherUserId { get; set; }
        public string OtherUserName { get; set; } = string.Empty;
        public string OtherUserRole { get; set; } = string.Empty;
        public string? OtherUserAvatar { get; set; }
        public string LastMessage { get; set; } = string.Empty;
        public DateTime LastMessageAt { get; set; }
        public int UnreadCount { get; set; }
    }

    public class MessageInboxResponseDto
    {
        public int UnreadCount { get; set; }
        public List<MessageInboxItemDto> Conversations { get; set; } = new();
    }
}
