# ? Frequently Asked Questions - Password Reset System

## ?? Email Configuration

### Q: How do I get a Gmail App Password?
**A:** Follow these steps:
1. Go to your Google Account
2. Select Security ? 2-Step Verification (enable it first)
3. Go to: https://myaccount.google.com/apppasswords
4. Select "Mail" and "Windows Computer"
5. Click "Generate"
6. Copy the 16-character password (remove spaces)
7. Paste in `appsettings.json`

### Q: Can I use regular Gmail password?
**A:** No, Gmail requires App Passwords when using SMTP. Regular passwords won't work with 2FA enabled.

### Q: Can I use Outlook/Hotmail instead of Gmail?
**A:** Yes! Update `appsettings.json`:
```json
"Email": {
  "SmtpHost": "smtp-mail.outlook.com",
  "SmtpPort": "587",
  "Username": "your-email@outlook.com",
  "Password": "your-outlook-password",
  "FromEmail": "your-email@outlook.com",
  "FromName": "PulseX Support"
}
```

### Q: Email not sending, what to check?
**A:** 
1. Verify SMTP credentials are correct
2. Check that 2FA is enabled on Gmail
3. Ensure App Password has no spaces (should be 16 chars)
4. Check firewall/antivirus blocking port 587
5. Look at console logs for detailed error messages

---

## ?? OTP Issues

### Q: How long is the OTP valid?
**A:** 15 minutes from the time it's generated.

### Q: Can I use the same OTP twice?
**A:** No, each OTP can only be used once. After successful password reset, it's marked as used.

### Q: What if OTP expires?
**A:** User needs to go back to forgot-password page and request a new OTP.

### Q: Can I change OTP to 6 digits?
**A:** Yes, edit `PasswordResetService.cs`:
```csharp
private string GenerateOtp()
{
    var random = new Random();
    return random.Next(100000, 999999).ToString(); // 6 digits
}
```

### Q: How to implement "Resend OTP" in frontend?
**A:** Simply call the forgot-password endpoint again with the same email.

---

## ??? Database

### Q: Do I need to run migrations every time?
**A:** No, only once after creating the PasswordResetToken model. After that, the table persists.

### Q: How to check if migration was successful?
**A:** 
1. Open SQL Server Management Studio
2. Connect to your database
3. Look for `PasswordResetTokens` table
4. Or run: `SELECT * FROM PasswordResetTokens`

### Q: How to undo a migration?
**A:** 
```bash
dotnet ef migrations remove --project PulseX.Data --startup-project PulseX.API
```

### Q: Where are old OTP tokens stored?
**A:** In the `PasswordResetTokens` table. Expired tokens are automatically cleaned up after successful password reset.

---

## ?? Security

### Q: Is the password stored in plain text?
**A:** No, passwords are hashed using `PasswordHelper.HashPassword()` before storing.

### Q: Can someone brute force the OTP?
**A:** The 4-digit OTP gives 10,000 combinations. With 15-minute expiration and one-time use, it's reasonably secure. For production, consider:
- Using 6 digits (1,000,000 combinations)
- Adding rate limiting
- Implementing CAPTCHA

### Q: Are password reset actions logged?
**A:** Yes, all actions are logged in the `ActivityLogs` table with user ID, action type, and timestamp.

### Q: How to add rate limiting?
**A:** Consider using ASP.NET Core Rate Limiting middleware:
```csharp
builder.Services.AddRateLimiter(options => {
    options.AddFixedWindowLimiter("password-reset", opt => {
        opt.Window = TimeSpan.FromMinutes(15);
        opt.PermitLimit = 3;
    });
});
```

---

## ?? Frontend Integration

### Q: How to pass data between pages in React?
**A:** Use React Router's `location.state`:
```javascript
// Sending page
navigate('/verify-code', { state: { email: 'user@example.com' } });

// Receiving page
const location = useLocation();
const email = location.state?.email;
```

### Q: What if user refreshes the page?
**A:** The state will be lost. Consider:
1. Storing email in sessionStorage
2. Showing error message asking to restart flow
3. Implementing a "Continue where you left off" feature

### Q: How to handle API errors in frontend?
**A:**
```javascript
try {
  const response = await fetch('...');
  const data = await response.json();
  
  if (response.ok) {
    // Success
  } else {
    setError(data.message || 'An error occurred');
  }
} catch (err) {
  setError('Network error. Please try again.');
}
```

---

## ?? Deployment

### Q: What email service to use in production?
**A:** For production, use:
- **SendGrid** (Recommended, 100 emails/day free)
- **AWS SES** (Pay-as-you-go, very cheap)
- **Mailgun** (First 5,000 emails free)

These are more reliable and have better deliverability than Gmail.

### Q: How to configure SendGrid?
**A:**
```json
"Email": {
  "SmtpHost": "smtp.sendgrid.net",
  "SmtpPort": "587",
  "Username": "apikey",
  "Password": "YOUR_SENDGRID_API_KEY",
  "FromEmail": "noreply@yourdomain.com",
  "FromName": "PulseX Support"
}
```

### Q: Should I store email credentials in appsettings.json?
**A:** No! In production, use:
- Azure Key Vault
- AWS Secrets Manager
- Environment variables
- User Secrets (for development)

---

## ?? Testing

### Q: How to test without sending real emails?
**A:** Options:
1. Use a test email service like Mailtrap.io
2. Use a temporary email service
3. Create a mock EmailService for unit tests
4. Use your own test email account

### Q: How to test expired OTP?
**A:** 
1. Request OTP
2. Wait 15+ minutes
3. Try to use it ? Should get "OTP code has expired" error

Or modify the code temporarily for testing:
```csharp
ExpiresAt = DateTime.UtcNow.AddMinutes(1) // 1 minute for testing
```

### Q: How to test used OTP?
**A:**
1. Request OTP
2. Use it successfully (complete password reset)
3. Try to use same OTP again ? Should get "OTP code has already been used"

---

## ?? UI/UX

### Q: Should I show a countdown timer for OTP?
**A:** Yes, it's user-friendly. Example:
```javascript
const [timeLeft, setTimeLeft] = useState(900); // 15 minutes = 900 seconds

useEffect(() => {
  const timer = setInterval(() => {
    setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
  }, 1000);
  return () => clearInterval(timer);
}, []);

// Display: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
```

### Q: Should I show password strength indicator?
**A:** Yes, improves UX. Libraries:
- react-password-strength-bar
- zxcvbn (strength estimation)

### Q: What about "Show Password" toggle?
**A:** Definitely add it. See `ResetPassword.jsx` example in documentation.

---

## ?? Customization

### Q: How to change OTP expiration time?
**A:** Edit `PasswordResetService.cs`:
```csharp
ExpiresAt = DateTime.UtcNow.AddMinutes(30) // 30 minutes instead of 15
```

### Q: How to customize email template?
**A:** Edit the HTML in `EmailService.cs` ? `GenerateEmailBody()` method. Use your brand colors, logo, etc.

### Q: How to add SMS OTP in addition to email?
**A:** 
1. Add an SMS service (Twilio, MessageBird)
2. Create `ISmsService` interface
3. Let user choose: Email or SMS
4. Store choice and send OTP accordingly

---

## ?? Monitoring

### Q: How to monitor email delivery?
**A:** 
1. Check `ActivityLogs` table
2. Implement logging in `EmailService`
3. Use email service dashboard (SendGrid, AWS SES)
4. Set up alerts for failed deliveries

### Q: How to track password reset success rate?
**A:** Query `ActivityLogs` table:
```sql
SELECT 
  COUNT(CASE WHEN Action = 'Password Reset Requested' THEN 1 END) as Requested,
  COUNT(CASE WHEN Action = 'Password Reset Completed' THEN 1 END) as Completed
FROM ActivityLogs
WHERE CreatedAt >= DATEADD(day, -7, GETDATE())
```

---

## ?? Troubleshooting

### Q: Build errors after adding files?
**A:** Run `dotnet restore` then `dotnet build`

### Q: Migration errors?
**A:** 
1. Check connection string in appsettings.json
2. Ensure SQL Server is running
3. Check if you have permission to create tables
4. Look at detailed error message

### Q: "Email already exists" error?
**A:** This is for registration. For password reset, it should find the email. Check if email is spelled correctly.

### Q: No email received?
**A:** 
1. Check spam folder
2. Verify email address is correct
3. Check console logs for errors
4. Test SMTP connection
5. Try a different email address

---

## ?? Best Practices

### Q: Should I add CAPTCHA?
**A:** Yes, especially in production to prevent:
- Automated attacks
- Email bombing
- Resource abuse

Use: Google reCAPTCHA v3 (invisible)

### Q: Should I limit password reset requests?
**A:** Yes, implement rate limiting:
- Max 3 requests per IP per 15 minutes
- Max 5 requests per email per hour

### Q: What about account lockout?
**A:** Consider adding:
- Lock account after 5 failed OTP attempts
- Require admin intervention to unlock
- Send alert email to user

---

## ?? Additional Resources

- **ASP.NET Core**: https://docs.microsoft.com/aspnet/core
- **Entity Framework**: https://docs.microsoft.com/ef/core
- **SendGrid Docs**: https://docs.sendgrid.com
- **React Router**: https://reactrouter.com
- **Email Best Practices**: https://postmarkapp.com/guides

---

**Still have questions?** 

Check the full documentation:
- `FORGOT_PASSWORD_SETUP.md` (English)
- `FORGOT_PASSWORD_README_AR.md` (???????)

Or contact the development team! ??
