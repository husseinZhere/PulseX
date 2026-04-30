# ?? Registration Simplification & Doctor Notifications System

## ? System Updates

### 1?? Simplified Patient Registration
### 2?? Doctor Notifications System  
### 3?? Smart Alerts (AI-Powered)

---

## 1?? Simplified Registration

### ? Removed from Registration:
- Heart Rate
- Blood Pressure
- Blood Sugar
- Blood Count
- Body Temperature
- Height
- Weight
- IsSmoker
- All health measurements

### ? New Registration Fields (Basic Only):
```json
{
  "full_name": "Ahmed Hassan",
  "email": "ahmed@example.com",
  "password": "securePass123",
  "phone_number": "+201234567890",
  "gender": "Male",
  "date_of_birth": "1990-01-15"
}
```

**Registration Flow**:
```
1. Patient fills basic info only
2. Account created ?
3. JWT token generated ?
4. Health data can be added later (separate endpoint)
```

---

## 2?? Doctor Notifications System

### ?? Notification Types:

#### 1. AI Risk Alert (Urgent)
```json
{
  "type": "AIRiskAlert",
  "priority": "Urgent",
  "title": "?? AI High Risk Alert",
  "message": "Patient Ahmed Hassan completed AI risk assessment with HIGH RISK score (85%). Please review their profile immediately.",
  "relatedPatientId": 5,
  "patientName": "Ahmed Hassan"
}
```

**Triggered When**:
- Patient completes AI risk assessment
- Risk score ? 70% (High Risk)

---

#### 2. Abnormal Vital Signs (High Priority)
```json
{
  "type": "AbnormalVitals",
  "priority": "High",
  "title": "?? Abnormal Vital Signs",
  "message": "Alert: Patient Sara Mohamed recorded abnormal Blood Pressure reading (160/100 mmHg) through their profile.",
  "relatedPatientId": 8,
  "patientName": "Sara Mohamed"
}
```

**Triggered When**:
- Patient updates health data with abnormal values:
  - Blood Pressure > 140/90
  - Heart Rate < 60 or > 100
  - Blood Sugar > 180 mg/dL
  - Body Temperature > 38°C

---

#### 3. Urgent Message (Urgent)
```json
{
  "type": "UrgentMessage",
  "priority": "Urgent",
  "title": "?? Urgent Patient Message",
  "message": "Urgent message from Omar Khaled: \"Doctor, I'm experiencing severe chest pain...\"",
  "relatedPatientId": 12,
  "patientName": "Omar Khaled",
  "relatedAppointmentId": 45
}
```

**Triggered When**:
- Patient sends message containing urgent keywords:
  - "urgent", "emergency", "pain", "severe", "help"

---

#### 4. Lab Results Ready (Normal)
```json
{
  "type": "LabResults",
  "priority": "Normal",
  "title": "?? Lab Results Ready",
  "message": "Lab results for Patient Fatima Ali are now available for review before appointment.",
  "relatedPatientId": 20,
  "patientName": "Fatima Ali",
  "relatedAppointmentId": 67
}
```

**Triggered When**:
- Medical records uploaded by patient
- Before upcoming appointment

---

## 3?? API Endpoints

### Get All Notifications
```http
GET /api/Notifications
Authorization: Bearer {doctor_token}

Response:
{
  "unreadCount": 3,
  "notifications": [
    {
      "id": 1,
      "doctorId": 5,
      "type": "AIRiskAlert",
      "priority": "Urgent",
      "title": "?? AI High Risk Alert",
      "message": "Patient Ahmed Hassan...",
      "relatedPatientId": 10,
      "patientName": "Ahmed Hassan",
      "isRead": false,
      "createdAt": "2025-01-05T10:30:00Z"
    }
  ]
}
```

---

### Get Unread Notifications Only
```http
GET /api/Notifications/unread
Authorization: Bearer {doctor_token}

Response:
{
  "unreadCount": 3,
  "notifications": [ /* unread only */ ]
}
```

---

### Mark as Read
```http
PUT /api/Notifications/{notificationId}/mark-read
Authorization: Bearer {doctor_token}

Response:
{
  "message": "Notification marked as read"
}
```

---

### Mark All as Read
```http
PUT /api/Notifications/mark-all-read
Authorization: Bearer {doctor_token}

Response:
{
  "message": "All notifications marked as read"
}
```

---

### Delete Notification
```http
DELETE /api/Notifications/{notificationId}
Authorization: Bearer {doctor_token}

Response:
{
  "message": "Notification deleted successfully"
}
```

---

## 4?? Message System Integration

### ?? Messages Flow:

#### Online Patient (Instant Chat):
```
1. Patient books with Online payment
2. ChatExpiryDate set ? Chat active ?
3. Doctor sees message notification
4. Click ? Opens chat immediately
```

#### Clinic Patient (Locked Chat):
```
1. Patient books with Cash payment
2. ChatExpiryDate = null ? Chat locked ?
3. Patient visits clinic
4. Doctor completes appointment ? Activates chat
5. ChatExpiryDate set ? Chat unlocked ?
6. Now doctor can see messages
```

### Message Notification Logic:
```csharp
// When patient sends message
if (appointment.PaymentMethod == PaymentMethod.Online || 
    appointment.ChatExpiryDate.HasValue)
{
    // Create notification for doctor
    await CreateUrgentMessageAlert(doctorId, patientId, message);
}
else
{
    // Chat locked - no notification yet
    return "Chat will be available after doctor activates it";
}
```

---

## 5?? Frontend Integration

### Registration Form (Simplified)

```jsx
const RegisterForm = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone_number: '',
    gender: '',
    date_of_birth: ''
  });

  const handleSubmit = async () => {
    const response = await fetch('/api/auth/register/patient', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await response.json();
    // No health data required! ?
    localStorage.setItem('token', data.token);
    navigate('/dashboard');
  };

  return (
    <form>
      <input name="full_name" placeholder="Full Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />
      <input name="phone_number" placeholder="Phone" required />
      <select name="gender" required>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>
      <input name="date_of_birth" type="date" required />
      
      <button type="submit">Create Account</button>
    </form>
  );
};
```

---

### Doctor Notifications Panel

```jsx
const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    const response = await fetch('/api/Notifications', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setNotifications(data.notifications);
    setUnreadCount(data.unreadCount);
  };

  const markAsRead = async (notificationId) => {
    await fetch(`/api/Notifications/${notificationId}/mark-read`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchNotifications();
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    
    // Navigate based on type
    switch (notification.type) {
      case 'AIRiskAlert':
        navigate(`/patients/${notification.relatedPatientId}/risk-assessment`);
        break;
      case 'AbnormalVitals':
        navigate(`/patients/${notification.relatedPatientId}/health-data`);
        break;
      case 'UrgentMessage':
        // Check chat authorization first
        if (notification.relatedAppointmentId) {
          navigate(`/chat/${notification.relatedAppointmentId}`);
        }
        break;
      case 'LabResults':
        navigate(`/patients/${notification.relatedPatientId}/medical-records`);
        break;
    }
  };

  return (
    <div className="notifications-panel">
      {/* Badge */}
      <div className="notification-badge">
        {unreadCount > 0 && <span className="count">{unreadCount}</span>}
      </div>

      {/* Dropdown */}
      <div className="notifications-list">
        {notifications.map(notif => (
          <div 
            key={notif.id}
            className={`notification ${notif.priority.toLowerCase()} ${!notif.isRead ? 'unread' : ''}`}
            onClick={() => handleNotificationClick(notif)}
          >
            <div className="title">{notif.title}</div>
            <div className="message">{notif.message}</div>
            <div className="time">{formatTime(notif.createdAt)}</div>
            
            {!notif.isRead && <span className="unread-dot"></span>}
          </div>
        ))}

        <button onClick={markAllAsRead}>Mark all as read</button>
      </div>
    </div>
  );
};
```

---

### Messages with Chat Authorization

```jsx
const MessageNotification = ({ notification }) => {
  const handleClick = async () => {
    // Check if chat is available
    const response = await fetch(
      `/api/DoctorBooking/appointments/${notification.relatedAppointmentId}/video-available`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const data = await response.json();

    if (data.isVideoCallAvailable) {
      // Online patient or activated chat
      navigate(`/chat/${notification.relatedAppointmentId}`);
    } else {
      // Clinic patient - chat locked
      alert('Chat is locked. Please activate it from Patient List after completing the appointment.');
      navigate(`/appointments/${notification.relatedAppointmentId}`);
    }
  };

  return (
    <div onClick={handleClick}>
      {notification.title}
      {notification.message}
    </div>
  );
};
```

---

## 6?? Auto-Trigger Logic

### In RiskAssessmentService:
```csharp
public async Task<RiskAssessmentDto> CreateAsync(int patientId, CreateRiskAssessmentDto dto)
{
    var assessment = await CalculateRisk(patientId, dto);
    
    // Trigger notification if high risk
    if (assessment.RiskScore >= 70)
    {
        var doctorId = await GetPatientDoctorIdAsync(patientId);
        if (doctorId.HasValue)
        {
            await _notificationService.CreateAIRiskAlertAsync(
                doctorId.Value, 
                patientId, 
                assessment.RiskScore
            );
        }
    }
    
    return assessment;
}
```

### In HealthDataService:
```csharp
public async Task<HealthDataDto> AddAsync(int patientId, CreateHealthDataDto dto)
{
    var healthData = await SaveHealthData(patientId, dto);
    
    // Check for abnormal values
    if (IsAbnormal(dto))
    {
        var doctorId = await GetPatientDoctorIdAsync(patientId);
        if (doctorId.HasValue)
        {
            await _notificationService.CreateAbnormalVitalsAlertAsync(
                doctorId.Value,
                patientId,
                dto.DataType,
                dto.Value
            );
        }
    }
    
    return healthData;
}
```

### In MessageService:
```csharp
public async Task<MessageDto> SendAsync(int patientId, int appointmentId, string content)
{
    var message = await SaveMessage(appointmentId, content);
    
    // Check for urgent keywords
    if (IsUrgent(content))
    {
        var appointment = await _appointmentRepository.GetByIdAsync(appointmentId);
        await _notificationService.CreateUrgentMessageAlertAsync(
            appointment.DoctorId,
            patientId,
            appointmentId,
            content
        );
    }
    
    return message;
}
```

---

## 7?? Database Migration

```sql
-- Create DoctorNotifications table
CREATE TABLE DoctorNotifications (
    Id INT PRIMARY KEY IDENTITY,
    DoctorId INT NOT NULL,
    Type NVARCHAR(50) NOT NULL,
    Priority NVARCHAR(20) NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Message NVARCHAR(1000) NOT NULL,
    RelatedPatientId INT NULL,
    RelatedAppointmentId INT NULL,
    IsRead BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    ReadAt DATETIME2 NULL,
    
    FOREIGN KEY (DoctorId) REFERENCES Doctors(Id) ON DELETE CASCADE,
    FOREIGN KEY (RelatedPatientId) REFERENCES Patients(Id),
    FOREIGN KEY (RelatedAppointmentId) REFERENCES Appointments(Id)
);

CREATE INDEX IX_DoctorNotifications_DoctorId_IsRead 
ON DoctorNotifications(DoctorId, IsRead);
```

---

## ? Summary

**Registration**:
- ? Simplified to 6 fields only
- ? No health data required
- ? Faster onboarding

**Notifications**:
- ? AI Risk Alerts
- ? Abnormal Vitals
- ? Urgent Messages
- ? Lab Results

**Messages**:
- ? Online ? Instant chat
- ? Clinic ? Locked until activated
- ? Smart routing based on payment type

---

**Files Created**:
1. ? NotificationDto.cs
2. ? DoctorNotification.cs (Model)
3. ? INotificationRepository.cs
4. ? NotificationRepository.cs
5. ? NotificationService.cs
6. ? NotificationsController.cs

**Files Modified**:
7. ? RegisterPatientDto.cs (Simplified)
8. ? AuthService.cs (Removed health data)
9. ? ApplicationDbContext.cs (Added DoctorNotifications)
10. ? Program.cs (Registered services)

---

**Next Steps**:
1. Run migration
2. Test simplified registration
3. Test notifications
4. Test message routing

---

**Date**: 2025-01-05  
**Version**: 3.0  
**Status**: ? Ready!  

**Built with ?? for PulseX Graduation Project**

?? **Simplified Registration & Smart Notifications!** ???
