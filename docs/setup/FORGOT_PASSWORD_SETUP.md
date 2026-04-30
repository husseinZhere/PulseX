# PulseX Password Reset System - Setup Guide

## ?? Overview
This system provides a complete password reset flow with OTP verification:
1. User enters email ? Receives 4-digit OTP
2. User enters OTP ? Verifies code
3. User enters new password ? Password is reset

---

## ?? Database Migration

After adding all the files, you need to create and apply the database migration:

```bash
# Navigate to the Data project directory
cd Backend/PulseX.Data

# Add migration
dotnet ef migrations add AddPasswordResetToken --startup-project ../PulseX.API

# Update database
dotnet ef database update --startup-project ../PulseX.API
```

Or from the solution root:

```bash
dotnet ef migrations add AddPasswordResetToken --project PulseX.Data --startup-project PulseX.API
dotnet ef database update --project PulseX.Data --startup-project PulseX.API
```

---

## ?? Email Configuration

### Using Gmail (Recommended for Testing)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer" (or Other)
   - Copy the generated 16-character password

3. **Update `appsettings.json`**:

```json
"Email": {
  "SmtpHost": "smtp.gmail.com",
  "SmtpPort": "587",
  "Username": "your-email@gmail.com",
  "Password": "your-16-char-app-password",
  "FromEmail": "your-email@gmail.com",
  "FromName": "PulseX Support"
}
```

### Using Other Email Providers

**Outlook/Hotmail:**
```json
"Email": {
  "SmtpHost": "smtp-mail.outlook.com",
  "SmtpPort": "587",
  "Username": "your-email@outlook.com",
  "Password": "your-password",
  "FromEmail": "your-email@outlook.com",
  "FromName": "PulseX Support"
}
```

**SendGrid (Production Recommended):**
```json
"Email": {
  "SmtpHost": "smtp.sendgrid.net",
  "SmtpPort": "587",
  "Username": "apikey",
  "Password": "your-sendgrid-api-key",
  "FromEmail": "verified-email@yourdomain.com",
  "FromName": "PulseX Support"
}
```

---

## ?? API Endpoints

### 1. Request Password Reset
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "message": "A 4-digit verification code has been sent to your email"
}
```

### 2. Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "1234"
}
```

**Response (Success):**
```json
{
  "message": "OTP verified successfully",
  "isValid": true
}
```

### 3. Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "1234",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

**Response (Success):**
```json
{
  "message": "Password has been reset successfully"
}
```

---

## ?? Frontend Integration

### Update ForgotPassword.jsx
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!email) {
    setError("Email is required");
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (response.ok) {
      navigate('/verify-code', { state: { email } });
    } else {
      setError(data.message || 'Failed to send reset code');
    }
  } catch (err) {
    setError('An error occurred. Please try again.');
  }
};
```

### Update VerifyCode.jsx
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (code.length !== 4) {
    setError("Please enter a valid 4-digit code");
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: location.state?.email || '', 
        otp: code 
      })
    });

    const data = await response.json();

    if (response.ok) {
      navigate('/reset-password', { 
        state: { 
          email: location.state?.email, 
          otp: code 
        } 
      });
    } else {
      setError(data.message || 'Invalid OTP code');
    }
  } catch (err) {
    setError('An error occurred. Please try again.');
  }
};
```

### Add React Router Routes
```javascript
import ForgotPassword from './pages/ForgotPassword';
import VerifyCode from './pages/VerifyCode';
import ResetPassword from './pages/ResetPassword';

// In your router configuration:
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/verify-code" element={<VerifyCode />} />
<Route path="/reset-password" element={<ResetPassword />} />
```

---

## ? Testing Flow

1. **Start the backend:**
   ```bash
   cd Backend/PulseX.API
   dotnet run
   ```

2. **Open Swagger:** http://localhost:5000/swagger

3. **Test the flow:**
   - POST `/api/auth/forgot-password` with a valid user email
   - Check your email for the 4-digit OTP
   - POST `/api/auth/verify-otp` with email and OTP
   - POST `/api/auth/reset-password` with email, OTP, and new password
   - Try logging in with the new password

---

## ?? Security Features

- ? OTP expires after 15 minutes
- ? OTP can only be used once
- ? Password validation (minimum 6 characters)
- ? Email validation
- ? Activity logging for audit trail
- ? Automatic cleanup of expired tokens
- ? Secure password hashing

---

## ?? Database Schema

### PasswordResetTokens Table
| Column | Type | Description |
|--------|------|-------------|
| Id | int | Primary key |
| UserId | int | Foreign key to Users |
| Email | string | User's email |
| Token | string | 4-digit OTP |
| CreatedAt | DateTime | Token creation time |
| ExpiresAt | DateTime | Token expiration time (15 mins) |
| IsUsed | bool | Whether token has been used |

---

## ?? Important Notes

1. **Email Service**: The EmailService uses System.Net.Mail (built-in .NET). For production, consider using SendGrid or AWS SES for better deliverability.

2. **OTP Security**: The OTP is a 4-digit code for simplicity. For higher security, consider:
   - Using 6 digits
   - Adding rate limiting
   - Implementing CAPTCHA

3. **Error Handling**: All endpoints return appropriate error messages for better UX.

4. **Activity Logging**: All password reset actions are logged in the ActivityLog table.

---

## ?? Production Checklist

- [ ] Switch to SendGrid/AWS SES for email delivery
- [ ] Add rate limiting to prevent abuse
- [ ] Implement CAPTCHA on forgot-password form
- [ ] Set up email templates with company branding
- [ ] Configure proper error logging (e.g., Sentry)
- [ ] Add monitoring for failed email deliveries
- [ ] Implement automated cleanup of old tokens (background job)

---

## ?? Troubleshooting

### Email not sending?
- Check SMTP credentials in appsettings.json
- Verify Gmail App Password is correct (16 characters, no spaces)
- Check firewall/antivirus blocking port 587
- Look at console logs for error details

### OTP expired?
- OTP expires after 15 minutes
- Request a new OTP by submitting forgot-password again

### Invalid OTP?
- Make sure OTP is exactly 4 digits
- Check for typos
- Verify email matches the one used in forgot-password

---

## ?? Support
For issues or questions, contact the development team.

---

**Created for PulseX Graduation Project** ??
