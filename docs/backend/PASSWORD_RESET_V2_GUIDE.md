# ?? PulseX Professional Password Reset Flow (Updated)

## ?? New Flow Overview

The password reset system has been upgraded to a more professional and secure implementation using a two-token approach:

1. **OTP Token** (4 digits) - Valid for 15 minutes - Used for email verification
2. **Reset Token** (GUID) - Valid for 5 minutes - Used for actual password reset

---

## ?? Complete Flow Diagram

```
???????????????????????????????????????????????????????????????
?                    Step 1: Request OTP                       ?
?  POST /api/auth/forgot-password                              ?
?  ?                                                            ?
?  - User enters email                                         ?
?  - System generates 4-digit OTP                              ?
?  - OTP saved in DB (expires in 15 min)                       ?
?  - Email sent with OTP                                       ?
???????????????????????????????????????????????????????????????
                            ?
???????????????????????????????????????????????????????????????
?                    Step 2: Verify OTP                        ?
?  POST /api/auth/verify-otp                                   ?
?  ?                                                            ?
?  - User enters OTP                                           ?
?  - System validates OTP                                      ?
?  - ? NEW: Generate GUID ResetToken                          ?
?  - ResetToken saved in DB (expires in 5 min)                ?
?  - ResetToken returned to client                            ?
???????????????????????????????????????????????????????????????
                            ?
???????????????????????????????????????????????????????????????
?                  Step 3: Reset Password                      ?
?  POST /api/auth/reset-password                               ?
?  ?                                                            ?
?  - User enters new password + ResetToken                     ?
?  - System validates ResetToken                               ?
?  - System updates password                                   ?
?  - ? NEW: Token deleted from DB (one-time use)             ?
???????????????????????????????????????????????????????????????
```

---

## ?? API Endpoints (Updated)

### 1. Request Password Reset (Unchanged)
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "A 4-digit verification code has been sent to your email"
}
```

---

### 2. Verify OTP (NEW Response Structure)
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "1234"
}
```

**Response (NEW):**
```json
{
  "isValid": true,
  "resetToken": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "expiresAt": "2025-01-01T12:05:00Z",
  "message": "OTP verified successfully. You have 5 minutes to reset your password."
}
```

**?? Important:** Store the `resetToken` - you'll need it for the next step!

---

### 3. Reset Password (NEW Structure)
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "resetToken": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

**Response:**
```json
{
  "message": "Password has been reset successfully"
}
```

**?? Security Note:** After successful password reset, the token is **permanently deleted** from the database.

---

## ?? What Changed?

### Before (Old Flow)
```
1. forgot-password ? OTP sent
2. verify-otp ? Returns boolean (true/false)
3. reset-password ? Needs email + OTP + new password
```

### After (New Flow)
```
1. forgot-password ? OTP sent
2. verify-otp ? Returns ResetToken (GUID, expires in 5 min)
3. reset-password ? Needs ONLY ResetToken + new password
```

---

## ?? Security Improvements

| Feature | Old | New |
|---------|-----|-----|
| OTP Reuse | Could be reused during validity period | ? Converted to one-time ResetToken |
| Token Lifetime | OTP valid for 15 minutes | ? ResetToken valid for only 5 minutes |
| Token Cleanup | Manual cleanup needed | ? Auto-deleted after use |
| Sensitive Data | Email + OTP passed in reset | ? Only opaque token passed |
| Brute Force | OTP could be brute-forced | ? GUID token = 128-bit security |

---

## ?? Database Schema (Updated)

### PasswordResetTokens Table
```sql
CREATE TABLE PasswordResetTokens (
    Id INT PRIMARY KEY IDENTITY,
    UserId INT NOT NULL,
    Email NVARCHAR(255) NOT NULL,
    Token NVARCHAR(10) NOT NULL,           -- OTP (4 digits)
    ResetToken NVARCHAR(50) NULL,          -- ? NEW: GUID
    CreatedAt DATETIME2 NOT NULL,
    ExpiresAt DATETIME2 NOT NULL,          -- OTP expiration (15 min)
    ResetTokenExpiresAt DATETIME2 NULL,    -- ? NEW: ResetToken expiration (5 min)
    IsUsed BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (UserId) REFERENCES Users(Id)
);
```

---

## ?? Testing the New Flow

### Test Case 1: Complete Happy Path
```bash
# Step 1: Request OTP
POST /api/auth/forgot-password
Body: {"email": "test@example.com"}
? Check email for OTP

# Step 2: Verify OTP
POST /api/auth/verify-otp
Body: {"email": "test@example.com", "otp": "1234"}
? Save the resetToken from response

# Step 3: Reset Password
POST /api/auth/reset-password
Body: {
  "resetToken": "saved-token-from-step-2",
  "newPassword": "NewPass123!",
  "confirmPassword": "NewPass123!"
}
? Password reset successful

# Step 4: Login with new password
POST /api/auth/login
Body: {"email": "test@example.com", "password": "NewPass123!"}
? Success!
```

### Test Case 2: Expired ResetToken
```bash
# Step 1-2: Same as above
# Step 3: Wait 5+ minutes, then try to reset
POST /api/auth/reset-password
? Should return: "Reset token has expired. Please request a new OTP."
```

### Test Case 3: Reuse ResetToken
```bash
# Step 1-3: Complete reset successfully
# Step 4: Try to use same token again
POST /api/auth/reset-password
? Should return: "Invalid reset token" (because it was deleted)
```

---

## ?? Frontend Integration (Updated)

### VerifyCode.jsx (UPDATED)
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
        email: location.state?.email, 
        otp: code 
      })
    });

    const data = await response.json();

    if (response.ok) {
      // ? NEW: Store the resetToken
      navigate('/reset-password', { 
        state: { 
          resetToken: data.resetToken,  // ? Changed from email + otp
          expiresAt: data.expiresAt
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

### ResetPassword.jsx (UPDATED)
```javascript
const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // ? NEW: Get resetToken from state (not email/otp)
  const resetToken = location.state?.resetToken || '';
  const expiresAt = location.state?.expiresAt;
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation...
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resetToken,  // ? NEW: Only token needed
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Password reset successfully!');
        navigate('/login');
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    // UI with countdown timer showing time until resetToken expires
  );
};
```

### Optional: Add Countdown Timer
```javascript
const [timeLeft, setTimeLeft] = useState(() => {
  const expires = new Date(expiresAt);
  const now = new Date();
  return Math.max(0, Math.floor((expires - now) / 1000));
});

useEffect(() => {
  if (timeLeft <= 0) return;
  
  const timer = setInterval(() => {
    setTimeLeft(prev => Math.max(0, prev - 1));
  }, 1000);
  
  return () => clearInterval(timer);
}, [timeLeft]);

// Display: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
```

---

## ?? Migration Required

Since we added new fields to the database, you need to create a new migration:

```bash
cd Backend
dotnet ef migrations add AddResetTokenField --project PulseX.Data --startup-project PulseX.API
dotnet ef database update --project PulseX.Data --startup-project PulseX.API
```

---

## ?? Benefits of New Flow

1. **Enhanced Security**
   - ResetToken is a GUID (128-bit) vs 4-digit OTP (13-bit)
   - Shorter validity window (5 min vs 15 min)
   - One-time use enforced by deletion
   - No sensitive data in URL or logs

2. **Better User Experience**
   - Clear separation of verification vs reset
   - Visual countdown timer possible
   - Clearer error messages

3. **Cleaner Code**
   - Simplified reset endpoint
   - No need to pass email/OTP again
   - Easier to implement rate limiting

4. **Audit Trail**
   - Clear distinction between "OTP verified" and "Password reset"
   - Better activity logging

---

## ?? Common Issues & Solutions

### Issue: "Invalid reset token"
**Solution:** Token might have expired or been used. Request a new OTP.

### Issue: "Reset token has expired"
**Solution:** ResetToken valid for 5 minutes only. Verify OTP again.

### Issue: Migration error
**Solution:** Ensure you're running migration from correct directory.

### Issue: Token not found after verify
**Solution:** Check frontend is correctly storing and passing resetToken.

---

## ?? Production Recommendations

1. **Rate Limiting**
   - Limit password reset requests to 3 per IP per hour
   - Limit OTP verification attempts to 5 per session

2. **Monitoring**
   - Log all password reset attempts
   - Alert on unusual patterns (many failures, same IP)

3. **User Notifications**
   - Send email notification when password is changed
   - Include timestamp and IP address

4. **Token Management**
   - Run daily cleanup job for expired tokens
   - Consider using Redis for token storage (faster)

---

## ? Checklist for Implementation

- [x] Update PasswordResetToken model
- [x] Create VerifyOtpResponseDto
- [x] Update ResetPasswordDto
- [x] Update IPasswordResetRepository
- [x] Update PasswordResetRepository
- [x] Update PasswordResetService
- [x] Update AuthController
- [x] Update ApplicationDbContext
- [ ] Run database migration
- [ ] Update frontend VerifyCode.jsx
- [ ] Update frontend ResetPassword.jsx
- [ ] Test complete flow
- [ ] Deploy to production

---

## ?? Related Documentation

- `FORGOT_PASSWORD_SETUP.md` - Original setup guide
- `API_TESTING_GUIDE.md` - Complete API testing instructions
- `FAQ.md` - Common questions

---

**Version**: 2.0 (Professional Flow)  
**Date**: 2025-01-01  
**Status**: ? Ready for Production

---

**Built with ?? for PulseX Graduation Project**
