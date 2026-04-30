# PulseX API Documentation

Complete REST API reference for PulseX Backend System.

Base URL: `http://localhost:5000/api` or `https://localhost:7000/api`

## Table of Contents

1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Doctors](#doctors)
4. [Appointments](#appointments)
5. [Messages](#messages)
6. [Medical Records](#medical-records)
7. [Health Data](#health-data)
8. [AI Chatbot](#ai-chatbot)
9. [Stories](#stories)
10. [Admin](#admin)

---

## Authentication

### Register Patient
Register a new patient account.

**Endpoint:** `POST /auth/register/patient`  
**Authorization:** None  

**Request Body:**
```json
{
  "email": "patient@example.com",
  "password": "Password123!",
  "fullName": "John Doe",
  "phoneNumber": "1234567890",
  "dateOfBirth": "1990-01-01T00:00:00Z",
  "gender": "Male",
  "address": "123 Main St, City",
  "bloodType": "O+"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "patient@example.com",
  "fullName": "John Doe",
  "role": "Patient",
  "userId": 1
}
```

---

### Create Doctor
Create a new doctor account (Admin only).

**Endpoint:** `POST /auth/create/doctor`  
**Authorization:** Bearer Token (Admin role)

**Request Body:**
```json
{
  "email": "doctor@example.com",
  "password": "Password123!",
  "fullName": "Dr. Sarah Smith",
  "phoneNumber": "0987654321",
  "specialization": "Cardiology",
  "licenseNumber": "DOC12345",
  "consultationPrice": 150.00,
  "clinicLocation": "City Hospital, Room 301",
  "bio": "Experienced cardiologist",
  "yearsOfExperience": 15
}
```

**Response:** `200 OK` (Same as registration response)

---

### Create Admin
Create a new admin account (Admin only).

**Endpoint:** `POST /auth/create/admin`  
**Authorization:** Bearer Token (Admin role)

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "Admin123!",
  "fullName": "Admin User",
  "phoneNumber": "1112223333"
}
```

**Response:** `200 OK` (Same as registration response)

---

### Login
Authenticate and receive JWT token.

**Endpoint:** `POST /auth/login`  
**Authorization:** None

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": "Patient",
  "userId": 1
}
```

---

## User Management

### Get Profile
Get current user's profile information.

**Endpoint:** `GET /user/profile`  
**Authorization:** Bearer Token

**Response:** `200 OK`
```json
{
  "id": 1,
  "email": "patient@example.com",
  "fullName": "John Doe",
  "phoneNumber": "1234567890",
  "role": "Patient",
  "createdAt": "2024-01-01T00:00:00Z",
  "dateOfBirth": "1990-01-01T00:00:00Z",
  "gender": "Male",
  "address": "123 Main St",
  "bloodType": "O+"
}
```

---

### Update Profile
Update current user's profile.

**Endpoint:** `PUT /user/profile`  
**Authorization:** Bearer Token

**Request Body:**
```json
{
  "fullName": "John Updated Doe",
  "phoneNumber": "9876543210",
  "address": "456 New Street",
  "dateOfBirth": "1990-01-01T00:00:00Z",
  "gender": "Male",
  "bloodType": "A+"
}
```

**Response:** `200 OK` (Returns updated profile)

---

### Change Password
Change current user's password.

**Endpoint:** `POST /user/change-password`  
**Authorization:** Bearer Token

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password changed successfully"
}
```

---

## Doctors

### List All Doctors
Get a list of all doctors.

**Endpoint:** `GET /doctor`  
**Authorization:** Bearer Token

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "fullName": "Dr. Sarah Smith",
    "email": "doctor@example.com",
    "specialization": "Cardiology",
    "consultationPrice": 150.00,
    "clinicLocation": "City Hospital, Room 301",
    "yearsOfExperience": 15
  }
]
```

---

### Get Doctor Profile
Get detailed information about a specific doctor.

**Endpoint:** `GET /doctor/{id}`  
**Authorization:** Bearer Token

**Response:** `200 OK`
```json
{
  "id": 1,
  "fullName": "Dr. Sarah Smith",
  "email": "doctor@example.com",
  "phoneNumber": "0987654321",
  "specialization": "Cardiology",
  "licenseNumber": "DOC12345",
  "consultationPrice": 150.00,
  "clinicLocation": "City Hospital, Room 301",
  "bio": "Experienced cardiologist with 15 years of practice",
  "yearsOfExperience": 15
}
```

---

## Appointments

### Book Appointment
Book a new appointment with a doctor (Patient only).

**Endpoint:** `POST /appointment`  
**Authorization:** Bearer Token (Patient role)

**Request Body:**
```json
{
  "doctorId": 1,
  "appointmentDate": "2024-12-25T10:00:00Z",
  "notes": "Regular checkup",
  "paymentMethod": 1
}
```

**Payment Methods:**
- `1` = Cash
- `2` = Online

**Response:** `200 OK`
```json
{
  "id": 1,
  "patientId": 1,
  "patientName": "John Doe",
  "doctorId": 1,
  "doctorName": "Dr. Sarah Smith",
  "appointmentDate": "2024-12-25T10:00:00Z",
  "notes": "Regular checkup",
  "status": "Scheduled",
  "paymentMethod": "Cash",
  "paymentStatus": "Pending",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

### Get My Appointments
Get all appointments for the current user.

**Endpoint:** `GET /appointment/my-appointments`  
**Authorization:** Bearer Token

**Response:** `200 OK` (Returns array of appointments)

---

### Update Appointment Status
Update the status of an appointment.

**Endpoint:** `PUT /appointment/{id}/status`  
**Authorization:** Bearer Token (Doctor or Patient)

**Request Body:**
```json
{
  "status": 2,
  "paymentStatus": 2
}
```

**Status Values:**
- `1` = Scheduled
- `2` = Completed
- `3` = Cancelled

**Payment Status Values:**
- `1` = Pending
- `2` = Paid
- `3` = Failed

**Response:** `200 OK` (Returns updated appointment)

---

## Messages

### Send Message
Send a message in appointment chat (Patient or Doctor).

**Endpoint:** `POST /message`  
**Authorization:** Bearer Token (Patient or Doctor)

**Request Body:**
```json
{
  "appointmentId": 1,
  "content": "Hello, I have a question about my medication."
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "appointmentId": 1,
  "senderId": 1,
  "senderName": "John Doe",
  "content": "Hello, I have a question about my medication.",
  "sentAt": "2024-01-01T12:00:00Z",
  "isRead": false
}
```

---

### Get Appointment Messages
Get all messages for a specific appointment.

**Endpoint:** `GET /message/appointment/{appointmentId}`  
**Authorization:** Bearer Token (Patient or Doctor)

**Response:** `200 OK` (Returns array of messages)

---

## Medical Records

### Upload Medical Record
Upload a medical record file (Patient only).

**Endpoint:** `POST /medicalrecord/upload`  
**Authorization:** Bearer Token (Patient role)  
**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: File to upload
- `description`: Optional description

**Response:** `200 OK`
```json
{
  "id": 1,
  "patientId": 1,
  "fileName": "blood_test_results.pdf",
  "fileType": "application/pdf",
  "fileSize": 245760,
  "description": "Blood test from Jan 2024",
  "uploadedAt": "2024-01-01T00:00:00Z"
}
```

---

### Get My Records
Get all medical records for current patient.

**Endpoint:** `GET /medicalrecord/my-records`  
**Authorization:** Bearer Token (Patient role)

**Response:** `200 OK` (Returns array of medical records)

---

### Get Patient Records (Doctor)
Get medical records for a specific patient (Doctor only).

**Endpoint:** `GET /medicalrecord/patient/{patientId}`  
**Authorization:** Bearer Token (Doctor role)

**Response:** `200 OK` (Returns array of medical records)

---

### Download Record
Download a medical record file.

**Endpoint:** `GET /medicalrecord/{recordId}/download`  
**Authorization:** Bearer Token

**Response:** `200 OK` (File download)

---

## Health Data

### Add Health Data
Add a new health data reading (Patient only).

**Endpoint:** `POST /healthdata`  
**Authorization:** Bearer Token (Patient role)

**Request Body:**
```json
{
  "dataType": "BloodPressure",
  "value": "120/80",
  "unit": "mmHg",
  "notes": "Morning reading, after breakfast"
}
```

**Common Data Types:**
- `BloodPressure`
- `HeartRate`
- `Temperature`
- `BloodSugar`
- `Weight`
- `Height`
- `OxygenLevel`

**Response:** `200 OK`
```json
{
  "id": 1,
  "dataType": "BloodPressure",
  "value": "120/80",
  "unit": "mmHg",
  "recordedAt": "2024-01-01T08:00:00Z",
  "notes": "Morning reading, after breakfast"
}
```

---

### Get My Health Data
Get all health data for current patient.

**Endpoint:** `GET /healthdata`  
**Authorization:** Bearer Token (Patient role)

**Response:** `200 OK` (Returns array of health data)

---

## AI Chatbot

### Chat with AI
Get AI-powered health assistance (Patient only).

**Endpoint:** `POST /chatbot`  
**Authorization:** Bearer Token (Patient role)

**Request Body:**
```json
{
  "message": "What is my latest blood pressure reading?"
}
```

**Response:** `200 OK`
```json
{
  "response": "Your most recent blood pressure reading was 120/80 mmHg on 01/01/2024. Make sure to monitor it regularly and consult your doctor if you notice any unusual changes.",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

---

## Stories

### Create Story
Create a new patient story (Patient only).

**Endpoint:** `POST /story`  
**Authorization:** Bearer Token (Patient role)

**Request Body:**
```json
{
  "title": "My Health Journey",
  "content": "This is my story about overcoming...",
  "imageUrl": "https://example.com/image.jpg"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "patientId": 1,
  "patientName": "John Doe",
  "title": "My Health Journey",
  "content": "This is my story about overcoming...",
  "imageUrl": "https://example.com/image.jpg",
  "isPublished": false,
  "isHidden": false,
  "createdAt": "2024-01-01T00:00:00Z",
  "publishedAt": null
}
```

---

### Get Published Stories
Get all published stories (Public access).

**Endpoint:** `GET /story/published`  
**Authorization:** None

**Response:** `200 OK` (Returns array of published stories)

---

### Get My Stories
Get all stories created by current patient.

**Endpoint:** `GET /story/my-stories`  
**Authorization:** Bearer Token (Patient role)

**Response:** `200 OK` (Returns array of stories)

---

### Get All Stories (Admin)
Get all stories including unpublished (Admin only).

**Endpoint:** `GET /story/all`  
**Authorization:** Bearer Token (Admin role)

**Response:** `200 OK` (Returns array of all stories)

---

### Publish Story
Publish a story (Admin only).

**Endpoint:** `PUT /story/{id}/publish`  
**Authorization:** Bearer Token (Admin role)

**Response:** `200 OK` (Returns updated story)

---

### Hide Story
Hide a published story (Admin only).

**Endpoint:** `PUT /story/{id}/hide`  
**Authorization:** Bearer Token (Admin role)

**Response:** `200 OK` (Returns updated story)

---

### Delete Story
Delete a story (Admin only).

**Endpoint:** `DELETE /story/{id}`  
**Authorization:** Bearer Token (Admin role)

**Response:** `200 OK`
```json
{
  "message": "Story deleted successfully"
}
```

---

## Admin

### Get All Users
Get list of all users (Admin only).

**Endpoint:** `GET /admin/users`  
**Authorization:** Bearer Token (Admin role)

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "Patient",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

---

### Update User Status
Activate or deactivate a user account (Admin only).

**Endpoint:** `PUT /admin/users/{userId}/status`  
**Authorization:** Bearer Token (Admin role)

**Request Body:**
```json
{
  "isActive": false
}
```

**Response:** `200 OK` (Returns updated user)

---

### Get All Activity Logs
Get all system activity logs (Admin only).

**Endpoint:** `GET /admin/activity-logs`  
**Authorization:** Bearer Token (Admin role)

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "userId": 1,
    "userName": "John Doe",
    "action": "Patient Registration",
    "entityType": "User",
    "entityId": 1,
    "details": "Patient John Doe registered",
    "timestamp": "2024-01-01T00:00:00Z",
    "ipAddress": "192.168.1.1"
  }
]
```

---

### Get User Activity Logs
Get activity logs for a specific user (Admin only).

**Endpoint:** `GET /admin/activity-logs/user/{userId}`  
**Authorization:** Bearer Token (Admin role)

**Response:** `200 OK` (Returns array of activity logs)

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Error description"
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

---

## Notes

- All datetime values are in ISO 8601 format (UTC)
- JWT tokens expire after 7 days
- File uploads limited to reasonable size (configure in server)
- All endpoints return JSON unless otherwise specified

---

For interactive API testing, use Swagger UI at `/swagger` when running the application.
