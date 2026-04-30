# ?? Change Password Modal - ???? ??????? ??????

## ? ??????: Backend ???? ???????!

---

## ?? **???????:**

??? ??? ?????? ??? **"Change"** ?? Account Settings? ???? Popup ?????? ???? ?????? ?? validation ????.

---

## ? **?????? ??? Modal:**

### **1?? Header:**
```
? ???????: "Change Password"
? ???: "Update your password securely"
? ?? ????? (×)
```

### **2?? Input Fields:**
```
? Current Password     (?? ?????? ??? ??????/?????)
? New Password         (?? ?????? ???)
? Confirm New Password (?? ?????? ???)
```

### **3?? Password Requirements:**
```
? At least 8 characters long
? Contains uppercase & lowercase letters
? Contains at least one number
```

### **4?? Buttons:**
```
? Cancel      (????? - ???? ???????)
? Save Password (???? - ???? ?????????)
```

---

## ?? **API Endpoint:**

```http
POST /api/user/change-password
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "???????123!",
  "newPassword": "???????456!",
  "confirmNewPassword": "???????456!"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

---

## ?? **Frontend - React Component:**

### **????? ??????:**

```jsx
import React, { useState } from 'react';
import './ChangePasswordModal.css';

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
  
  // ?????? ?? ??????? ???? ??????
  const validatePassword = (password) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password)
    };
  };
  
  const requirements = validatePassword(formData.newPassword);
  
  // ????? ?????
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        alert('? ?? ????? ???? ?????? ?????!');
        onClose();
        // ???????: ????? ????? ??? Login
        // window.location.href = '/login';
      } else {
        setErrors(data.errors || [data.message]);
      }
    } catch (error) {
      setErrors(['??? ???. ???? ??? ????.']);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>Change Password</h2>
            <p>Update your password securely</p>
          </div>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit}>
          
          {/* Current Password */}
          <div className="form-group">
            <label>Current Password</label>
            <div className="input-wrapper">
              <input
                type={showPassword.current ? "text" : "password"}
                placeholder="Enter current password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                required
              />
              <button 
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword({...showPassword, current: !showPassword.current})}
              >
                {showPassword.current ? '??' : '???'}
              </button>
            </div>
          </div>
          
          {/* New Password */}
          <div className="form-group">
            <label>New Password</label>
            <div className="input-wrapper">
              <input
                type={showPassword.new ? "text" : "password"}
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                required
              />
              <button 
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword({...showPassword, new: !showPassword.new})}
              >
                {showPassword.new ? '??' : '???'}
              </button>
            </div>
          </div>
          
          {/* Confirm Password */}
          <div className="form-group">
            <label>Confirm New Password</label>
            <div className="input-wrapper">
              <input
                type={showPassword.confirm ? "text" : "password"}
                placeholder="Confirm new password"
                value={formData.confirmNewPassword}
                onChange={(e) => setFormData({...formData, confirmNewPassword: e.target.value})}
                required
              />
              <button 
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})}
              >
                {showPassword.confirm ? '??' : '???'}
              </button>
            </div>
          </div>
          
          {/* Password Requirements */}
          <div className="requirements">
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
            <div className="errors">
              {errors.map((error, idx) => (
                <p key={idx}>?? {error}</p>
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

### **??? CSS:**

```css
/* ChangePasswordModal.css */

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
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.modal-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #010218;
  margin-bottom: 4px;
}

.modal-header p {
  font-size: 14px;
  color: #757575;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #757575;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #F3F4F6;
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

.input-wrapper {
  position: relative;
}

.input-wrapper input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
}

.input-wrapper input:focus {
  border-color: #333CF5;
  box-shadow: 0 0 0 3px rgba(51, 60, 245, 0.1);
}

.eye-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 4px;
}

.requirements {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.requirements p {
  font-size: 13px;
  font-weight: 600;
  color: #010218;
  margin-bottom: 12px;
}

.requirements ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.requirements li {
  font-size: 13px;
  color: #6B7280;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.requirements li.valid {
  color: #059669;
  font-weight: 500;
}

.errors {
  background: #FEE2E2;
  border: 1px solid #EF4444;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
}

.errors p {
  color: #DC2626;
  font-size: 13px;
  margin: 4px 0;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
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
  transition: all 0.2s;
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
  transition: all 0.2s;
}

.btn-save:hover {
  background: #2D32D8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(51, 60, 245, 0.3);
}
```

---

## ?? **????? ?? Settings Page:**

```jsx
// ?? SettingsPage.jsx

import React, { useState } from 'react';
import ChangePasswordModal from './ChangePasswordModal';

const SettingsPage = () => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  return (
    <div className="settings-page">
      {/* Account Settings Section */}
      <div className="account-settings">
        <h3>?? Account Settings</h3>
        
        {/* Change Password */}
        <div className="setting-item">
          <div className="setting-info">
            <h4>Change Password</h4>
            <p>Update your password regularly for security</p>
          </div>
          <button 
            className="btn-change"
            onClick={() => setShowPasswordModal(true)}
          >
            Change
          </button>
        </div>
        
        {/* Email Notifications */}
        <div className="setting-item">
          <div className="setting-info">
            <h4>Email Notifications</h4>
            <p>Receive email updates about your account</p>
          </div>
          <label className="toggle">
            <input type="checkbox" defaultChecked />
            <span className="slider"></span>
          </label>
        </div>
        
        {/* Dark Mode */}
        <div className="setting-item">
          <div className="setting-info">
            <h4>Dark Mode</h4>
            <p>Switch to dark theme</p>
          </div>
          <label className="toggle">
            <input type="checkbox" />
            <span className="slider"></span>
          </label>
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

export default SettingsPage;
```

---

## ?? **?????? ??? Feature:**

### **?? ???????:**

1. ???? Settings Page
2. ???? ??? "Change" ??? Change Password
3. ???? ??????:
   - Current Password: ???? ?????? ???????
   - New Password: ???? ???? ????? ????
   - Confirm Password: ??? ?????? ???????

4. ???? ?? ???? ? ???? ??? ?? requirement
5. ???? "Save Password"
6. ???? ?? ???? ????? ??????

---

## ?? **????? ???????:**

### **1. ???? ?????? ??????? ?????:**
```
? Current password is incorrect
```

### **2. ???? ?????? ?????:**
```
? Password must be at least 8 characters long
```

### **3. ???? ?????? ?????:**
```
? Password must contain uppercase, lowercase letters and at least one number
```

### **4. ????? ?????? ??? ???????:**
```
? Passwords do not match
```

---

## ?? **Password Requirements (????????):**

```
? ?????: 8 ???? ??? ?????
? ??? ????: A-Z
? ??? ????: a-z
? ???: 0-9
? (???????) ??? ???: !@#$%^&*
```

### **?????:**

```
? password123     (?? ???? ??? ????)
? PASSWORD123     (?? ???? ??? ????)
? PasswordABC     (?? ???? ???)
? Pass123         (???? ????)
? Password123     (????!)
? MyPass456!      (?????!)
```

---

## ?? **Validation Flow:**

```
1. User ???? ????????
2. Real-time validation ??? requirements
3. Submit ? Backend validation
4. Success ? ????? ??? Password + ????? ????
5. Error ? ??? ????? ?? ??? Modal
```

---

## ? **Checklist:**

### Backend:
- [x] DTO ?? validation
- [x] Service method ??????
- [x] Controller endpoint
- [x] Password hashing (BCrypt)
- [x] Error messages ?????
- [x] Build ????

### Frontend:
- [ ] Component ??? Modal
- [ ] CSS styling
- [ ] Real-time validation
- [ ] Show/Hide password
- [ ] Error handling
- [ ] Success notification
- [ ] ????? ?? Settings Page

---

## ?? **?????? ???????:**

1. ? Backend ????
2. ? ????? ??? Component
3. ? ????? ??? CSS
4. ? ??? ??? API
5. ? ?????? ????
6. ? Deploy

---

## ?? **?????:**

- **Backend Status**: ? ???? 100%
- **Frontend Status**: ? ???? ???????
- **API Endpoint**: `/api/user/change-password`
- **?????? ??????**: `CHANGE_PASSWORD_COMPLETE_GUIDE.md`

---

**??? ?????**: 16 ?????? 2025  
**??????**: ? **BACKEND COMPLETE**  
**????? ???? ????? ??????! ??**
