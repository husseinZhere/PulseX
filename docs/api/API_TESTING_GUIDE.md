# PulseX - Password Reset API Testing

## ?? Base URL
```
http://localhost:5000/api/auth
```

---

## 1?? Step 1: Request Password Reset (Send OTP)

### Endpoint
```
POST {{baseUrl}}/forgot-password
```

### Headers
```
Content-Type: application/json
```

### Body
```json
{
  "email": "test@example.com"
}
```

### Expected Response (200 OK)
```json
{
  "message": "A 4-digit verification code has been sent to your email"
}
```

### Possible Errors
- **400 Bad Request**: "Email not found"
- **400 Bad Request**: "Account is deactivated"

---

## 2?? Step 2: Verify OTP

### Endpoint
```
POST {{baseUrl}}/verify-otp
```

### Headers
```
Content-Type: application/json
```

### Body
```json
{
  "email": "test@example.com",
  "otp": "1234"
}
```

### Expected Response (200 OK)
```json
{
  "message": "OTP verified successfully",
  "isValid": true
}
```

### Possible Errors
- **400 Bad Request**: "Invalid OTP code"
- **400 Bad Request**: "OTP code has expired"
- **400 Bad Request**: "OTP code has already been used"

---

## 3?? Step 3: Reset Password

### Endpoint
```
POST {{baseUrl}}/reset-password
```

### Headers
```
Content-Type: application/json
```

### Body
```json
{
  "email": "test@example.com",
  "otp": "1234",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

### Expected Response (200 OK)
```json
{
  "message": "Password has been reset successfully"
}
```

### Possible Errors
- **400 Bad Request**: "Passwords do not match"
- **400 Bad Request**: "Password must be at least 6 characters long"
- **400 Bad Request**: "Invalid OTP code"
- **400 Bad Request**: "OTP code has expired"
- **400 Bad Request**: "OTP code has already been used"

---

## 4?? Step 4: Test Login with New Password

### Endpoint
```
POST {{baseUrl}}/login
```

### Headers
```
Content-Type: application/json
```

### Body
```json
{
  "email": "test@example.com",
  "password": "NewPassword123!"
}
```

### Expected Response (200 OK)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "test@example.com",
  "fullName": "Test User",
  "role": "Patient",
  "userId": 1
}
```

---

## ?? Complete Test Flow

### Prerequisites
1. Have a test user account in the database
2. Configure email settings in appsettings.json
3. Start the API: `dotnet run`

### Test Sequence
```bash
# 1. Request OTP
POST /forgot-password
{"email": "test@example.com"}
? Check email inbox for 4-digit code

# 2. Verify OTP
POST /verify-otp
{"email": "test@example.com", "otp": "1234"}
? Should return isValid: true

# 3. Reset Password
POST /reset-password
{
  "email": "test@example.com",
  "otp": "1234",
  "newPassword": "NewPass123!",
  "confirmPassword": "NewPass123!"
}
? Should return success message

# 4. Login with new password
POST /login
{"email": "test@example.com", "password": "NewPass123!"}
? Should return JWT token
```

---

## ?? Edge Cases to Test

### Invalid Email
```json
POST /forgot-password
{"email": "nonexistent@example.com"}
? Should return "Email not found"
```

### Expired OTP
```json
# Wait 15+ minutes after receiving OTP
POST /verify-otp
{"email": "test@example.com", "otp": "1234"}
? Should return "OTP code has expired"
```

### Reuse OTP
```json
# Use same OTP twice
POST /reset-password (first time) ? Success
POST /reset-password (second time with same OTP)
? Should return "OTP code has already been used"
```

### Password Mismatch
```json
POST /reset-password
{
  "email": "test@example.com",
  "otp": "1234",
  "newPassword": "Password123!",
  "confirmPassword": "DifferentPassword123!"
}
? Should return "Passwords do not match"
```

### Weak Password
```json
POST /reset-password
{
  "email": "test@example.com",
  "otp": "1234",
  "newPassword": "12345",
  "confirmPassword": "12345"
}
? Should return "Password must be at least 6 characters long"
```

---

## ?? Thunder Client Collection

Import this JSON into Thunder Client:

```json
{
  "client": "Thunder Client",
  "collectionName": "PulseX - Password Reset",
  "dateExported": "2025-01-01",
  "version": "1.0",
  "folders": [],
  "requests": [
    {
      "name": "1. Forgot Password",
      "method": "POST",
      "url": "http://localhost:5000/api/auth/forgot-password",
      "headers": [
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ],
      "body": {
        "type": "json",
        "raw": "{\n  \"email\": \"test@example.com\"\n}"
      }
    },
    {
      "name": "2. Verify OTP",
      "method": "POST",
      "url": "http://localhost:5000/api/auth/verify-otp",
      "headers": [
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ],
      "body": {
        "type": "json",
        "raw": "{\n  \"email\": \"test@example.com\",\n  \"otp\": \"1234\"\n}"
      }
    },
    {
      "name": "3. Reset Password",
      "method": "POST",
      "url": "http://localhost:5000/api/auth/reset-password",
      "headers": [
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ],
      "body": {
        "type": "json",
        "raw": "{\n  \"email\": \"test@example.com\",\n  \"otp\": \"1234\",\n  \"newPassword\": \"NewPassword123!\",\n  \"confirmPassword\": \"NewPassword123!\"\n}"
      }
    },
    {
      "name": "4. Login (Test New Password)",
      "method": "POST",
      "url": "http://localhost:5000/api/auth/login",
      "headers": [
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ],
      "body": {
        "type": "json",
        "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"NewPassword123!\"\n}"
      }
    }
  ]
}
```

---

## ? Checklist

- [ ] API is running on http://localhost:5000
- [ ] Email settings configured in appsettings.json
- [ ] Database migration applied
- [ ] Test user account exists
- [ ] Email inbox accessible for OTP verification
- [ ] All 4 endpoints tested successfully

---

**Happy Testing! ??**
