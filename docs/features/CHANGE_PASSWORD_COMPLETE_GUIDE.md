# ?? Change Password Feature - Complete Guide

## ? Implementation Status: COMPLETE

---

## ?? **Overview**

The Change Password feature allows patients to securely update their password with comprehensive validation and security checks.

---

## ?? **Features**

### **Password Requirements:**
```
? At least 8 characters long
? Contains uppercase letters (A-Z)
? Contains lowercase letters (a-z)
? Contains at least one number (0-9)
```

### **Security Features:**
```
? Current password verification
? Password confirmation matching
? Real-time validation
? Secure password hashing (BCrypt)
? JWT authentication required
? Activity logging (optional)
```

---

## ?? **API Endpoint**

### **Change Password**
```http
POST /api/user/change-password
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!",
  "confirmNewPassword": "NewPass123!"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Responses:**

**1. Validation Error (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Password must be at least 8 characters long",
    "Password must contain uppercase, lowercase letters and at least one number"
  ]
}
```

**2. Incorrect Current Password (400 Bad Request):**
```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

**3. Passwords Don't Match (400 Bad Request):**
```json
{
  "success": false,
  "message": "Passwords do not match"
}
```

**4. Unauthorized (401):**
```json
{
  "message": "Unauthorized"
}
```

---

## ?? **DTO Structure**

### **ChangePasswordDto.cs**
```csharp
public class ChangePasswordDto
{
    [Required(ErrorMessage = "Current password is required")]
    public string CurrentPassword { get; set; }

    [Required(ErrorMessage = "New password is required")]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters long")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$", 
        ErrorMessage = "Password must contain uppercase, lowercase letters and at least one number")]
    public string NewPassword { get; set; }

    [Required(ErrorMessage = "Please confirm your new password")]
    [Compare("NewPassword", ErrorMessage = "Passwords do not match")]
    public string ConfirmNewPassword { get; set; }
}
```

---

## ?? **Frontend Implementation**

### **React Component Example**

```jsx
import React, { useState } from 'react';

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  
  const [errors, setErrors] = useState([]);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  // Password validation in real-time
  const validatePassword = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password)
    };
    return requirements;
  };
  
  const requirements = validatePassword(formData.newPassword);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        alert('Password changed successfully!');
        onClose();
      } else {
        setErrors(data.errors || [data.message]);
      }
    } catch (error) {
      setErrors(['An error occurred. Please try again.']);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Header */}
        <div className="modal-header">
          <h2>Change Password</h2>
          <p>Update your password securely</p>
          <button onClick={onClose}>×</button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit}>
          
          {/* Current Password */}
          <div className="form-group">
            <label>Current Password</label>
            <div className="input-with-icon">
              <input
                type={showPassword.current ? "text" : "password"}
                placeholder="Enter current password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword({...showPassword, current: !showPassword.current})}
              >
                ???
              </button>
            </div>
          </div>
          
          {/* New Password */}
          <div className="form-group">
            <label>New Password</label>
            <div className="input-with-icon">
              <input
                type={showPassword.new ? "text" : "password"}
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword({...showPassword, new: !showPassword.new})}
              >
                ???
              </button>
            </div>
          </div>
          
          {/* Confirm New Password */}
          <div className="form-group">
            <label>Confirm New Password</label>
            <div className="input-with-icon">
              <input
                type={showPassword.confirm ? "text" : "password"}
                placeholder="Confirm new password"
                value={formData.confirmNewPassword}
                onChange={(e) => setFormData({...formData, confirmNewPassword: e.target.value})}
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})}
              >
                ???
              </button>
            </div>
          </div>
          
          {/* Password Requirements */}
          <div className="password-requirements">
            <p>Password Requirements:</p>
            <ul>
              <li className={requirements.length ? 'valid' : ''}>
                ? At least 8 characters long
              </li>
              <li className={requirements.uppercase && requirements.lowercase ? 'valid' : ''}>
                ? Contains uppercase & lowercase letters
              </li>
              <li className={requirements.number ? 'valid' : ''}>
                ? Contains at least one number
              </li>
            </ul>
          </div>
          
          {/* Errors */}
          {errors.length > 0 && (
            <div className="error-messages">
              {errors.map((error, idx) => (
                <p key={idx}>{error}</p>
              ))}
            </div>
          )}
          
          {/* Buttons */}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-save">
              Save Password
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
```

---

### **CSS Styling**

```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  margin-bottom: 24px;
  position: relative;
}

.modal-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #010218;
  margin-bottom: 8px;
}

.modal-header p {
  font-size: 14px;
  color: #757575;
}

.modal-header button {
  position: absolute;
  top: 0;
  right: 0;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #757575;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #010218;
  margin-bottom: 8px;
}

.input-with-icon {
  position: relative;
}

.input-with-icon input {
  width: 100%;
  padding: 12px 40px 12px 12px;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.input-with-icon input:focus {
  border-color: #333CF5;
}

.input-with-icon button {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
}

.password-requirements {
  background: #F3F4F6;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.password-requirements p {
  font-size: 13px;
  font-weight: 600;
  color: #010218;
  margin-bottom: 12px;
}

.password-requirements ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.password-requirements li {
  font-size: 13px;
  color: #757575;
  margin-bottom: 8px;
  padding-left: 20px;
  position: relative;
}

.password-requirements li.valid {
  color: #059669;
}

.password-requirements li:before {
  content: '?';
  position: absolute;
  left: 0;
}

.error-messages {
  background: #FEE2E2;
  border: 1px solid #EF4444;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
}

.error-messages p {
  color: #DC2626;
  font-size: 13px;
  margin-bottom: 4px;
}

.error-messages p:last-child {
  margin-bottom: 0;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-cancel {
  padding: 12px 24px;
  background: #F3F4F6;
  color: #4B5563;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-cancel:hover {
  background: #E5E7EB;
}

.btn-save {
  padding: 12px 24px;
  background: #333CF5;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-save:hover {
  background: #2D32D8;
}
```

---

### **Integration in Settings Page**

```jsx
const SettingsPage = () => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  return (
    <div>
      {/* Account Settings Section */}
      <div className="account-settings">
        <h3>Account Settings</h3>
        
        <div className="setting-item">
          <div>
            <h4>Change Password</h4>
            <p>Update your password regularly for security</p>
          </div>
          <button onClick={() => setShowPasswordModal(true)}>
            Change
          </button>
        </div>
      </div>
      
      {/* Change Password Modal */}
      <ChangePasswordModal 
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
};
```

---

## ?? **Testing Guide**

### **Test Cases**

**1. Successful Password Change**
```json
POST /api/user/change-password
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!",
  "confirmNewPassword": "NewPass456!"
}
Expected: 200 OK, success message
```

**2. Incorrect Current Password**
```json
{
  "currentPassword": "WrongPassword",
  "newPassword": "NewPass456!",
  "confirmNewPassword": "NewPass456!"
}
Expected: 400 Bad Request, "Current password is incorrect"
```

**3. Password Too Short**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "New123",
  "confirmNewPassword": "New123"
}
Expected: 400 Bad Request, validation error
```

**4. Password Missing Requirements**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "newpassword",
  "confirmNewPassword": "newpassword"
}
Expected: 400 Bad Request, missing uppercase and number
```

**5. Passwords Don't Match**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!",
  "confirmNewPassword": "DifferentPass!"
}
Expected: 400 Bad Request, "Passwords do not match"
```

---

## ?? **Security Best Practices**

```
? Always verify current password before change
? Use BCrypt for password hashing
? Enforce strong password requirements
? Never log passwords in plain text
? Use HTTPS in production
? Implement rate limiting (optional)
? Add email notification on password change (optional)
? Invalidate all sessions after password change (optional)
```

---

## ?? **Password Validation Regex**

```regex
^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$

Explanation:
^              - Start of string
(?=.*[a-z])    - At least one lowercase letter
(?=.*[A-Z])    - At least one uppercase letter
(?=.*\d)       - At least one digit
.+             - Any character (one or more)
$              - End of string
```

---

## ?? **Next Steps**

1. ? Test endpoint in Swagger
2. ? Build frontend modal component
3. ? Add real-time password validation
4. ? (Optional) Add email notification
5. ? (Optional) Implement rate limiting
6. ? (Optional) Add session invalidation

---

## ?? **Support**

- **Backend Status**: ? COMPLETE
- **Frontend Status**: ? PENDING IMPLEMENTATION
- **Documentation**: This guide

---

**Last Updated**: 2025-02-16  
**Implementation**: ? BACKEND COMPLETE  
**Testing**: ? READY FOR FRONTEND INTEGRATION
