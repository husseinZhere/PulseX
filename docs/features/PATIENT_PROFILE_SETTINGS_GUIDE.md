# ?? Patient Profile & Settings Implementation - COMPLETE GUIDE

## ? Status: Backend Implementation COMPLETE

---

## ?? What Was Implemented

### **1. New DTOs Created**
```
? PatientProfileDto.cs          ? Full patient profile with all fields
? UpdatePatientProfileDto.cs    ? Update profile data
? UpdateAccountSettingsDto.cs   ? Toggle notifications & dark mode
```

### **2. Models Updated**
```
? Patient Model:
   - Added: Location (string)
   - Added: About (string - 200-500 chars)
   - Added: EmailNotificationsEnabled (bool)
   - Added: DarkModeEnabled (bool)

? User Model:
   - Added: ProfilePicture (string - file path)
```

### **3. API Endpoints**
```
? GET    /api/user/profile                    ? Get patient profile
? PUT    /api/user/profile                    ? Update profile
? POST   /api/user/profile/upload-picture     ? Upload profile picture
? PUT    /api/user/settings                   ? Update account settings
? POST   /api/user/change-password            ? Change password
```

---

## ?? Features Breakdown

### **Personal Information Section**
```csharp
Fields:
- ProfilePicture: File upload (JPG/PNG/GIF, Max 5MB)
- FirstName: Split from FullName
- LastName: Split from FullName
- Email: From User table
- PhoneNumber: From User table
- DateOfBirth: From Patient table
- Location: New field (e.g., "Cairo, Egypt")
- Gender: From Patient table (Male/Female)
```

### **About Section**
```csharp
- About: Text field (200-500 characters recommended)
- Patient can write about their health journey
```

### **Account Settings**
```csharp
- EmailNotificationsEnabled: Toggle (default: true)
- DarkModeEnabled: Toggle (default: false)
- Change Password: Current + New password
```

---

## ?? API Documentation

### **1. Get Patient Profile**
```http
GET /api/user/profile
Authorization: Bearer {token}
Role: Patient
```

**Response:**
```json
{
  "id": 5,
  "email": "noha.salem@pulsex.com",
  "fullName": "Noha Salem",
  "phoneNumber": "+20 1234567890",
  "profilePicture": "/uploads/profile-pictures/profile_5_20250216.jpg",
  "patientId": "PAT00005",
  "dateOfBirth": "1985-06-15T00:00:00Z",
  "gender": "Female",
  "location": "Cairo, Egypt",
  "about": "I'm passionate about maintaining a healthy heart...",
  "age": 39,
  "emailNotificationsEnabled": true,
  "darkModeEnabled": false
}
```

---

### **2. Update Profile**
```http
PUT /api/user/profile
Authorization: Bearer {token}
Role: Patient
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "Noha",
  "lastName": "Salem",
  "email": "noha.salem@pulsex.com",
  "phoneNumber": "+20 1234567890",
  "dateOfBirth": "1985-06-15",
  "location": "Cairo, Egypt",
  "gender": "Female",
  "about": "Updated bio text here..."
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "data": { ...updated profile... }
}
```

---

### **3. Upload Profile Picture**
```http
POST /api/user/profile/upload-picture
Authorization: Bearer {token}
Role: Patient
Content-Type: multipart/form-data
```

**Form Data:**
```
file: [binary file]
```

**Validations:**
- File types: JPG, JPEG, PNG, GIF only
- Max size: 5MB
- Filename format: profile_{userId}_{timestamp}.{ext}

**Response:**
```json
{
  "message": "Profile picture uploaded successfully",
  "profilePicture": "/uploads/profile-pictures/profile_5_20250216143025.jpg"
}
```

---

### **4. Update Account Settings**
```http
PUT /api/user/settings
Authorization: Bearer {token}
Role: Patient
Content-Type: application/json
```

**Request Body:**
```json
{
  "emailNotificationsEnabled": true,
  "darkModeEnabled": false
}
```

**Response:**
```json
{
  "message": "Settings updated successfully"
}
```

---

### **5. Change Password**
```http
POST /api/user/change-password
Authorization: Bearer {token}
Role: Patient, Doctor, Admin
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}
```

**Validation:**
- Current password must be correct
- New password min 6 characters

**Response:**
```json
{
  "message": "Password changed successfully"
}
```

---

## ??? Database Schema Changes

### **Migration: AddPatientProfileFieldsV2**

```sql
-- Users table
ALTER TABLE Users ADD ProfilePicture NVARCHAR(MAX) NULL;

-- Patients table
ALTER TABLE Patients ADD Location NVARCHAR(MAX) NULL;
ALTER TABLE Patients ADD About NVARCHAR(MAX) NULL;
ALTER TABLE Patients ADD EmailNotificationsEnabled BIT NOT NULL DEFAULT 1;
ALTER TABLE Patients ADD DarkModeEnabled BIT NOT NULL DEFAULT 0;

-- Fix empty PatientId values
UPDATE Patients
SET PatientId = 'PAT' + RIGHT('00000' + CAST(Id AS VARCHAR(5)), 5)
WHERE PatientId IS NULL OR PatientId = '';
```

---

## ?? Testing Guide

### **Test 1: Get Profile**
```bash
curl -X GET "https://localhost:7001/api/user/profile" \
  -H "Authorization: Bearer {token}"
```

### **Test 2: Update Profile**
```bash
curl -X PUT "https://localhost:7001/api/user/profile" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Noha",
    "lastName": "Salem",
    "phoneNumber": "+20 1234567890",
    "location": "Cairo, Egypt",
    "gender": "Female"
  }'
```

### **Test 3: Upload Picture (Postman/Swagger)**
```
1. Select POST /api/user/profile/upload-picture
2. Add Bearer Token
3. Body ? form-data
4. Key: "file" (type: File)
5. Value: Select image file (JPG/PNG)
6. Send
```

### **Test 4: Update Settings**
```bash
curl -X PUT "https://localhost:7001/api/user/settings" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "emailNotificationsEnabled": true,
    "darkModeEnabled": true
  }'
```

---

## ?? Frontend Integration Guide

### **React Example: Get & Display Profile**
```jsx
const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  
  useEffect(() => {
    fetch('/api/user/profile', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(res => res.json())
    .then(data => setProfile(data));
  }, []);

  return (
    <div>
      <img src={profile?.profilePicture || '/default-avatar.png'} />
      <h2>{profile?.fullName}</h2>
      <p>Age: {profile?.age}</p>
      <p>{profile?.location}</p>
      <p>{profile?.about}</p>
    </div>
  );
};
```

### **Upload Profile Picture**
```jsx
const handleFileUpload = async (e) => {
  const file = e.target.files[0];
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/user/profile/upload-picture', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: formData
  });
  
  const result = await response.json();
  setProfilePicture(result.profilePicture);
};
```

---

## ?? Important Notes

### **1. Migration Issue - MANUAL FIX REQUIRED**

**Problem:**
- The database has empty `PatientId` values causing Unique Index creation to fail

**Solution:**
Run this SQL script manually in SQL Server Management Studio:

```sql
USE [YourDatabaseName];
GO

-- Fill empty PatientId values
UPDATE Patients
SET PatientId = 'PAT' + RIGHT('00000' + CAST(Id AS VARCHAR(5)), 5)
WHERE PatientId IS NULL OR PatientId = '';
GO

-- Verify
SELECT Id, PatientId, UserId FROM Patients;
GO
```

**Then run:**
```bash
cd Backend
dotnet ef database update --project PulseX.Data/PulseX.Data.csproj --startup-project PulseX.API/PulseX.API.csproj
```

---

### **2. Profile Picture Storage**

**Directory Structure:**
```
wwwroot/
??? uploads/
    ??? profile-pictures/
        ??? profile_1_20250216143025.jpg
        ??? profile_2_20250216143130.png
        ??? profile_3_20250216143245.gif
```

**Make sure wwwroot folder exists:**
```bash
mkdir -p PulseX.API/wwwroot/uploads/profile-pictures
```

---

### **3. About Field Recommendations**

```
Recommended: 200-500 characters
Example:
"I'm a 39-year-old software engineer passionate about 
maintaining a healthy heart. After my father's cardiac 
event, I've become proactive about monitoring my 
cardiovascular health and making lifestyle changes."
```

---

## ?? Security Considerations

```
? JWT Authentication required for all endpoints
? Role-based authorization (Patient role required)
? File upload validation (type + size)
? Password verification for change password
? SQL injection prevention (EF Core)
? Input validation (DTOs)
```

---

## ?? File Structure

```
Backend/
??? PulseX.Core/
?   ??? Models/
?   ?   ??? User.cs                    ? Updated (+ProfilePicture)
?   ?   ??? Patient.cs                 ? Updated (+Location, About, Settings)
?   ??? DTOs/User/
?       ??? PatientProfileDto.cs       ? New
?       ??? UpdatePatientProfileDto.cs ? New
?       ??? UpdateAccountSettingsDto.cs ? New
?
??? PulseX.API/
?   ??? Controllers/
?   ?   ??? UserController.cs          ? Updated (5 endpoints)
?   ??? Services/
?   ?   ??? UserService.cs             ? Updated (4 new methods)
?   ??? wwwroot/
?       ??? uploads/
?           ??? profile-pictures/       ? Create this folder
?
??? PulseX.Data/
    ??? Migrations/
        ??? AddPatientProfileFieldsV2.cs ? New migration
```

---

## ? Implementation Checklist

### Backend:
- [x] Create DTOs (PatientProfileDto, UpdatePatientProfileDto, UpdateAccountSettingsDto)
- [x] Update Models (User + ProfilePicture, Patient + Location/About/Settings)
- [x] Update UserService (4 new methods)
- [x] Update UserController (5 endpoints)
- [x] Create Migration (AddPatientProfileFieldsV2)
- [ ] **MANUAL**: Run SQL to fix empty PatientId
- [ ] **MANUAL**: Apply migration to database
- [x] Test endpoints in Swagger

### Frontend:
- [ ] Profile page UI
- [ ] Profile picture upload component
- [ ] About section with character counter
- [ ] Account settings toggles
- [ ] Change password form
- [ ] API integration

---

## ?? Next Steps

1. **Fix PatientId Issue:**
   ```sql
   -- Run in SSMS
   UPDATE Patients
   SET PatientId = 'PAT' + RIGHT('00000' + CAST(Id AS VARCHAR(5)), 5)
   WHERE PatientId IS NULL OR PatientId = '';
   ```

2. **Apply Migration:**
   ```bash
   cd Backend
   dotnet ef database update --project PulseX.Data/PulseX.Data.csproj --startup-project PulseX.API/PulseX.API.csproj
   ```

3. **Create Upload Folder:**
   ```bash
   mkdir -p PulseX.API/wwwroot/uploads/profile-pictures
   ```

4. **Test in Swagger:**
   - GET /api/user/profile
   - PUT /api/user/profile
   - POST /api/user/profile/upload-picture
   - PUT /api/user/settings

5. **Frontend Integration:**
   - Build Profile & Settings page
   - Connect to API endpoints

---

## ?? Support

For questions or issues:
- **Backend Developer**: Hussein
- **Documentation**: This guide
- **Status**: ? Backend COMPLETE, ? Migration needs manual fix

---

**Last Updated**: 2025-02-16  
**Implementation Status**: ? BACKEND COMPLETE  
**Migration Status**: ?? REQUIRES MANUAL FIX (See Section 1)
