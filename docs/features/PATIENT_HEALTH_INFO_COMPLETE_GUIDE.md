# ?? Patient Health Information System - Complete Guide

## ? **?? ??????? ?????**

---

## ?? **?????:**

???? ???? ?????? ???????? ?????? ?????? ??:
1. ??? Health Information ?? Settings & Profile
2. Update Health Data page ?? dropdowns ??????? ?????
3. ??? AI Risk Assessment

---

## ?? **Database Schema**

### **New Table: PatientHealthInfos**

```sql
CREATE TABLE PatientHealthInfos (
    Id INT PRIMARY KEY IDENTITY,
    PatientId INT NOT NULL,
    
    -- Vital Signs (Dropdown selections)
    HeartRate NVARCHAR(100),      -- "Low (< 60 bpm)", "Normal (60–100 bpm)", etc.
    BloodPressure NVARCHAR(100),  -- "Low (< 90/60 mmHg)", "Normal (90–120 / 60–80 mmHg)", etc.
    BloodCount NVARCHAR(100),     -- "Low (< 30%)", "Normal (30%–45%)", "High (> 45%)"
    
    -- Physical Measurements (Manual inputs)
    Height DECIMAL(5,2),          -- in cm
    Weight DECIMAL(5,2),          -- in kg
    BloodSugar DECIMAL(6,2),      -- in mg/dL
    
    -- Metadata
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2,
    IsActive BIT NOT NULL DEFAULT 1,
    
    FOREIGN KEY (PatientId) REFERENCES Patients(Id) ON DELETE CASCADE
);

CREATE INDEX IX_PatientHealthInfos_PatientId_IsActive ON PatientHealthInfos(PatientId, IsActive);
```

---

## ?? **Migration Command:**

```bash
# ?? Package Manager Console
Add-Migration AddPatientHealthInfoTable
Update-Database

# ?? ?? Terminal
dotnet ef migrations add AddPatientHealthInfoTable --project PulseX.Data --startup-project PulseX.API
dotnet ef database update --project PulseX.Data --startup-project PulseX.API
```

---

## ?? **API Endpoints**

### **1. Get Patient Profile (with Health Info)**

```http
GET /api/user/profile
Authorization: Bearer {patient_token}
```

**Response:**
```json
{
  "id": 12,
  "email": "mohamed.salem@pulsex.com",
  "fullName": "Mohamed Salem",
  "patientId": "PAT001",
  "dateOfBirth": "1985-06-15T00:00:00Z",
  "gender": "Male",
  "location": "Cairo, Egypt",
  "healthInformation": {
    "height": 175,
    "heightDisplay": "175 cm",
    "weight": 75,
    "weightDisplay": "75 kg",
    "bloodPressure": "Normal (90–120 / 60–80 mmHg)",
    "bloodPressureDisplay": "Normal (90–120 / 60–80 mmHg)",
    "bloodSugar": 95,
    "bloodSugarDisplay": "95 mg/dL",
    "bloodCount": "Normal (30%–45%)",
    "bloodCountDisplay": "Normal (30%–45%)",
    "heartRate": "Normal (60–100 bpm)",
    "heartRateDisplay": "Normal (60–100 bpm)",
    "lastUpdated": "2026-02-15T14:30:00Z",
    "hasHealthData": true
  },
  "emailNotificationsEnabled": true,
  "darkModeEnabled": false
}
```

---

### **2. Update Health Data**

```http
PUT /api/user/health-data
Authorization: Bearer {patient_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "heartRate": "Normal (60–100 bpm)",
  "bloodPressure": "Normal (90–120 / 60–80 mmHg)",
  "bloodCount": "Normal (30%–45%)",
  "height": 175,
  "weight": 75,
  "bloodSugar": 95
}
```

**Response:**
```json
{
  "message": "Health data updated successfully",
  "data": {
    "height": 175,
    "heightDisplay": "175 cm",
    "weight": 75,
    "weightDisplay": "75 kg",
    "bloodSugar": 95,
    "bloodSugarDisplay": "95 mg/dL",
    "bloodPressure": "Normal (90–120 / 60–80 mmHg)",
    "bloodCount": "Normal (30%–45%)",
    "heartRate": "Normal (60–100 bpm)",
    "lastUpdated": "2026-02-15T15:45:00Z",
    "hasHealthData": true
  }
}
```

---

### **3. Get Health Data Options (for dropdowns)**

```http
GET /api/user/health-data/options
Authorization: Bearer {patient_token}
```

**Response:**
```json
{
  "heartRateOptions": [
    "Low (< 60 bpm)",
    "Normal (60–100 bpm)",
    "Slightly High (101–120 bpm)",
    "High (> 120 bpm)"
  ],
  "bloodPressureOptions": [
    "Low (< 90/60 mmHg)",
    "Normal (90–120 / 60–80 mmHg)",
    "Pre-Hypertension (120–139 / 80–89 mmHg)",
    "High – Stage 1 (140–159 / 90–99 mmHg)",
    "High – Stage 2 (? 160 / ? 100 mmHg)"
  ],
  "bloodCountOptions": [
    "Low (< 30%)",
    "Normal (30%–45%)",
    "High (> 45%)"
  ]
}
```

---

## ?? **Frontend Integration**

### **1. Settings & Profile Page**

```jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

const SettingsProfile = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${API_URL}/api/user/profile`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setProfile(response.data);
  };

  return (
    <div className="settings-profile">
      {/* Personal Information Section */}
      <PersonalInformationSection profile={profile} />

      {/* Health Information Section */}
      <HealthInformationSection health={profile?.healthInformation} />

      {/* Account Settings Section */}
      <AccountSettingsSection />
    </div>
  );
};

const HealthInformationSection = ({ health }) => {
  if (!health || !health.hasHealthData) {
    return (
      <div className="health-info-section">
        <h2>?? Health Information</h2>
        <p>No health data available yet</p>
        <button onClick={() => navigate('/update-health-data')}>
          Add Health Data
        </button>
      </div>
    );
  }

  return (
    <div className="health-info-section">
      <h2>?? Health Information</h2>
      
      <div className="health-grid">
        <HealthCard 
          icon="??" 
          label="Height" 
          value={health.heightDisplay} 
        />
        <HealthCard 
          icon="??" 
          label="Weight" 
          value={health.weightDisplay} 
        />
        <HealthCard 
          icon="??" 
          label="Blood Pressure" 
          value={health.bloodPressureDisplay} 
        />
        <HealthCard 
          icon="??" 
          label="Blood Sugar" 
          value={health.bloodSugarDisplay} 
        />
        <HealthCard 
          icon="??" 
          label="Blood Count" 
          value={health.bloodCountDisplay} 
        />
        <HealthCard 
          icon="??" 
          label="Heart Rate" 
          value={health.heartRateDisplay} 
        />
      </div>

      <button 
        onClick={() => navigate('/update-health-data')}
        className="update-health-btn"
      >
        Update Health Data
      </button>
    </div>
  );
};
```

---

### **2. Update Health Data Page**

```jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

const UpdateHealthData = () => {
  const [options, setOptions] = useState(null);
  const [formData, setFormData] = useState({
    heartRate: '',
    bloodPressure: '',
    bloodCount: '',
    height: '',
    weight: '',
    bloodSugar: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${API_URL}/api/user/health-data/options`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setOptions(response.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/api/user/health-data`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Health data updated successfully!');
      navigate('/settings');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="update-health-data">
      <h1>?? Updating Health Data</h1>

      <form onSubmit={handleSubmit}>
        {/* Dropdown: Heart Rate */}
        <div className="form-group">
          <label>Heart Rate *</label>
          <select 
            value={formData.heartRate}
            onChange={(e) => setFormData({...formData, heartRate: e.target.value})}
            required
          >
            <option value="">Select your heart rate range</option>
            {options?.heartRateOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Dropdown: Blood Pressure */}
        <div className="form-group">
          <label>Blood Pressure *</label>
          <select 
            value={formData.bloodPressure}
            onChange={(e) => setFormData({...formData, bloodPressure: e.target.value})}
            required
          >
            <option value="">Select your blood pressure range</option>
            {options?.bloodPressureOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Dropdown: Blood Count */}
        <div className="form-group">
          <label>Blood Count *</label>
          <select 
            value={formData.bloodCount}
            onChange={(e) => setFormData({...formData, bloodCount: e.target.value})}
            required
          >
            <option value="">Select your blood count range</option>
            {options?.bloodCountOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Manual Inputs */}
        <div className="form-row">
          <div className="form-group">
            <label>Height *</label>
            <input 
              type="number"
              placeholder="cm"
              value={formData.height}
              onChange={(e) => setFormData({...formData, height: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Weight *</label>
            <input 
              type="number"
              placeholder="kg"
              value={formData.weight}
              onChange={(e) => setFormData({...formData, weight: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Blood Sugar *</label>
          <input 
            type="number"
            placeholder="mg/dL"
            value={formData.bloodSugar}
            onChange={(e) => setFormData({...formData, bloodSugar: e.target.value})}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};
```

---

## ?? **AI Integration**

### **???????:**

1. **?????? ???? ????????** ?? Update Health Data page
2. **???????? ?????** ?? `PatientHealthInfos` table
3. **AI Model ?????? ????????** ????? Risk Score:

```csharp
// ?? RiskAssessmentService
var healthInfo = await _patientHealthInfoRepository.GetLatestByPatientIdAsync(patientId);

var riskInput = new
{
    HeartRate = ParseHeartRateToNumeric(healthInfo.HeartRate),
    BloodPressure = ParseBloodPressureToNumeric(healthInfo.BloodPressure),
    BloodCount = ParseBloodCountToNumeric(healthInfo.BloodCount),
    Height = healthInfo.Height,
    Weight = healthInfo.Weight,
    BloodSugar = healthInfo.BloodSugar
};

var riskScore = await _aiService.CalculateRiskAsync(riskInput);
```

---

## ? **Checklist**

### **Backend:** ? **?????**
- [x] PatientHealthInfo model
- [x] IPatientHealthInfoRepository interface
- [x] PatientHealthInfoRepository implementation
- [x] DbContext configuration
- [x] UpdateHealthDataDto
- [x] HealthInformationDto
- [x] HealthDataOptionsDto
- [x] UpdateHealthDataAsync method
- [x] GET /api/user/profile (with health info)
- [x] PUT /api/user/health-data
- [x] GET /api/user/health-data/options
- [x] DI registration
- [x] Build successful

### **Database:** ? **????? migration**
- [ ] Run migration command
- [ ] Update database

### **Frontend:** ? **????? ?????**
- [ ] Settings & Profile page
- [ ] Health Information section display
- [ ] Update Health Data page
- [ ] Dropdown components
- [ ] Form validation
- [ ] API integration

---

## ?? **Testing**

### **1. Get Profile with Health Info:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/user/profile
```

### **2. Update Health Data:**
```bash
curl -X PUT \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "heartRate": "Normal (60–100 bpm)",
    "bloodPressure": "Normal (90–120 / 60–80 mmHg)",
    "bloodCount": "Normal (30%–45%)",
    "height": 175,
    "weight": 75,
    "bloodSugar": 95
  }' \
  http://localhost:5000/api/user/health-data
```

### **3. Get Options:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/user/health-data/options
```

---

## ?? **???????**

1. **Dropdown Values**: ????? ?????? ?????? ????????? (Low/Normal/High ?? ????????)
2. **AI Integration**: ???????? ????? ??? AI Model
3. **History**: ??? ??? ?? update ?? record ???? (CreatedAt)
4. **Latest Data**: ??? ??????? ??? record (IsActive = true)
5. **Validation**: Frontend ??? ???? validation ??? ???????

---

**? Backend Done! Ready for Migration & Frontend!** ??
