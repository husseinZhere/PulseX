# PulseX Backend - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Install Prerequisites

1. Download and install **.NET 8 SDK**: https://dotnet.microsoft.com/download/dotnet/8.0
2. Download and install **SQL Server**:
   - SQL Server Express (free): https://www.microsoft.com/sql-server/sql-server-downloads
   - OR use LocalDB (included with Visual Studio)

### Step 2: Clone and Build

```bash
# Clone the repository
git clone https://github.com/husseinZhere/Backend-Services.git
cd Backend-Services/Backend

# Restore dependencies
dotnet restore

# Build the solution
dotnet build
```

### Step 3: Configure Database

1. **Option A - Using SQL Server Express**
   
   Edit `PulseX.API/appsettings.json`:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=PulseXDb;Trusted_Connection=True;TrustServerCertificate=True;"
   }
   ```

2. **Option B - Using LocalDB**
   
   Edit `PulseX.API/appsettings.json`:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=PulseXDb;Trusted_Connection=True;TrustServerCertificate=True;"
   }
   ```

### Step 4: Create Database

```bash
cd PulseX.Data
dotnet ef database update --startup-project ../PulseX.API/PulseX.API.csproj
```

### Step 5: Run the API

```bash
cd ../PulseX.API
dotnet run
```

The API will start on:
- HTTPS: `https://localhost:7xxx`
- HTTP: `http://localhost:5xxx`

### Step 6: Test the API

Open Swagger UI in your browser:
- `https://localhost:7xxx/swagger` or `http://localhost:5xxx/swagger`

## 📝 First Steps

### 1. Register a Patient

**POST** `/api/auth/register/patient`

```json
{
  "email": "patient@example.com",
  "password": "Password123!",
  "fullName": "John Doe",
  "phoneNumber": "1234567890",
  "dateOfBirth": "1990-01-01",
  "gender": "Male",
  "address": "123 Main St",
  "bloodType": "O+"
}
```

### 2. Login

**POST** `/api/auth/login`

```json
{
  "email": "patient@example.com",
  "password": "Password123!"
}
```

Response will include a JWT token:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "email": "patient@example.com",
  "fullName": "John Doe",
  "role": "Patient",
  "userId": 1
}
```

### 3. Use the Token

Copy the token from the login response and use it in subsequent requests:

In Swagger:
1. Click the **Authorize** button (🔒)
2. Enter: `Bearer YOUR_TOKEN_HERE`
3. Click **Authorize**

In Postman/Insomnia:
- Add header: `Authorization: Bearer YOUR_TOKEN_HERE`

## 🎯 Testing Common Scenarios

### Create Admin User (Manual Database Update)

Since the first admin needs to be created, you can:

1. Register as a patient first
2. Open SQL Server Management Studio or use SQL query:
   ```sql
   UPDATE Users SET Role = 3 WHERE Email = 'your-email@example.com'
   ```
3. Now log in as admin and create doctors/other admins

### Create a Doctor (Admin Only)

**POST** `/api/auth/create/doctor`

```json
{
  "email": "doctor@example.com",
  "password": "Password123!",
  "fullName": "Dr. Smith",
  "phoneNumber": "0987654321",
  "specialization": "Cardiology",
  "licenseNumber": "DOC12345",
  "consultationPrice": 150.00,
  "clinicLocation": "City Hospital, Room 301",
  "bio": "Experienced cardiologist with 15 years of practice",
  "yearsOfExperience": 15
}
```

### Book an Appointment (Patient Only)

**POST** `/api/appointment`

```json
{
  "doctorId": 1,
  "appointmentDate": "2024-12-25T10:00:00",
  "notes": "Regular checkup",
  "paymentMethod": 1
}
```

### Add Health Data (Patient Only)

**POST** `/api/healthdata`

```json
{
  "dataType": "BloodPressure",
  "value": "120/80",
  "unit": "mmHg",
  "notes": "Morning reading"
}
```

### Chat with AI (Patient Only)

**POST** `/api/chatbot`

```json
{
  "message": "What is my latest blood pressure reading?"
}
```

## 🔧 Troubleshooting

### Issue: Database Connection Error

**Solution**: 
- Verify SQL Server is running
- Check connection string in `appsettings.json`
- Ensure database is created with `dotnet ef database update`

### Issue: Migration Not Found

**Solution**:
```bash
cd PulseX.Data
dotnet ef migrations add InitialCreate --startup-project ../PulseX.API/PulseX.API.csproj
dotnet ef database update --startup-project ../PulseX.API/PulseX.API.csproj
```

### Issue: JWT Token Expired

**Solution**:
- Tokens expire after 7 days
- Login again to get a new token

### Issue: Unauthorized Error

**Solution**:
- Ensure you're using the correct role (Patient/Doctor/Admin)
- Verify token is included in Authorization header
- Check token hasn't expired

## 📚 Additional Resources

- **Full API Documentation**: See Swagger UI when running the API
- **Database Schema**: Check `ApplicationDbContext.cs` for entity relationships
- **Environment Setup**: See main `README.md` in Backend folder

## 🆘 Need Help?

1. Check the main README.md file
2. Review Swagger documentation
3. Check error logs in the console
4. Verify all prerequisites are installed

## 🎉 You're Ready!

Your PulseX Backend API is now running. Start building amazing features!

For frontend integration, the API is CORS-enabled and ready to accept requests from any origin (configured in `Program.cs`).

**Happy Coding! 🚀**
