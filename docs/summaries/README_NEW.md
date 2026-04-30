# ?? PulseX Backend API

**PulseX** is a comprehensive healthcare management system built with **.NET 8** and **Entity Framework Core**. This backend API provides robust services for patient management, doctor appointments, health data tracking, risk assessments, and more.

---

## ?? Features

### ?? **Authentication & Authorization**
- JWT-based authentication system
- Role-based access control (Admin, Doctor, Patient)
- Password reset via OTP (Email-based)
- Secure user registration and login

### ????? **Doctor Management**
- Doctor profile management
- Appointment scheduling & management
- Patient medical data entry
- E-Prescription generation with QR codes
- Doctor ratings & reviews
- Doctor dashboard with analytics

### ?? **Patient Management**
- Patient registration & profile management
- Health survey submissions
- Medical records management
- Vital signs tracking (Blood Pressure, Heart Rate, etc.)
- Risk assessment for heart disease
- Patient dashboard with health insights
- Prescription history

### ?? **Health Data & Analytics**
- Real-time health data tracking
- Risk assessment algorithms
- Patient health info management
- Activity logs

### ?? **Communication**
- Real-time messaging between doctors and patients
- Notification system for appointments and updates
- Chatbot for basic health queries

### ?? **Admin Panel**
- User management (Create, Update, Delete)
- Doctor verification & approval
- System-wide analytics
- Patient & doctor oversight

---

## ?? Project Structure

```
H:\Backend\
??? PulseX.API/          # Web API Layer (Controllers, Services, Middleware)
??? PulseX.Core/         # Domain Layer (Models, DTOs, Interfaces, Enums)
??? PulseX.Data/         # Data Access Layer (DbContext, Repositories, Migrations)
??? PulseX.slnx          # Solution File
??? README.md            # This file
```

---

## ??? Prerequisites

- **.NET 8 SDK** ([Download here](https://dotnet.microsoft.com/download/dotnet/8.0))
- **SQL Server** (2019 or later) / **SQL Server Express**
- **Visual Studio 2022** (recommended) or **VS Code**
- **Git** (for version control)

---

## ?? Setup Instructions

### 1?? **Clone the Repository**

```bash
git clone https://github.com/YOUR_USERNAME/PulseX-Backend.git
cd Backend
```

### 2?? **Open the Solution**

- Open `PulseX.slnx` in **Visual Studio 2022**
- Or use the command line:
  ```bash
  dotnet sln PulseX.slnx open
  ```

### 3?? **Configure Database Connection**

1. Navigate to `PulseX.API/appsettings.json`
2. Update the `ConnectionStrings` section with your SQL Server details:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=YOUR_SERVER_NAME;Database=PulseXDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
}
```

**Examples:**
- **Local SQL Server:** `Server=localhost;Database=PulseXDb;...`
- **SQL Express:** `Server=.\\SQLEXPRESS;Database=PulseXDb;...`
- **Named Instance:** `Server=YOUR_PC_NAME\\MSSQL2022;Database=PulseXDb;...`

### 4?? **Configure Email Settings (Optional)**

For password reset functionality, update the `Email` section in `appsettings.json`:

```json
"Email": {
  "SmtpHost": "smtp.gmail.com",
  "SmtpPort": "587",
  "Username": "your-email@gmail.com",
  "Password": "your-app-password",
  "FromEmail": "your-email@gmail.com",
  "FromName": "PulseX Support"
}
```

> **Note:** For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833?hl=en) instead of your regular password.

### 5?? **Apply Database Migrations**

Run the following commands in the **Package Manager Console** (Tools ? NuGet Package Manager ? PMC):

```powershell
# Set PulseX.Data as the default project
Update-Database
```

Or use the .NET CLI:

```bash
cd PulseX.API
dotnet ef database update --project ../PulseX.Data/PulseX.Data.csproj
```

### 6?? **Run the Application**

```bash
cd PulseX.API
dotnet run
```

The API will be available at:
- **HTTPS:** `https://localhost:7001`
- **HTTP:** `http://localhost:5000`

---

## ?? API Documentation (Swagger)

Once the application is running, access the interactive API documentation at:

?? **https://localhost:7001/swagger**

### ?? **Authentication in Swagger**

1. Register a new user via `/api/auth/register-patient`
2. Login via `/api/auth/login` to get a JWT token
3. Click the **Authorize** button in Swagger
4. Enter: `Bearer YOUR_JWT_TOKEN`
5. Now you can test protected endpoints!

---

## ?? Main API Endpoints

### ?? **Authentication (`/api/auth`)**
- `POST /register-patient` - Register a new patient
- `POST /register-doctor` - Register a new doctor
- `POST /login` - Login and get JWT token
- `POST /forgot-password` - Request password reset OTP
- `POST /verify-otp` - Verify OTP code
- `POST /reset-password` - Reset password after OTP verification

### ?? **User Management (`/api/user`)**
- `GET /profile` - Get current user profile
- `PUT /profile` - Update user profile
- `POST /change-password` - Change password
- `POST /logout` - Logout user

### ????? **Doctor (`/api/doctor`)**
- `GET /dashboard` - Doctor dashboard with statistics
- `GET /patients` - List of doctor's patients
- `GET /patients/{patientId}` - Get patient details
- `POST /patients/{patientId}/medical-data` - Add patient medical data
- `GET /profile` - Get doctor profile
- `PUT /profile` - Update doctor profile

### ?? **Patient Dashboard (`/api/patient-dashboard`)**
- `GET /` - Get patient dashboard data
- `GET /health-summary` - Get health summary

### ?? **Prescriptions (`/api/prescriptions`)**
- `POST /` - Create a new prescription
- `GET /patient/{patientId}` - Get patient prescriptions
- `GET /{id}/pdf` - Download prescription as PDF

### ?? **Appointments (`/api/appointments`)**
- `POST /` - Create a new appointment
- `GET /my-appointments` - Get user appointments
- `PUT /{id}/status` - Update appointment status

### ?? **Health Data (`/api/health-data`)**
- `POST /vital-signs` - Submit vital signs
- `GET /patient/{patientId}/latest` - Get latest health data

### ?? **Health Survey (`/api/health-survey`)**
- `POST /submit` - Submit health survey
- `GET /result/{patientId}` - Get survey result

### ?? **Risk Assessment (`/api/risk-assessment`)**
- `POST /` - Create risk assessment
- `GET /patient/{patientId}` - Get patient risk assessments

### ?? **Medical Records (`/api/medical-records`)**
- `POST /` - Upload medical record
- `GET /patient/{patientId}` - Get patient medical records
- `DELETE /{id}` - Delete medical record

### ?? **Messages (`/api/messages`)**
- `POST /send` - Send a message
- `GET /conversation/{userId}` - Get conversation with a user

### ?? **Notifications (`/api/notifications`)**
- `GET /` - Get user notifications
- `PUT /{id}/read` - Mark notification as read

### ??? **Admin (`/api/admin`)**
- `POST /doctors` - Create a new doctor
- `POST /patients` - Create a new patient
- `GET /pending-doctors` - Get pending doctor approvals
- `PUT /doctors/{id}/verify` - Verify a doctor

---

## ??? Database Schema

The database includes the following main tables:

- **Users** - Base user accounts (Admin, Doctor, Patient)
- **Patients** - Patient-specific information
- **Doctors** - Doctor profiles and specializations
- **Appointments** - Appointment scheduling
- **Prescriptions** - E-Prescriptions with QR codes
- **MedicalRecords** - Patient medical documents
- **HealthData** - Vital signs and health metrics
- **RiskAssessments** - Heart disease risk assessments
- **Messages** - Doctor-patient communication
- **Notifications** - System notifications
- **ActivityLogs** - User activity tracking

---

## ?? Technologies Used

- **.NET 8.0** - Modern C# framework
- **ASP.NET Core Web API** - RESTful API development
- **Entity Framework Core 8.0** - ORM for database access
- **SQL Server** - Relational database
- **JWT Authentication** - Secure token-based auth
- **AutoMapper** - Object-to-object mapping
- **Swagger/OpenAPI** - API documentation
- **iTextSharp** - PDF generation for prescriptions
- **QRCoder** - QR code generation

---

## ?? Testing

### **Default Admin Account**

When you run the application for the first time, a default admin account is created:

- **Email:** `admin@pulsex.com`
- **Password:** `Admin@123`

> ?? **Important:** Change this password in production!

### **Testing Workflow**

1. Login as admin
2. Create a doctor account
3. Create a patient account
4. Login as doctor and explore doctor features
5. Login as patient and explore patient features

---

## ?? NuGet Packages

Key dependencies:

```xml
<PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="8.0.0" />
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.0" />
<PackageReference Include="AutoMapper.Extensions.Microsoft.DependencyInjection" Version="12.0.1" />
<PackageReference Include="iTextSharp.LGPLv2.Core" Version="3.7.12" />
<PackageReference Include="QRCoder" Version="1.7.0" />
<PackageReference Include="Swashbuckle.AspNetCore" Version="6.5.0" />
```

---

## ?? Troubleshooting

### **Build Errors**

If you encounter build errors after cloning:

```bash
# Clean the solution
dotnet clean

# Restore NuGet packages
dotnet restore

# Rebuild
dotnet build
```

### **Database Connection Issues**

1. Verify SQL Server is running
2. Check your connection string in `appsettings.json`
3. Ensure your SQL Server accepts local connections
4. Try using `Server=.;Database=PulseXDb;...` for local instances

### **Migration Errors**

```bash
# Remove existing migrations (if needed)
Remove-Migration

# Add a new migration
Add-Migration InitialCreate

# Apply to database
Update-Database
```

---

## ?? Cleanup Before Git Commit

Before committing to Git, run the cleanup script to remove temporary files:

```powershell
.\clean-project.ps1
```

This will remove:
- `bin/` folders
- `obj/` folders
- `.vs/` folders
- `*.user` files
- `*.suo` files

---

## ?? License

This project is developed as part of a graduation project.

---

## ?? Contributors

- **Backend Developer:** [Your Name]
- **Project Type:** Graduation Project
- **Year:** 2024/2025

---

## ?? Support

For issues or questions:
- Create an issue in the GitHub repository
- Contact: [your-email@example.com]

---

## ?? Future Enhancements

- [ ] Real-time WebSocket communication
- [ ] AI-powered health recommendations
- [ ] Mobile app integration
- [ ] Multi-language support (Arabic/English)
- [ ] Advanced analytics dashboard
- [ ] Integration with wearable devices

---

**Happy Coding! ??**
