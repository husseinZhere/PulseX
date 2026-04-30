# PulseX Healthcare System - Complete Workflow Guide

## 🎯 System Overview

PulseX implements a proper healthcare management system with distinct roles and approval workflows. The system ensures that:
- **Admin** controls all user registrations and doctor approvals
- **Doctors** can only access the system after admin approval
- **Patients** can self-register and rate doctors after appointments
- Each role has a dedicated dashboard with relevant metrics

---

## 👥 User Roles & Access

### 1. Admin (الأدمن)
**How to Get Started:**
- Default admin is automatically created on first run
- **Email:** `admin@pulsex.com`
- **Password:** `Admin@123` (CHANGE THIS!)

**Admin Responsibilities:**
✅ Add and approve doctors  
✅ Manage all users (activate/deactivate)  
✅ View system statistics  
✅ Monitor all activities  
✅ Manage story publications  

**Admin Workflow:**
```
1. Login with default credentials
2. Change password immediately
3. Create doctor accounts
4. Approve pending doctors
5. Monitor system via dashboard
6. Manage users as needed
```

### 2. Doctor (الدكتور)
**How Doctors Join:**
- Admin creates doctor account via admin panel
- Doctor receives credentials
- Doctor tries to login → **BLOCKED** (pending approval)
- Admin approves doctor
- Doctor can now login and work

**Doctor Responsibilities:**
✅ View assigned patients  
✅ Manage appointments (accept/reject)  
✅ Review medical records  
✅ Write diagnoses and prescriptions  
✅ Chat with patients  
✅ View performance metrics (ratings, earnings)  

**Doctor Workflow:**
```
1. Admin creates account → Doctor receives email/credentials
2. Doctor attempts login → Sees "pending approval" message
3. Wait for admin approval
4. After approval → Login successfully
5. View dashboard with upcoming appointments
6. Manage patient appointments
7. Review and respond to patient queries
```

### 3. Patient (المريض)
**How Patients Join:**
- Self-registration via website
- Account active immediately (no approval needed)

**Patient Responsibilities:**
✅ Search for doctors  
✅ Book appointments  
✅ View medical records  
✅ Track health data  
✅ Rate doctors (after appointment)  
✅ Chat with doctors  
✅ View AI risk assessment  

**Patient Workflow:**
```
1. Register via /api/auth/register/patient
2. Login immediately
3. Browse approved doctors with ratings
4. Book appointment with preferred doctor
5. Attend appointment
6. After completion → Rate the doctor
7. View health dashboard and AI risk score
```

---

## 🔄 Complete System Workflow

### Step 1: System Initialization
```
Application Starts
    ↓
Database Check
    ↓
Default Admin Created (if not exists)
    ↓
Admin Credentials Logged to Console
```

### Step 2: Admin Setup
```
Admin Login (admin@pulsex.com)
    ↓
Change Default Password
    ↓
View Admin Dashboard
    ↓
System Ready for Doctor Registration
```

### Step 3: Doctor Registration & Approval
```
Admin → Create Doctor Account
    ↓
Doctor Record Created (IsApproved = false)
    ↓
Doctor Receives Credentials
    ↓
Doctor Attempts Login → BLOCKED
    ↓
Error: "Your account is pending admin approval"
    ↓
Admin → View Pending Doctors
    ↓
Admin → Approve/Reject Doctor
    ↓
If Approved → Doctor.IsApproved = true
    ↓
Doctor Login → SUCCESS
    ↓
Doctor Access Dashboard
```

### Step 4: Patient Registration
```
Patient → Visit Registration Page
    ↓
Fill Registration Form
    ↓
Submit → Account Created (Active Immediately)
    ↓
Login → Access Patient Dashboard
```

### Step 5: Appointment Booking
```
Patient → Browse Doctors
    ↓
View Doctor Details (Specialization, Price, Ratings)
    ↓
Select Doctor & Book Appointment
    ↓
Choose Date/Time & Payment Method
    ↓
Appointment Created (Status: Scheduled)
    ↓
Doctor Receives Notification
    ↓
Doctor Can Accept/Reject
```

### Step 6: Appointment Completion
```
Appointment Date Arrives
    ↓
Doctor Marks as "Completed"
    ↓
Doctor Can Write Diagnosis
    ↓
Patient Can Rate Doctor
```

### Step 7: Doctor Rating
```
Patient → View Completed Appointments
    ↓
Select Appointment to Rate
    ↓
Submit Rating (1-5 stars) + Review
    ↓
System Validates:
  ✓ Appointment is completed
  ✓ Not already rated
  ✓ Valid rating value
    ↓
Rating Saved
    ↓
Doctor's Average Rating Recalculated
    ↓
Rating Visible in Doctor Profile
```

---

## 📊 Dashboard Features

### Admin Dashboard
**URL:** `GET /api/admin/dashboard`

**Metrics:**
- Total Patients
- Total Doctors (Approved/Pending)
- Total Appointments
- Today's Appointments
- Completed/Cancelled Appointments
- Total Revenue
- Recent System Activities

**Actions:**
- View pending doctor applications
- Approve/reject doctors
- Activate/deactivate users
- View activity logs

### Doctor Dashboard
**URL:** `GET /api/doctor/dashboard`

**Metrics:**
- Total Patients Served
- Upcoming Appointments
- Today's Appointments
- Completed Appointments
- Average Rating ⭐
- Total Ratings Count
- Estimated Earnings
- Next 5 Appointments

**Actions:**
- View patient list
- Manage appointments
- Review medical records
- Chat with patients

### Patient Dashboard
**URL:** `GET /api/user/dashboard`

**Metrics:**
- Upcoming Appointments
- Completed Appointments
- Medical Records Count
- Health Data Entries
- Latest Health Metric
- **AI Risk Score** 🤖
- Next 5 Appointments

**Actions:**
- Search doctors
- Book appointments
- Rate doctors
- Track health data
- View AI recommendations

---

## ⭐ Rating System

### How It Works
1. **Eligibility:** Only completed appointments can be rated
2. **One Rating Per Appointment:** Cannot rate the same appointment twice
3. **Rating Range:** 1-5 stars
4. **Optional Review:** Text review can be added
5. **Automatic Calculation:** Doctor's average rating updates automatically

### Rating Formula
```
Average Rating = Sum of All Ratings / Total Number of Ratings
Total Ratings = Count of all ratings received
```

### Rating Display
- Doctor List: Shows average rating + total count
- Doctor Profile: Shows average rating + all individual reviews
- Search Results: Sorted by rating (optional)

---

## 🔐 Access Control

### Public Endpoints (No Auth Required)
- `POST /api/auth/register/patient` - Patient registration
- `POST /api/auth/login` - Login for all users

### Patient-Only Endpoints
- `POST /api/doctor/rate` - Rate doctor
- `GET /api/user/dashboard` - Patient dashboard
- `POST /api/appointment` - Book appointment
- `POST /api/healthdata` - Add health data
- `POST /api/medicalrecord/upload` - Upload records

### Doctor-Only Endpoints
- `GET /api/doctor/dashboard` - Doctor dashboard
- `GET /api/medicalrecord/patient/{id}` - View patient records

### Admin-Only Endpoints
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/doctors/pending` - Pending doctors
- `PUT /api/admin/doctors/{id}/approve` - Approve doctor
- `POST /api/auth/create/doctor` - Create doctor
- `POST /api/auth/create/admin` - Create admin
- `PUT /api/admin/users/{id}/status` - Update user status

### Shared Endpoints (All Authenticated Users)
- `GET /api/user/profile` - View profile
- `PUT /api/user/profile` - Update profile
- `POST /api/user/change-password` - Change password
- `GET /api/doctor` - List doctors
- `GET /api/doctor/{id}` - View doctor profile
- `GET /api/appointment/my-appointments` - View appointments

---

## 🚨 Important Notes

### Security
- ⚠️ **Change default admin password immediately**
- 🔒 All passwords are hashed (SHA256)
- 🎫 JWT tokens expire after 7 days
- 🛡️ Role-based access control on all endpoints

### Doctor Approval
- ⏰ Doctors **cannot login** until approved
- 📧 Notify doctors when approved/rejected
- ✅ Only approved doctors visible to patients
- 👨‍⚕️ Admin can view all doctors (approved + pending)

### Rating System
- 🎯 One rating per appointment (unique constraint)
- ✅ Only completed appointments can be rated
- ⭐ Ratings between 1-5 stars
- 📊 Average rating updates automatically
- 🔄 Cannot change rating after submission

### Dashboards
- 📱 Separate dashboard for each role
- 📊 Real-time statistics
- 🔔 Recent activities tracked
- 💰 Revenue calculations for admin/doctor

---

## 🎓 For Development/Testing

### Quick Test Workflow
```bash
# 1. Start application
cd Backend/PulseX.API
dotnet run

# 2. Login as admin
POST /api/auth/login
{
  "email": "admin@pulsex.com",
  "password": "Admin@123"
}

# 3. Create a doctor
POST /api/auth/create/doctor
Authorization: Bearer {admin_token}
{
  "email": "doctor@test.com",
  "password": "Doctor@123",
  ...
}

# 4. Approve the doctor
PUT /api/admin/doctors/1/approve
Authorization: Bearer {admin_token}
{
  "isApproved": true
}

# 5. Register a patient
POST /api/auth/register/patient
{
  "email": "patient@test.com",
  "password": "Patient@123",
  ...
}

# 6. Patient books appointment
POST /api/appointment
Authorization: Bearer {patient_token}
{
  "doctorId": 1,
  "appointmentDate": "2024-12-25T10:00:00Z",
  ...
}

# 7. Doctor completes appointment
PUT /api/appointment/1/status
Authorization: Bearer {doctor_token}
{
  "status": 2,  // Completed
  "paymentStatus": 2  // Paid
}

# 8. Patient rates doctor
POST /api/doctor/rate
Authorization: Bearer {patient_token}
{
  "appointmentId": 1,
  "rating": 5,
  "review": "Excellent!"
}
```

---

## 📞 Support & Questions

For setup help, refer to:
- `README.md` - Complete documentation
- `QUICKSTART.md` - 5-minute setup guide
- `API_DOCUMENTATION.md` - Full API reference

**System designed for graduation project excellence! 🎓✨**
