# ?? ???? ????? ?????? (Logout) - ???? ??????? ??????

## ?? ???? ????

?? ????? ???? Logout ???? ??????? ??????? ?? ????? popup ???? ????? ????? ??? ????? ??????.

---

## ?? ??????? ???????

### 1. **Logout ??????? (Doctor Logout)**
- ? Endpoint ????? ?? `DoctorController`
- ? Authorization ??????? ???
- ? ????? ???????? ??????? ???????????
- ? ??????? ???????? ?? ?????????

### 2. **Logout ?????? (Patient Logout)**
- ? Endpoint ????? ?? `UserController`
- ? Authorization ?????? ???
- ? ????? ???????? ??????? ???????????
- ? ??????? ???????? ?? ?????????

---

## ?? API Endpoints

### 1?? Logout ???????

```http
POST /api/doctor/logout
Authorization: Bearer {token}
```

#### Request Headers:
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Success Response (200 OK):
```json
{
  "success": true,
  "message": "?? ????? ?????? ?????",
  "messageEn": "Logged out successfully",
  "user": {
    "userId": 5,
    "userName": "Dr. Ahmed Mohamed"
  }
}
```

#### Error Response (400 Bad Request):
```json
{
  "success": false,
  "message": "??? ????? ??????",
  "messageEn": "Logout failed",
  "error": "Error details here"
}
```

---

### 2?? Logout ??????

```http
POST /api/user/logout
Authorization: Bearer {token}
```

#### Request Headers:
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Success Response (200 OK):
```json
{
  "success": true,
  "message": "?? ????? ?????? ?????",
  "messageEn": "Logged out successfully",
  "user": {
    "userId": 12,
    "userName": "Ahmed Hassan"
  }
}
```

#### Error Response (400 Bad Request):
```json
{
  "success": false,
  "message": "??? ????? ??????",
  "messageEn": "Logout failed",
  "error": "Error details here"
}
```

---

## ?? ??? ??? Backend

### 1. DoctorController.cs
```csharp
/// <summary>
/// Logout - Doctor logout endpoint
/// </summary>
[HttpPost("logout")]
[Authorize(Roles = "Doctor")]
public IActionResult Logout()
{
    try
    {
        var userId = GetUserId();
        var userName = User.FindFirst(ClaimTypes.Name)?.Value;
        
        return Ok(new 
        { 
            success = true,
            message = "?? ????? ?????? ?????",
            messageEn = "Logged out successfully",
            user = new 
            {
                userId = userId,
                userName = userName
            }
        });
    }
    catch (Exception ex)
    {
        return BadRequest(new 
        { 
            success = false,
            message = "??? ????? ??????",
            messageEn = "Logout failed",
            error = ex.Message 
        });
    }
}
```

### 2. UserController.cs
```csharp
/// <summary>
/// Logout - Clear session (optional)
/// </summary>
[HttpPost("logout")]
[Authorize(Roles = "Patient")]
public IActionResult Logout()
{
    try
    {
        var userId = GetUserId();
        var userName = User.FindFirst(ClaimTypes.Name)?.Value;
        
        return Ok(new 
        { 
            success = true,
            message = "?? ????? ?????? ?????",
            messageEn = "Logged out successfully",
            user = new 
            {
                userId = userId,
                userName = userName
            }
        });
    }
    catch (Exception ex)
    {
        return BadRequest(new 
        { 
            success = false,
            message = "??? ????? ??????",
            messageEn = "Logout failed",
            error = ex.Message 
        });
    }
}
```

---

## ?? ??????? ?? ??? Frontend (React)

### 1. Logout Component ?? Modal Popup

```jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LogoutModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole'); // 'Doctor' or 'Patient'
      
      // ????? ??? endpoint ??? ??? ????????
      const endpoint = userRole === 'Doctor' 
        ? '/api/doctor/logout' 
        : '/api/user/logout';
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}${endpoint}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        // ??? ???????? ?? localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        
        // ???????? ????? Login
        navigate('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('??? ??? ????? ????? ??????');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Log Out?
        </h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to log out of your account?
        </p>
        <p className="text-sm text-gray-500 mb-6">
          ?? ??? ????? ?? ????? ?????? ?? ??????
        </p>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 
                     hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            No, Cancel
          </button>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg 
                     hover:bg-blue-700 transition-colors disabled:opacity-50
                     flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">?</span>
                <span>Logging out...</span>
              </>
            ) : (
              'Yes, Confirm'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
```

### 2. ??????? ??? Modal ?? ??? Sidebar

```jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LogoutModal from './LogoutModal';

const DoctorSidebar = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen">
      <nav className="p-4">
        <ul className="space-y-2">
          <li>
            <Link 
              to="/doctor/dashboard" 
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100"
            >
              <span>??</span>
              <span>Dashboard</span>
            </Link>
          </li>
          
          <li>
            <Link 
              to="/doctor/patients" 
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100"
            >
              <span>??</span>
              <span>Patient List</span>
            </Link>
          </li>
          
          <li>
            <Link 
              to="/doctor/appointments" 
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100"
            >
              <span>??</span>
              <span>Appointments</span>
            </Link>
          </li>
          
          <li>
            <Link 
              to="/doctor/messages" 
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100"
            >
              <span>??</span>
              <span>Messages</span>
            </Link>
          </li>
          
          <li>
            <Link 
              to="/doctor/settings" 
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100"
            >
              <span>??</span>
              <span>Settings & Profile</span>
            </Link>
          </li>
          
          {/* ?? Logout */}
          <li className="pt-4 border-t border-gray-200 mt-4">
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 
                       text-red-600 w-full text-left transition-colors"
            >
              <span>??</span>
              <span>Log out</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Logout Modal */}
      <LogoutModal 
        isOpen={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)} 
      />
    </aside>
  );
};

export default DoctorSidebar;
```

---

## ?? ?????? ??? API

### Postman Testing

#### 1. Doctor Logout Test
```bash
POST https://localhost:7001/api/doctor/logout
Headers:
  Authorization: Bearer {doctor_token}
```

#### 2. Patient Logout Test
```bash
POST https://localhost:7001/api/user/logout
Headers:
  Authorization: Bearer {patient_token}
```

### cURL Commands

#### Doctor Logout:
```bash
curl -X POST https://localhost:7001/api/doctor/logout \
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN"
```

#### Patient Logout:
```bash
curl -X POST https://localhost:7001/api/user/logout \
  -H "Authorization: Bearer YOUR_PATIENT_TOKEN"
```

---

## ?? ?????? (Security)

### ? ?? ???????:
1. **JWT Token Required** - ??? ????? token ????
2. **Role-Based Authorization** - ?? endpoint ?? role ????
3. **Token Validation** - ??? ?????? ?? ?????? ??? token
4. **User Identity** - ??? ??????? ??????? ???????? ?? ??? token

### ??? ???? ?????????:
1. **Client-Side Cleanup**:
   - ??? ??? token ?? localStorage
   - ??? ??? cookies ?? ????
   - ??? ?? ?????? ?????

2. **Redirect to Login**:
   - ??????? ?????? ????? Login ??? Logout
   - ??? ?????? ??????? ???????

---

## ?? ??????? ????????? ??????

### 1?? ???????? ???? ??? ?? Logout
```
User clicks "Log out" button in sidebar
?
Modal popup appears with confirmation message
```

### 2?? ????? ??? Logout
```
User clicks "Yes, Confirm"
?
API call to /api/doctor/logout or /api/user/logout
?
Backend validates token & returns success
```

### 3?? ????? ????????
```
Frontend receives success response
?
Clear localStorage (token, userRole, userId, etc.)
?
Clear any cached data
```

### 4?? ???????? ?????? ????????
```
Redirect to /login page
?
User sees login screen
?
Cannot access protected routes anymore
```

---

## ?? ????? ???????? (UI Design)

### Modal Design Specs:
- **Width**: max-width: 400px
- **Background**: White with rounded corners (border-radius: 8px)
- **Overlay**: Black with 50% opacity
- **Buttons**: 
  - Cancel: Gray border with hover effect
  - Confirm: Blue background (primary color)
- **Text**: 
  - Arabic + English support
  - Clear hierarchy (title, description)

### ???????:
```css
:root {
  --modal-bg: #ffffff;
  --overlay-bg: rgba(0, 0, 0, 0.5);
  --btn-cancel: #f3f4f6;
  --btn-confirm: #3b82f6;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --danger-color: #ef4444;
}
```

---

## ? Checklist ???????

### Backend:
- [x] Logout endpoint ??????? ?? DoctorController
- [x] Logout endpoint ?????? ?? UserController
- [x] Authorization attributes ([Authorize(Roles = "...")])
- [x] ??????? userId ? userName ?? Claims
- [x] ????? ????/??? ??????? ??????????
- [x] Build successful ???? errors

### Frontend:
- [ ] ????? LogoutModal component
- [ ] ????? ?? Logout ?? Sidebar
- [ ] axios call ??? API
- [ ] ??? localStorage ??? Logout
- [ ] Redirect to login page
- [ ] ?????? ?? Doctor ? Patient

### Testing:
- [ ] ?????? Logout ???????
- [ ] ?????? Logout ??????
- [ ] ?????? unauthorized access
- [ ] ?????? invalid token
- [ ] ?????? expired token

---

## ?? ???????

### 1. Run Backend:
```bash
cd Backend/PulseX.API
dotnet run
```

### 2. Run Frontend:
```bash
cd frontend
npm start
```

### 3. Test Flow:
1. Login as Doctor/Patient
2. Navigate to Settings page
3. Click "Log out" button
4. Confirm in modal
5. Verify redirect to login
6. Try to access protected route (should fail)

---

## ?? ?????

??? ????? ?? ?????:
1. ???? ?? ???? ??? token ?? localStorage
2. ???? ?? ??? Authorization header
3. ???? ?? ??? role ?????? ????????
4. ???? console logs ???????

---

## ?? ??????? ????

?? **??? ????**:
- ??? JWT token ??? ?????? ??? server-side
- ??? logout ?? client-side ??? (??? ??? token)
- ?? ???? blacklist ??? tokens (optional feature)
- Token expiry ??? ?????? ??? ????????

?? **??????? ????????**:
1. ????? activity log ??? Logout
2. ????? notification ??? Logout
3. Token blacklist/revocation
4. Session management

---

? **?? ??????? ?????!**
