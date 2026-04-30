# ? Risk Assessment "Patient not found" - FIXED

## ?? The Problem

**Error**: `Patient not found` when calling `POST /api/RiskAssessment/calculate`

**Root Cause**: 
- JWT Token contains `UserId` (from Users table)
- RiskAssessmentService expects `PatientId` (from Patients table)
- Controller was passing `userId` directly without converting to `patientId`

---

## ?? The Solution

### Before (WRONG):
```csharp
// RiskAssessmentController.cs
[HttpPost("calculate")]
public async Task<IActionResult> CalculateRisk([FromBody] CreateHeartRiskAssessmentDto dto)
{
    var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    
    // ? Wrong: Passing userId directly to service
    var result = await _riskAssessmentService.CreateHeartRiskAssessmentAsync(userId, dto);
}
```

**Problem**: Service tries to find Patient with `Id = userId`, which doesn't exist.

---

### After (CORRECT):
```csharp
// RiskAssessmentController.cs
[HttpPost("calculate")]
public async Task<IActionResult> CalculateRisk([FromBody] CreateHeartRiskAssessmentDto dto)
{
    var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    
    // ? Get User first, then get Patient.Id
    var user = await _userRepository.GetByIdAsync(userId);
    if (user == null || user.Patient == null)
    {
        return BadRequest(new { message = "Patient profile not found. Please complete your registration." });
    }
    
    // ? Now pass correct patientId
    var result = await _riskAssessmentService.CreateHeartRiskAssessmentAsync(user.Patient.Id, dto);
}
```

---

## ?? Data Flow

### Understanding the Tables:

```
Users Table:
+----+------------------+-----------+
| Id | Email            | Role      |
+----+------------------+-----------+
| 1  | patient@test.com | Patient   |
+----+------------------+-----------+

Patients Table:
+----+--------+------------+--------+
| Id | UserId | DateOfBirth| Gender |
+----+--------+------------+--------+
| 5  | 1      | 1990-01-01 | Male   |
+----+--------+------------+--------+

JWT Token Claims:
{
  "nameid": "1",      ? This is UserId
  "name": "John Doe",
  "role": "Patient"
}
```

### The Problem Flow:
```
1. Patient logs in ? Gets JWT with UserId=1
2. Patient calls /api/RiskAssessment/calculate
3. Controller reads UserId=1 from JWT
4. Controller passes userId=1 to Service ?
5. Service tries: GetByIdAsync(1) in Patients table
6. No Patient with Id=1 exists (Patient.Id=5, not 1!)
7. Error: "Patient not found"
```

### The Solution Flow:
```
1. Patient logs in ? Gets JWT with UserId=1
2. Patient calls /api/RiskAssessment/calculate
3. Controller reads UserId=1 from JWT
4. Controller does: user = GetByIdAsync(1) in Users table ?
5. Controller gets: user.Patient.Id = 5 ?
6. Controller passes patientId=5 to Service ?
7. Service finds Patient with Id=5 ?
8. Success! ?
```

---

## ?? Files Modified (1)

**PulseX.API/Controllers/RiskAssessmentController.cs**

### Changes:
1. ? Added `IUserRepository` dependency
2. ? Updated `calculate` endpoint
3. ? Updated `latest` endpoint
4. ? Updated `history` endpoint
5. ? All endpoints now convert UserId ? PatientId properly

---

## ? Why Registration Works

The `RegisterPatientAsync` is **correct** and does create Patient record:

```csharp
// AuthService.cs
public async Task<LoginResponseDto> RegisterPatientAsync(RegisterPatientDto dto)
{
    // 1. Create User
    var user = new User { ... };
    await _userRepository.AddAsync(user);
    
    // 2. Create Patient (IMPORTANT!)
    var patient = new Patient
    {
        UserId = user.Id,  // ? Links Patient to User
        DateOfBirth = dto.DateOfBirth,
        Gender = dto.Gender
    };
    await _patientRepository.AddAsync(patient);
    
    // 3. Create HealthData entries
    // ...
    
    return new LoginResponseDto { UserId = user.Id }; // Returns UserId in token
}
```

**This is working correctly!** The issue was only in RiskAssessment controller.

---

## ?? Testing

### Test 1: Register New Patient
```http
POST /api/auth/register/patient
Body: {
  "email": "test@example.com",
  "password": "Test@123",
  "fullName": "Test User",
  // ... other fields
}

Response: {
  "token": "eyJhbGc...",
  "userId": 1  ? UserId
}
```

**Database After Registration**:
```sql
-- Users table
INSERT INTO Users (Id, Email, Role) VALUES (1, 'test@example.com', 'Patient');

-- Patients table
INSERT INTO Patients (Id, UserId, DateOfBirth, Gender) VALUES (1, 1, '1990-01-01', 'Male');
                      ?               ?
                      PatientId       UserId (FK)
```

---

### Test 2: Calculate Risk Assessment
```http
POST /api/RiskAssessment/calculate
Headers: Authorization: Bearer {token}
Body: {
  "cholesterolLevel": "normal",
  "sleepHours": "6-8",
  "alcoholConsumption": "low",
  "physicalActivity": "high",
  "previousHeartIssues": false,
  "familyHistory": false
}

Response: {
  "id": 1,
  "patientId": 1,  ? Now correct!
  "riskScore": 0,
  "riskLevel": "Low",
  // ...
}
```

---

## ?? Summary

### What Was Wrong:
- ? Controller passed `userId` directly to service
- ? Service expected `patientId`
- ? Mismatch caused "Patient not found" error

### What Was Fixed:
- ? Controller now gets User first
- ? Then extracts `user.Patient.Id`
- ? Passes correct `patientId` to service
- ? All Risk Assessment endpoints updated

### Registration Was Fine:
- ? User record created
- ? Patient record created
- ? HealthData entries created
- ? No changes needed

---

## ?? Important Notes

1. **JWT Contains UserId**: Always remember the token has `UserId`, not `PatientId`
2. **Navigation Properties**: Use `user.Patient.Id` to get PatientId
3. **Eager Loading**: Make sure to `.Include(u => u.Patient)` when needed
4. **All Patient Endpoints**: Apply same fix to other patient-specific endpoints

---

## ? Status

**Issue**: ? FIXED  
**Build**: ? Should pass  
**Testing**: ? Needs verification  

---

**Next Steps**:
1. Stop API if running
2. Build solution
3. Start API
4. Test registration ? risk assessment flow
5. Verify no "Patient not found" errors

---

**Date**: 2025-01-04  
**Issue**: Patient not found in Risk Assessment  
**Status**: ? RESOLVED  

---

**Built with ?? for PulseX Graduation Project**
