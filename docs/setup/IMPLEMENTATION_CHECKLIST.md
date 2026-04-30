# ? PulseX Password Reset - Implementation Checklist

## ?? Backend Setup

### Database
- [ ] Run migration command: `dotnet ef migrations add AddPasswordResetToken --project PulseX.Data --startup-project PulseX.API`
- [ ] Update database: `dotnet ef database update --project PulseX.Data --startup-project PulseX.API`
- [ ] Verify `PasswordResetTokens` table exists in database

### Email Configuration
- [ ] Open Gmail account settings
- [ ] Enable 2-Factor Authentication
- [ ] Generate App Password from: https://myaccount.google.com/apppasswords
- [ ] Copy the 16-character password (remove spaces)
- [ ] Update `appsettings.json` with:
  - [ ] SmtpHost: "smtp.gmail.com"
  - [ ] SmtpPort: "587"
  - [ ] Username: Your Gmail address
  - [ ] Password: Your 16-char App Password (no spaces)
  - [ ] FromEmail: Your Gmail address
  - [ ] FromName: "PulseX Support"

### Services Registration (Already Done ?)
- [x] IPasswordResetRepository registered in Program.cs
- [x] PasswordResetService registered in Program.cs
- [x] IEmailService registered in Program.cs
- [x] EmailService registered in Program.cs

---

## ?? Frontend Setup

### React Router
- [ ] Add route for `/forgot-password` ? `<ForgotPassword />`
- [ ] Add route for `/verify-code` ? `<VerifyCode />`
- [ ] Add route for `/reset-password` ? `<ResetPassword />`

### Update ForgotPassword.jsx
- [ ] Import `useNavigate` from react-router-dom
- [ ] Add API call to `/api/auth/forgot-password`
- [ ] Pass email to next page via `navigate('/verify-code', { state: { email } })`
- [ ] Handle success and error responses
- [ ] Show loading state during API call

### Update VerifyCode.jsx
- [ ] Import `useLocation` and `useNavigate`
- [ ] Get email from `location.state?.email`
- [ ] Add API call to `/api/auth/verify-otp`
- [ ] Pass email and OTP to next page via `navigate('/reset-password', { state: { email, otp } })`
- [ ] Handle success and error responses
- [ ] Add "Resend Code" functionality (calls `/api/auth/forgot-password` again)

### Create/Update ResetPassword.jsx
- [ ] Import `useLocation` and `useNavigate`
- [ ] Get email and OTP from `location.state`
- [ ] Add form for New Password and Confirm Password
- [ ] Add password validation (min 6 characters)
- [ ] Add password match validation
- [ ] Add API call to `/api/auth/reset-password`
- [ ] Redirect to login on success
- [ ] Handle error responses

### UI/UX Enhancements
- [ ] Add loading spinners for API calls
- [ ] Add proper error messages display
- [ ] Add success messages
- [ ] Add "Show Password" toggle
- [ ] Add password strength indicator (optional)
- [ ] Add countdown timer for OTP expiration (optional)

---

## ?? Testing

### Backend Testing (Swagger/Postman)
- [ ] Test POST `/api/auth/forgot-password` with valid email
- [ ] Verify OTP email received
- [ ] Test POST `/api/auth/verify-otp` with correct OTP
- [ ] Test POST `/api/auth/reset-password` with new password
- [ ] Test login with new password
- [ ] Test with invalid email (should fail)
- [ ] Test with expired OTP (wait 15+ minutes)
- [ ] Test reusing same OTP (should fail)
- [ ] Test password mismatch (should fail)
- [ ] Test weak password (should fail)

### Frontend Testing
- [ ] Navigate to `/forgot-password`
- [ ] Enter valid email and submit
- [ ] Verify redirect to `/verify-code`
- [ ] Check email inbox for OTP
- [ ] Enter OTP and submit
- [ ] Verify redirect to `/reset-password`
- [ ] Enter new password and confirm password
- [ ] Verify redirect to login page
- [ ] Login with new password
- [ ] Test "Back to Login" button
- [ ] Test "Resend Code" button
- [ ] Test error handling for each step
- [ ] Test on mobile devices (responsive design)

### Edge Cases Testing
- [ ] Test with non-existent email
- [ ] Test with deactivated account
- [ ] Test with invalid OTP format (not 4 digits)
- [ ] Test navigation back button behavior
- [ ] Test page refresh during flow
- [ ] Test multiple password reset requests
- [ ] Test concurrent sessions

---

## ?? Documentation

- [x] Create FORGOT_PASSWORD_SETUP.md (English)
- [x] Create FORGOT_PASSWORD_README_AR.md (Arabic)
- [x] Create API_TESTING_GUIDE.md
- [x] Create MIGRATION_COMMANDS.txt
- [ ] Add API documentation to project README
- [ ] Document email template customization
- [ ] Add troubleshooting guide

---

## ?? Security Review

- [ ] Verify OTP expires after 15 minutes
- [ ] Verify OTP can only be used once
- [ ] Verify password is hashed before storing
- [ ] Verify email validation on all endpoints
- [ ] Verify rate limiting (optional, for production)
- [ ] Review activity logging
- [ ] Check for SQL injection vulnerabilities
- [ ] Verify CORS settings
- [ ] Review error messages (don't leak sensitive info)

---

## ?? Deployment Preparation

### Backend
- [ ] Update email settings for production SMTP service
- [ ] Configure proper error logging (Sentry, Application Insights)
- [ ] Set up email delivery monitoring
- [ ] Add rate limiting middleware
- [ ] Configure background job for token cleanup
- [ ] Update CORS policy for production domain
- [ ] Set up SSL/TLS certificates

### Frontend
- [ ] Update API base URL for production
- [ ] Add CAPTCHA to forgot-password form (optional)
- [ ] Optimize images and assets
- [ ] Test on different browsers
- [ ] Test on mobile devices
- [ ] Set up error tracking (Sentry, LogRocket)

---

## ?? Monitoring & Maintenance

- [ ] Set up alerts for failed email deliveries
- [ ] Monitor password reset success rate
- [ ] Track expired OTP rate
- [ ] Monitor API response times
- [ ] Set up automated cleanup of old tokens
- [ ] Review activity logs regularly
- [ ] Track user feedback

---

## ?? Support & Training

- [ ] Train support team on password reset flow
- [ ] Create user guide for password reset
- [ ] Prepare FAQ document
- [ ] Set up support email/chat
- [ ] Document common issues and solutions

---

## ?? Next Steps

1. **Immediate** (Today):
   - [ ] Run database migrations
   - [ ] Configure email settings
   - [ ] Test backend endpoints in Swagger

2. **Short Term** (This Week):
   - [ ] Update frontend pages
   - [ ] Add React Router routes
   - [ ] Complete end-to-end testing

3. **Medium Term** (Before Launch):
   - [ ] Security review
   - [ ] Performance testing
   - [ ] User acceptance testing

4. **Long Term** (Post-Launch):
   - [ ] Monitor metrics
   - [ ] Collect user feedback
   - [ ] Iterate on improvements

---

## ? Optional Enhancements

- [ ] Add SMS OTP option (in addition to email)
- [ ] Add biometric authentication
- [ ] Add "Remember this device" feature
- [ ] Add password history (prevent reusing old passwords)
- [ ] Add account lockout after multiple failed attempts
- [ ] Add multi-language support
- [ ] Add dark mode support
- [ ] Add accessibility features (WCAG compliance)

---

**Current Status**: ? Backend Complete | ? Frontend Integration Pending

**Last Updated**: 2025-01-01
