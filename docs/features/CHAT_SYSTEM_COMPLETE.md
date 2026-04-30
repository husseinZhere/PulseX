# ?? Chat System with Expiry & Video Call - Complete Implementation

## ?? System Overview

Complete chat system with:
1. ? ChatExpiryDate Logic
2. ? Automatic activation for Online payment
3. ? Manual activation by Doctor for Cash payment
4. ? Message Attachments (images, PDFs)
5. ? Video Call availability (within appointment window)

---

## ?? The Complete Flow

```
Patient Books Appointment
  ??? Online Payment
  ?   ??? ChatExpiryDate = Now + 7 days ?
  ?   ??? CanChat = true (immediately)
  ?   ??? Video Call = Available (during appointment time)
  ?
  ??? Cash Payment
      ??? ChatExpiryDate = null ?
      ??? CanChat = false (until doctor activates)
      ??? [Patient visits clinic]
      ??? Doctor clicks "Complete Appointment"
      ??? API: POST /activate-chat
      ??? ChatExpiryDate = Now + 7 days ?
      ??? CanChat = true ?
```

---

## ?? Database Changes

### 1. Appointment Model
```csharp
public class Appointment
{
    // Existing fields...
    
    // ? NEW: Chat expiry control
    public DateTime? ChatExpiryDate { get; set; }
    
    // ? NEW: Video call availability
    public bool IsVideoCallActive { get; set; }
}
```

### 2. Message Model
```csharp
public class Message
{
    // Existing fields...
    
    // ? NEW: Attachment support
    public string? AttachmentPath { get; set; }
    public string? AttachmentType { get; set; }
    public long? AttachmentSize { get; set; }
}
```

---

## ?? API Endpoints

### 1?? Create Appointment (with Chat Logic)

```http
POST /api/DoctorBooking/appointments
Authorization: Bearer {patient_token}
Content-Type: application/json

{
  "doctor_id": 1,
  "appointment_date": "2025-01-10",
  "time_slot": "10:30",
  "payment_method": 2,  // 1=Cash, 2=Online
  "notes": "First consultation"
}

Response (Online Payment):
{
  "appointmentId": 1,
  "doctorName": "Dr. Ahmed Hassan",
  "appointmentDate": "2025-01-10T10:30:00Z",
  "status": "Confirmed",
  "paymentStatus": "Paid",
  "chatExpiryDate": "2025-01-17T10:30:00Z",  ? 7 days from now
  "canChat": true,  ? Instant access
  "isVideoCallActive": false,  ? Only during appointment time
  "chatMessage": "Chat is now active! You can message the doctor for 7 days."
}

Response (Cash Payment):
{
  "appointmentId": 2,
  "doctorName": "Dr. Ahmed Hassan",
  "appointmentDate": "2025-01-10T10:30:00Z",
  "status": "Scheduled",
  "paymentStatus": "Pending",
  "chatExpiryDate": null,  ? No chat yet
  "canChat": false,  ? Needs activation
  "isVideoCallActive": false,
  "chatMessage": "Chat will be activated by the doctor after your clinic visit."
}
```

---

### 2?? Activate Chat (Doctor Only)

```http
POST /api/DoctorBooking/appointments/{appointmentId}/activate-chat?expiryDays=7
Authorization: Bearer {doctor_token}

Response:
{
  "appointmentId": 2,
  "doctorName": "Dr. Ahmed Hassan",
  "status": "Completed",
  "paymentStatus": "Paid",
  "chatExpiryDate": "2025-01-17T15:00:00Z",
  "canChat": true,
  "chatMessage": "Chat activated! Available until 2025-01-17 15:00"
}
```

**When to use**:
- After cash payment appointment is completed
- Doctor clicks "Complete Appointment" button in UI
- Chat becomes active for 7 days (configurable)

---

### 3?? Check Chat Authorization

```http
GET /api/DoctorBooking/doctors/{doctorId}/can-chat
Authorization: Bearer {patient_token}

Response (Chat Active):
{
  "canChat": true
}

Response (Chat Expired):
{
  "canChat": false
}
```

**Authorization Logic**:
```csharp
CanChat = 
  appointment.ChatExpiryDate != null &&
  DateTime.Now < appointment.ChatExpiryDate &&
  (appointment.Status == Confirmed || Completed)
```

---

### 4?? Check Video Call Availability

```http
GET /api/DoctorBooking/appointments/{appointmentId}/video-available
Authorization: Bearer {patient_or_doctor_token}

Response (Available):
{
  "appointmentId": 1,
  "isVideoCallAvailable": true,
  "message": "Video call is available now"
}

Response (Not Available):
{
  "appointmentId": 1,
  "isVideoCallAvailable": false,
  "message": "Video call is only available within 1 hour of appointment time"
}
```

**Availability Rules**:
- ? Within 1 hour before appointment time
- ? Within 1 hour after appointment time
- ? Chat must be active (not expired)
- ? Appointment not cancelled

**Example**:
```
Appointment: 2025-01-10 10:30
Available from: 2025-01-10 09:30
Available until: 2025-01-10 11:30
```

---

### 5?? Send Message (with Attachment)

```http
POST /api/Messages/send
Authorization: Bearer {patient_or_doctor_token}
Content-Type: multipart/form-data

FormData:
- appointmentId: 1
- content: "Here is my X-ray report"
- attachment: (file) report.jpg

Response:
{
  "id": 1,
  "appointmentId": 1,
  "senderId": 5,
  "senderName": "John Doe",
  "senderRole": "Patient",
  "content": "Here is my X-ray report",
  "attachmentPath": "/uploads/messages/report_20250110_abc123.jpg",
  "attachmentType": "image/jpeg",
  "attachmentSize": 1048576,
  "attachmentSizeFormatted": "1.0 MB",
  "sentAt": "2025-01-10T14:30:00Z",
  "isRead": false
}
```

---

### 6?? Get Chat History

```http
GET /api/Messages/history/{appointmentId}
Authorization: Bearer {patient_or_doctor_token}

Response:
{
  "appointmentId": 1,
  "doctorName": "Dr. Ahmed Hassan",
  "patientName": "John Doe",
  "appointmentDate": "2025-01-10T10:30:00Z",
  "chatExpiryDate": "2025-01-17T10:30:00Z",
  "canChat": true,
  "isVideoCallAvailable": false,
  "messages": [
    {
      "id": 1,
      "senderId": 5,
      "senderName": "John Doe",
      "senderRole": "Patient",
      "content": "Hello doctor",
      "attachmentPath": null,
      "sentAt": "2025-01-10T11:00:00Z",
      "isRead": true
    },
    {
      "id": 2,
      "senderId": 3,
      "senderName": "Dr. Ahmed Hassan",
      "senderRole": "Doctor",
      "content": "Hello! How can I help you?",
      "attachmentPath": null,
      "sentAt": "2025-01-10T11:05:00Z",
      "isRead": true
    },
    {
      "id": 3,
      "senderId": 5,
      "senderName": "John Doe",
      "senderRole": "Patient",
      "content": "Here is my X-ray",
      "attachmentPath": "/uploads/messages/xray_123.jpg",
      "attachmentType": "image/jpeg",
      "attachmentSize": 2097152,
      "attachmentSizeFormatted": "2.0 MB",
      "sentAt": "2025-01-10T11:10:00Z",
      "isRead": false
    }
  ]
}
```

---

## ?? Frontend Integration

### 1. Doctor Profile Page

```jsx
const DoctorProfile = ({ doctorId }) => {
  const [profile, setProfile] = useState(null);
  const [canChat, setCanChat] = useState(false);

  useEffect(() => {
    // Get profile
    fetch(`/api/DoctorBooking/doctors/${doctorId}/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json()).then(setProfile);

    // Check chat access
    fetch(`/api/DoctorBooking/doctors/${doctorId}/can-chat`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json()).then(data => setCanChat(data.canChat));
  }, [doctorId]);

  return (
    <div>
      <h1>{profile?.fullName}</h1>
      
      {/* Chat Button */}
      {canChat ? (
        <button onClick={openChat}>?? Chat Now</button>
      ) : (
        <button onClick={openBooking}>?? Book Appointment to Chat</button>
      )}
    </div>
  );
};
```

---

### 2. Booking Confirmation Page

```jsx
const BookingConfirmation = ({ bookingSummary }) => {
  const { chatExpiryDate, canChat, chatMessage } = bookingSummary;

  return (
    <div>
      <h2>Booking Confirmed!</h2>
      
      {/* Chat Status */}
      <div className="chat-status">
        {canChat ? (
          <>
            <p className="success">{chatMessage}</p>
            <p>Chat expires: {new Date(chatExpiryDate).toLocaleString()}</p>
            <button onClick={openChat}>Start Chat</button>
          </>
        ) : (
          <p className="info">{chatMessage}</p>
        )}
      </div>
    </div>
  );
};
```

---

### 3. Chat Interface

```jsx
const ChatInterface = ({ appointmentId }) => {
  const [chatData, setChatData] = useState(null);
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState(null);

  useEffect(() => {
    // Load chat history
    fetch(`/api/Messages/history/${appointmentId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json()).then(setChatData);

    // Check expiry every minute
    const interval = setInterval(checkExpiry, 60000);
    return () => clearInterval(interval);
  }, [appointmentId]);

  const checkExpiry = () => {
    if (chatData?.chatExpiryDate) {
      const now = new Date();
      const expiry = new Date(chatData.chatExpiryDate);
      
      if (now > expiry) {
        alert('Chat has expired. You can no longer send messages.');
        setCanChat(false);
      }
    }
  };

  const sendMessage = async () => {
    const formData = new FormData();
    formData.append('appointmentId', appointmentId);
    formData.append('content', message);
    if (attachment) {
      formData.append('attachment', attachment);
    }

    await fetch('/api/Messages/send', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    setMessage('');
    setAttachment(null);
    // Reload messages
  };

  return (
    <div className="chat-container">
      {/* Expiry Warning */}
      {chatData?.chatExpiryDate && (
        <div className="expiry-notice">
          Chat expires: {new Date(chatData.chatExpiryDate).toLocaleString()}
        </div>
      )}

      {/* Video Call Button */}
      {chatData?.isVideoCallAvailable && (
        <button className="video-call-btn" onClick={startVideoCall}>
          ?? Start Video Call
        </button>
      )}

      {/* Messages */}
      <div className="messages">
        {chatData?.messages.map(msg => (
          <div key={msg.id} className={`message ${msg.senderRole}`}>
            <span className="sender">{msg.senderName}</span>
            <p>{msg.content}</p>
            
            {/* Attachment */}
            {msg.attachmentPath && (
              <div className="attachment">
                <a href={msg.attachmentPath} target="_blank">
                  ?? {msg.attachmentType} ({msg.attachmentSizeFormatted})
                </a>
              </div>
            )}
            
            <span className="time">{new Date(msg.sentAt).toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* Input */}
      {chatData?.canChat ? (
        <div className="input-area">
          <input 
            value={message} 
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <input 
            type="file" 
            onChange={(e) => setAttachment(e.target.files[0])}
            accept="image/*,application/pdf"
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      ) : (
        <div className="expired-notice">
          Chat has expired. You can no longer send messages.
        </div>
      )}
    </div>
  );
};
```

---

### 4. Video Call Button Logic

```jsx
const VideoCallButton = ({ appointmentId }) => {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    // Check every 30 seconds
    checkAvailability();
    const interval = setInterval(checkAvailability, 30000);
    return () => clearInterval(interval);
  }, [appointmentId]);

  const checkAvailability = async () => {
    const response = await fetch(
      `/api/DoctorBooking/appointments/${appointmentId}/video-available`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const data = await response.json();
    setIsAvailable(data.isVideoCallAvailable);
  };

  const startVideoCall = () => {
    // Integration with Agora/WebRTC
    window.open(`/video-call/${appointmentId}`, '_blank');
  };

  return (
    <>
      {isAvailable ? (
        <button className="video-call-active" onClick={startVideoCall}>
          ?? Start Video Call (Available Now)
        </button>
      ) : (
        <button className="video-call-inactive" disabled>
          ?? Video Call (Available during appointment time)
        </button>
      )}
    </>
  );
};
```

---

### 5. Doctor Dashboard - Activate Chat

```jsx
const DoctorAppointmentCard = ({ appointment }) => {
  const activateChat = async () => {
    const response = await fetch(
      `/api/DoctorBooking/appointments/${appointment.id}/activate-chat?expiryDays=7`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${doctorToken}` }
      }
    );
    
    if (response.ok) {
      alert('Chat activated! Patient can now message you for 7 days.');
      // Refresh appointment list
    }
  };

  return (
    <div className="appointment-card">
      <h3>{appointment.patientName}</h3>
      <p>Date: {new Date(appointment.appointmentDate).toLocaleString()}</p>
      <p>Status: {appointment.status}</p>
      
      {/* Activate Chat Button */}
      {appointment.paymentMethod === 'Cash' && !appointment.chatExpiryDate && (
        <button onClick={activateChat}>
          ? Complete & Activate Chat
        </button>
      )}
      
      {/* Chat Status */}
      {appointment.chatExpiryDate && (
        <p className="chat-active">
          ?? Chat Active until {new Date(appointment.chatExpiryDate).toLocaleString()}
        </p>
      )}
    </div>
  );
};
```

---

## ?? Authorization Rules Summary

### Chat Access:
```
CanChat = 
  appointment.ChatExpiryDate != null &&
  DateTime.Now < appointment.ChatExpiryDate &&
  (Status == Confirmed || Status == Completed)
```

### Video Call Access:
```
IsVideoCallAvailable = 
  (Now >= AppointmentDate - 1 hour) &&
  (Now <= AppointmentDate + 1 hour) &&
  CanChat == true &&
  Status != Cancelled
```

---

## ?? Migration Required

```bash
# Add new columns to Appointments table
ALTER TABLE Appointments ADD ChatExpiryDate DATETIME NULL;
ALTER TABLE Appointments ADD IsVideoCallActive BIT NOT NULL DEFAULT 0;

# Add new columns to Messages table
ALTER TABLE Messages ADD AttachmentPath NVARCHAR(MAX) NULL;
ALTER TABLE Messages ADD AttachmentType NVARCHAR(100) NULL;
ALTER TABLE Messages ADD AttachmentSize BIGINT NULL;
```

---

## ? Summary

**What's Implemented**:
1. ? ChatExpiryDate for time-limited chat access
2. ? Automatic activation for Online payment
3. ? Manual activation by Doctor for Cash payment
4. ? Video call availability (1 hour window)
5. ? Message attachments (images, PDFs)
6. ? Expiry checks in authorization
7. ? Complete API endpoints
8. ? Frontend integration examples

**Files Modified**:
- ? Appointment Model (ChatExpiryDate, IsVideoCallActive)
- ? Message Model (Attachment fields)
- ? DTOs (BookingSummaryDto, MessageDto, ChatHistoryDto)
- ? DoctorBookingService (Chat activation, expiry checks)
- ? DoctorBookingController (New endpoints)

**Next Steps**:
1. Run migrations
2. Test appointment booking (Online vs Cash)
3. Test doctor activation
4. Test chat with expiry
5. Implement video call (Agora/WebRTC)

---

**Date**: 2025-01-05  
**Version**: 2.0  
**Status**: ? Ready for Testing!  

**Built with ?? for PulseX Graduation Project**

?? **Complete Chat System with Expiry & Video Call!** ?????
