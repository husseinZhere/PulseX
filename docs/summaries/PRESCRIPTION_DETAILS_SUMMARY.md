# ?? ???? ???? - Prescription Details

## ? **?? ???????**

### **API Endpoint:**

```
GET /api/prescriptions/{id}/details
Authorization: Bearer {patient_token}
```

---

## ?? **Response ????? ???:**

? **Doctor Info:**
- Name
- Specialization
- Profile Picture

? **Patient Info:**
- Name
- Patient ID (PX-2024-7891)

? **Date:**
- Full date (February 10, 2026)
- Time (02:30 PM)

? **Medications List:**
- Drug name
- Dosage
- Frequency
- Duration

? **Lab & Radiology Requests:**
- Test name
- Test type (Lab/X-Ray/ECG)
- Notes
- Fasting required?
- **hasResult** flag
- **Upload button** ready

? **Clinical Notes**

? **Important Instructions**

---

## ?? **Upload Result Flow:**

```
Patient clicks "Upload Result"
    ?
Navigate to /patient/medical-records
    ?
Pre-select category (ECG/Radiology/Other)
    ?
Patient uploads file
    ?
File saved in Medical Records
    ?
Appears in QR Code automatically
```

---

## ?? **Quick Frontend Example:**

```javascript
// 1. Fetch prescription details
const response = await axios.get(
  `/api/prescriptions/${prescriptionId}/details`,
  { headers: { Authorization: `Bearer ${token}` } }
);

// 2. Handle Upload Result click
const handleUploadResult = (labRequest) => {
  const category = labRequest.testType === 'ECG' ? 'ECG' 
    : labRequest.testType === 'Radiology' ? 'Radiology' 
    : 'Other';

  navigate('/patient/medical-records', {
    state: {
      fromPrescription: true,
      prescriptionId,
      testName: labRequest.testName,
      category
    }
  });
};
```

---

## ?? **Quick Test:**

```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/prescriptions/5/details
```

---

**? Backend Ready! Frontend Next! ??**
