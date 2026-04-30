# ?? ???? ???? - ???? ???????? ?????? ??????

## ? **?? ???????**

---

## ?? **???????:**

### **1. Settings & Profile**
- ??? Health Information (Height, Weight, Blood Pressure, etc.)
- ?? "Update Health Data"

### **2. Update Health Data**
- **Dropdowns:**
  - Heart Rate (Low/Normal/Slightly High/High)
  - Blood Pressure (Low/Normal/Pre-Hypertension/High Stage 1/High Stage 2)
  - Blood Count (Low/Normal/High)

- **Manual Inputs:**
  - Height (cm)
  - Weight (kg)
  - Blood Sugar (mg/dL)

- ?? "Save Changes"

---

## ?? **APIs:**

```
GET  /api/user/profile              ? Profile ?? Health Info
PUT  /api/user/health-data          ? Update Health Data
GET  /api/user/health-data/options  ? Dropdown Options
```

---

## ??? **Database:**

### **Table ????: PatientHealthInfos**
```
- HeartRate (string) ? "Normal (60–100 bpm)"
- BloodPressure (string) ? "Normal (90–120 / 60–80 mmHg)"
- BloodCount (string) ? "Normal (30%–45%)"
- Height (decimal) ? 175
- Weight (decimal) ? 75
- BloodSugar (decimal) ? 95
```

---

## ?? **Migration Command:**

```bash
dotnet ef migrations add AddPatientHealthInfoTable --project PulseX.Data --startup-project PulseX.API
dotnet ef database update --project PulseX.Data --startup-project PulseX.API
```

---

## ?? **Quick Frontend Example:**

```javascript
// 1. Fetch Profile
const response = await axios.get('/api/user/profile');
console.log(response.data.healthInformation);

// 2. Update Health Data
await axios.put('/api/user/health-data', {
  heartRate: "Normal (60–100 bpm)",
  bloodPressure: "Normal (90–120 / 60–80 mmHg)",
  bloodCount: "Normal (30%–45%)",
  height: 175,
  weight: 75,
  bloodSugar: 95
});

// 3. Get Options for Dropdowns
const options = await axios.get('/api/user/health-data/options');
// options.data.heartRateOptions
// options.data.bloodPressureOptions
// options.data.bloodCountOptions
```

---

## ? **Status:**

### **Backend:** ? **Done**
- Models, DTOs, Repositories, Services, Controllers
- Build successful

### **Database:** ? **????? Migration**
- Run migration command

### **Frontend:** ? **????? ?????**
- Settings page
- Update Health Data page

---

## ?? **AI Integration:**

???????? ????? ??? AI:
- Heart Rate ? Numeric value
- Blood Pressure ? Numeric value
- Blood Count ? Numeric value
- Height, Weight, Blood Sugar ? Decimal values

---

**? Backend Ready! Next: Migration ? Frontend!** ??
