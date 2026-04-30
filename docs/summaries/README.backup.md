# PulseX Backend API

A complete ASP.NET Core Web API (.NET 8) backend system for the PulseX graduation project - a comprehensive health management platform.

## 📋 Project Overview

PulseX is a health management system that connects patients with doctors, manages appointments, medical records, health data, and provides AI-powered chatbot assistance.

## 🏗️ Architecture

### 3-Layer Architecture
- **PulseX.API**: Controllers and API endpoints
- **PulseX.Core**: Domain models, DTOs, interfaces, and enums
- **PulseX.Data**: Database context, repositories, and data access

### Design Patterns
- **Repository Pattern**: Data access abstraction
- **Service Layer Pattern**: Business logic separation
- **Dependency Injection**: IoC container for loose coupling
- **AutoMapper**: Object-to-object mapping

## 🛠️ Tech Stack

- **.NET 8**: Latest LTS version
- **ASP.NET Core Web API**: RESTful API framework
- **Entity Framework Core 8.0**: ORM for database operations
- **SQL Server**: Relational database
- **JWT Authentication**: Secure token-based authentication
- **AutoMapper 12.0**: Object mapping
- **Swagger/OpenAPI**: API documentation

## 📦 Features

### 1. Authentication & Authorization
- **Patient Self-Registration**: Patients can register themselves
- **Admin-Only User Creation**: Doctors and admins created by administrators
- **JWT Token Authentication**: Secure token-based authentication with roles
- **Role-Based Authorization**: Patient, Doctor, and Admin roles

### 2. User Management
- **View Profile**: Users can view their profile information
- **Update Profile**: Users can update their personal information
- **Change Password**: Secure password change functionality

### 3. Doctor Management
- **List Doctors**: View all available doctors
- **Doctor Profiles**: Detailed doctor information including:
  - Specialization
  - Consultation price
  - Clinic location
  - Years of experience
  - Biography

### 4. Appointments
- **Book Appointments**: Patients can book appointments with doctors
- **Appointment Status**: Scheduled, Completed, Cancelled
- **Payment Methods**: Cash, Online
- **Payment Status**: Pending, Paid, Failed
- **View Appointments**: Patients and doctors can view their appointments

### 5. Messaging/Chat
- **Doctor-Patient Chat**: Real-time messaging between doctors and patients
- **Appointment-Linked Messages**: Messages are associated with specific appointments
- **Message History**: View conversation history

### 6. Medical Records
- **File Upload**: Patients can upload medical records (PDF, images, etc.)
- **Doctor Access**: Doctors can view patient records for their appointments
- **File Download**: Secure file download functionality

### 7. Health Data
- **Store Health Readings**: Patients can log health metrics:
  - Blood Pressure
  - Heart Rate
  - Temperature
  - Blood Sugar
  - Weight
  - And more
- **View History**: Track health data over time

### 8. AI Chatbot
- **Stateless Chatbot**: AI assistant for health queries
- **Health Data Integration**: Uses patient's health data for personalized responses
- **No Conversation Storage**: Privacy-focused stateless design

### 9. Stories
- **Patient Stories**: Patients can create and share their health journey stories
- **Admin Moderation**: Admins can publish, hide, or delete stories
- **Public Stories**: View published stories

### 10. Admin Panel
- **User Management**: Activate/deactivate user accounts
- **Story Management**: Moderate patient stories
- **Activity Logs**: View system activity and user actions

## 🚀 Getting Started

### Prerequisites

- .NET 8 SDK
- SQL Server (LocalDB, Express, or full version)
- Visual Studio 2022 or VS Code with C# extension

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/husseinZhere/Backend-Services.git
   cd Backend-Services/Backend
   ```

2. **Update Database Connection String**
   
   Edit `PulseX.API/appsettings.json`:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=YOUR_SERVER;Database=PulseXDb;Trusted_Connection=True;TrustServerCertificate=True;"
   }
   ```

3. **Apply Database Migrations**
   ```bash
   cd PulseX.Data
   dotnet ef database update --startup-project ../PulseX.API/PulseX.API.csproj
   ```

4. **Run the Application**
   ```bash
   cd ../PulseX.API
   dotnet run
   ```

5. **Access the API**
   - API: `https://localhost:7xxx` or `http://localhost:5xxx`
   - Swagger UI: `https://localhost:7xxx/swagger` or `http://localhost:5xxx/swagger`

## 📝 API Endpoints

### Authentication
```
POST   /api/auth/register/patient      - Patient registration
POST   /api/auth/create/doctor         - Create doctor (Admin only)
POST   /api/auth/create/admin          - Create admin (Admin only)
POST   /api/auth/login                 - User login
```

### User
```
GET    /api/user/profile               - Get current user profile
PUT    /api/user/profile               - Update profile
POST   /api/user/change-password       - Change password
```

### Doctor
```
GET    /api/doctor                     - List all doctors
GET    /api/doctor/{id}                - Get doctor profile
```

### Appointments
```
POST   /api/appointment                - Book appointment (Patient only)
GET    /api/appointment/my-appointments - Get user's appointments
PUT    /api/appointment/{id}/status    - Update appointment status
```

### Messages
```
POST   /api/message                    - Send message
GET    /api/message/appointment/{id}   - Get appointment messages
```

### Medical Records
```
POST   /api/medicalrecord/upload       - Upload medical record (Patient only)
GET    /api/medicalrecord/my-records   - Get my records (Patient only)
GET    /api/medicalrecord/patient/{id} - Get patient records (Doctor only)
GET    /api/medicalrecord/{id}/download - Download record
```

### Health Data
```
POST   /api/healthdata                 - Add health data (Patient only)
GET    /api/healthdata                 - Get my health data (Patient only)
```

### Chatbot
```
POST   /api/chatbot                    - Chat with AI assistant (Patient only)
```

### Stories
```
POST   /api/story                      - Create story (Patient only)
GET    /api/story/published            - Get published stories (Public)
GET    /api/story/my-stories           - Get my stories (Patient only)
GET    /api/story/all                  - Get all stories (Admin only)
PUT    /api/story/{id}/publish         - Publish story (Admin only)
PUT    /api/story/{id}/hide            - Hide story (Admin only)
DELETE /api/story/{id}                 - Delete story (Admin only)
```

### Admin
```
GET    /api/admin/users                - Get all users
PUT    /api/admin/users/{id}/status    - Update user status
GET    /api/admin/activity-logs        - Get all activity logs
GET    /api/admin/activity-logs/user/{id} - Get user activity logs
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. After successful login, you'll receive a token that must be included in subsequent requests:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Roles
- **Patient**: Can manage their profile, book appointments, upload records, use chatbot, create stories
- **Doctor**: Can view appointments, chat with patients, view patient medical records
- **Admin**: Full system access including user management and story moderation

## 🗄️ Database Schema

### Main Entities
- **Users**: Base user information with role
- **Patients**: Patient-specific information
- **Doctors**: Doctor-specific information
- **Appointments**: Appointment bookings
- **Messages**: Chat messages
- **MedicalRecords**: Uploaded medical files
- **HealthData**: Patient health readings
- **Stories**: Patient stories
- **ActivityLogs**: System activity tracking

## 📂 Project Structure

```
Backend/
├── PulseX.API/                    # Web API Layer
│   ├── Controllers/               # API Controllers
│   ├── Services/                  # Business Logic Services
│   ├── Helpers/                   # Helper classes (JWT, Password, Mapping)
│   ├── Uploads/                   # File upload directory
│   ├── Program.cs                 # Application entry point
│   └── appsettings.json          # Configuration
│
├── PulseX.Core/                   # Core Layer
│   ├── Models/                    # Domain entities
│   ├── DTOs/                      # Data Transfer Objects
│   ├── Enums/                     # Enumerations
│   └── Interfaces/                # Repository interfaces
│
└── PulseX.Data/                   # Data Layer
    ├── Repositories/              # Repository implementations
    ├── Migrations/                # EF Core migrations
    └── ApplicationDbContext.cs    # Database context
```

## 🧪 Testing

### Using Swagger UI
1. Run the application
2. Navigate to `/swagger`
3. Test endpoints interactively

### Using Postman
1. Import the API endpoints
2. Set up authentication with JWT token
3. Test all endpoints

## 🔧 Configuration

### JWT Settings (appsettings.json)
```json
"Jwt": {
  "Key": "YOUR_SECRET_KEY_HERE",
  "Issuer": "PulseXAPI",
  "Audience": "PulseXClient"
}
```

### Database Connection
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=PulseXDb;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

## 📊 Sample Data

To create an admin user for testing:

1. First, register as a patient
2. Manually update the database to change user role to Admin (Role = 3)
3. Use that admin account to create doctors and other admins

Alternatively, you can seed data in the `ApplicationDbContext`:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);
    
    // Seed admin user
    modelBuilder.Entity<User>().HasData(
        new User
        {
            Id = 1,
            Email = "admin@pulsex.com",
            PasswordHash = PasswordHelper.HashPassword("Admin@123"),
            FullName = "System Administrator",
            Role = UserRole.Admin,
            IsActive = true
        }
    );
}
```

## 🛡️ Security Considerations

- **Password Hashing**: Passwords are hashed using SHA256
- **JWT Tokens**: 7-day expiration
- **Role-Based Access**: Endpoints protected by role authorization
- **File Upload Validation**: Validate file types and sizes
- **Activity Logging**: Track all important user actions

## 🤝 Contributing

This is a graduation project. For any questions or suggestions, please contact the development team.

## 📝 License

This project is developed as part of a graduation project and is for educational purposes.

## 👥 Team

- **Backend Development**: ASP.NET Core Web API
- **Frontend Development**: React + Vite (separate repository)

## 📞 Support

For support, email your-email@example.com or create an issue in the repository.

---

**Built with ❤️ for PulseX Graduation Project**
