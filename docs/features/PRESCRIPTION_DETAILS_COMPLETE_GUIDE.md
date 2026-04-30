# ?? ???? ??? ?????? ??????? - Prescription Details Page

## ? **?? ??????? ?????**

?????: 2025-01-XX

---

## ?? **?????:**

??? ?? ?????? ??????? ?????? ?? ??????? ??? ????? ???????? ???????.

---

## ?? **API Endpoint**

### **GET /api/prescriptions/{prescriptionId}/details**

```http
GET /api/prescriptions/5/details
Authorization: Bearer {patient_token}
```

---

## ?? **Response Example:**

```json
{
  "id": 5,
  "prescriptionId": "RX-2026-0210-0005",
  
  "doctorId": 3,
  "doctorName": "Dr. Emily Rodriguez",
  "doctorSpecialization": "Internal Medicine",
  "doctorProfilePicture": "/uploads/doctors/dr_emily.jpg",
  
  "patientId": 12,
  "patientName": "John Anderson",
  "patientIdNumber": "PX-2024-7891",
  
  "createdAt": "2026-02-10T14:30:00Z",
  "formattedDate": "February 10, 2026",
  "formattedTime": "02:30 PM",
  
  "medications": [
    {
      "number": 1,
      "drugName": "Amoxicillin 500mg",
      "dosage": "500mg",
      "frequency": "3 times daily (after meals)",
      "duration": "7 days",
      "displayFrequency": "3 times daily (after meals)"
    },
    {
      "number": 2,
      "drugName": "Paracetamol",
      "dosage": "500mg",
      "frequency": "Every 6 hours as needed",
      "duration": "5 days",
      "displayFrequency": "Every 6 hours as needed"
    },
    {
      "number": 3,
      "drugName": "Vitamin D3",
      "dosage": "1000 IU",
      "frequency": "Once daily",
      "duration": "30 days",
      "displayFrequency": "Once daily"
    }
  ],
  
  "labRequests": [
    {
      "number": 1,
      "testName": "Complete Blood Count (CBC)",
      "testType": "Lab Test",
      "additionalNotes": "Note: Fasting required • 8-12 hours",
      "isFastingRequired": true,
      "instructions": "Please visit the lab with this prescription. Follow any fasting requirements mentioned.",
      "hasResult": false,
      "resultUploadedAt": null,
      "medicalRecordId": null
    },
    {
      "number": 2,
      "testName": "Lipid Profile",
      "testType": "Lab Test",
      "additionalNotes": "Note: Fasting required",
      "isFastingRequired": true,
      "instructions": null,
      "hasResult": false,
      "resultUploadedAt": null,
      "medicalRecordId": null
    },
    {
      "number": 3,
      "testName": "Chest X-Ray",
      "testType": "Radiology",
      "additionalNotes": null,
      "isFastingRequired": false,
      "instructions": "Bring your ID and insurance card if applicable.",
      "hasResult": false,
      "resultUploadedAt": null,
      "medicalRecordId": null
    }
  ],
  
  "clinicalNotes": "Patient presents with mild upper respiratory infection. Continue current medications as prescribed. Ensure adequate rest and hydration. Follow up in 1 week if symptoms persist or worsen. Avoid smoking and alcohol during treatment period. Take antibiotics at regular intervals for maximum effectiveness.",
  
  "importantInstructions": "Take all medications as prescribed. Do not stop or change dosage without consulting your doctor. Complete the full course of antibiotics even if you feel better. Follow any fasting requirements mentioned. Bring your ID and insurance card if applicable.",
  
  "status": "Active",
  "isRead": false
}
```

---

## ?? **UI Components (??? ??????)**

### **1. Header Section (Blue Background):**

```jsx
<div className="prescription-header bg-blue-600 text-white p-6">
  <div className="grid grid-cols-3 gap-4">
    {/* Doctor Info */}
    <div className="flex items-center gap-3">
      <div className="icon">?????</div>
      <div>
        <p className="text-sm">Prescribed by</p>
        <h3 className="font-bold">{prescription.doctorName}</h3>
        <p className="text-xs">{prescription.doctorSpecialization}</p>
      </div>
    </div>

    {/* Patient Info */}
    <div className="flex items-center gap-3">
      <div className="icon">??</div>
      <div>
        <p className="text-sm">Patient</p>
        <h3 className="font-bold">{prescription.patientName}</h3>
        <p className="text-xs">ID: {prescription.patientIdNumber}</p>
      </div>
    </div>

    {/* Date Info */}
    <div className="flex items-center gap-3">
      <div className="icon">??</div>
      <div>
        <p className="text-sm">Date Issued</p>
        <h3 className="font-bold">{prescription.formattedDate}</h3>
        <p className="text-xs">? {prescription.formattedTime}</p>
      </div>
    </div>
  </div>
</div>
```

---

### **2. Medications Section (Purple Background):**

```jsx
<div className="medications-section bg-purple-50 p-6 rounded-lg">
  <h2 className="text-lg font-bold mb-4">?? Prescribed Medications</h2>
  
  {prescription.medications.map((med) => (
    <div key={med.number} className="medication-card bg-white p-4 mb-3 rounded-lg border-l-4 border-purple-500">
      <div className="flex items-start gap-3">
        <span className="number-badge">{med.number}</span>
        <div className="flex-1">
          <h3 className="font-bold">{med.drugName}</h3>
          <p className="text-sm text-gray-600">Dosage: {med.dosage}</p>
          
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <span className="text-xs text-gray-500">Frequency</span>
              <p className="text-sm">{med.frequency}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Duration</span>
              <p className="text-sm">{med.duration}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ))}
  
  <div className="important-instructions bg-orange-50 p-4 rounded-lg mt-4">
    <h4 className="font-bold text-orange-800">?? Important Instructions</h4>
    <p className="text-sm">{prescription.importantInstructions}</p>
  </div>
</div>
```

---

### **3. Lab & Radiology Section (Green Background):**

```jsx
<div className="lab-requests-section bg-green-50 p-6 rounded-lg">
  <h2 className="text-lg font-bold mb-4">?? Lab & Radiology Requests</h2>
  
  {prescription.labRequests.map((lab) => (
    <div key={lab.number} className="lab-card bg-white p-4 mb-3 rounded-lg border-l-4 border-green-500">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <span className="number-badge">{lab.number}</span>
          <div>
            <h3 className="font-bold">{lab.testName}</h3>
            {lab.additionalNotes && (
              <p className="text-sm text-gray-600">{lab.additionalNotes}</p>
            )}
          </div>
        </div>
        
        {/* Upload Button */}
        <button 
          onClick={() => handleUploadResult(lab)}
          className="upload-btn bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          ?? Upload Result
        </button>
      </div>
    </div>
  ))}
  
  <div className="lab-instructions bg-blue-50 p-4 rounded-lg mt-4">
    <h4 className="font-bold text-blue-800">?? Lab Visit Instructions</h4>
    <p className="text-sm">
      Please visit the lab with this prescription. Follow any fasting requirements mentioned. 
      Bring your ID and insurance card if applicable.
    </p>
  </div>
</div>
```

---

### **4. Clinical Notes Section (Orange Background):**

```jsx
<div className="clinical-notes-section bg-orange-50 p-6 rounded-lg">
  <h2 className="text-lg font-bold mb-4">?? Clinical Notes & Instructions</h2>
  <p className="text-sm leading-relaxed">{prescription.clinicalNotes}</p>
</div>
```

---

## ?? **Upload Result Flow:**

### **???????:**

1. **?????? ???? "Upload Result"** ??? lab request ????
2. **??? ?????? ????? Medical Records** (`/patient/medical-records`)
3. **??? pre-select ??? category** ???????:
   - "Lab Test" ? Other Medical Files
   - "X-Ray" ? Radiology
   - "ECG" ? ECG
4. **?????? ???? ?????**
5. **??? ??? reference** ?? `MedicalRecord` table
6. **???? ?? QR Code** ????????

---

### **Frontend Code Example:**

```javascript
const handleUploadResult = (labRequest) => {
  // Determine category based on test type
  let category = 'Other';
  if (labRequest.testType === 'ECG') {
    category = 'ECG';
  } else if (labRequest.testType === 'Radiology' || labRequest.testType === 'X-Ray') {
    category = 'Radiology';
  }

  // Navigate to Medical Records with context
  navigate('/patient/medical-records', {
    state: {
      fromPrescription: true,
      prescriptionId: prescription.id,
      testName: labRequest.testName,
      category: category,
      returnUrl: `/patient/prescriptions/${prescription.id}`
    }
  });
};
```

---

## ?? **Medical Records Integration:**

### **??? ?????? ????? Medical Records:**

```javascript
// ?? Medical Records Page
const location = useLocation();
const { fromPrescription, category, testName } = location.state || {};

useEffect(() => {
  if (fromPrescription) {
    // Auto-select category
    setSelectedCategory(category);
    
    // Show helper message
    toast.info(`Upload ${testName} result here`);
  }
}, [fromPrescription]);
```

---

## ??? **Database Schema (Optional Enhancement):**

### **????? ???? ????? uploads:**

```sql
CREATE TABLE PrescriptionLabResults (
    Id INT PRIMARY KEY IDENTITY,
    PrescriptionId INT NOT NULL,
    LabRequestNumber INT NOT NULL,
    MedicalRecordId INT NOT NULL,
    UploadedAt DATETIME NOT NULL,
    FOREIGN KEY (PrescriptionId) REFERENCES Prescriptions(Id),
    FOREIGN KEY (MedicalRecordId) REFERENCES MedicalRecords(Id)
);
```

---

## ?? **Testing:**

### **1. Get Prescription Details:**

```bash
curl -X GET "http://localhost:5000/api/prescriptions/5/details" \
  -H "Authorization: Bearer PATIENT_TOKEN"
```

### **2. Expected Response:**

```json
{
  "id": 5,
  "prescriptionId": "RX-2026-0210-0005",
  "doctorName": "Dr. Emily Rodriguez",
  "medications": [...],
  "labRequests": [...],
  "clinicalNotes": "..."
}
```

---

## ? **Checklist:**

### **Backend:** ? **?????**
- [x] Enhanced DTOs (PrescriptionDetailsDto)
- [x] Enhanced MedicationDetailsDto
- [x] Enhanced LabRequestDetailsDto
- [x] GetPrescriptionDetailsAsync method
- [x] GET /{id}/details endpoint
- [x] Build successful

### **Frontend:** ? **????? ?????**
- [ ] Prescription Details Page
- [ ] Header section (blue)
- [ ] Medications section (purple)
- [ ] Lab Requests section (green)
- [ ] Upload Result buttons
- [ ] Navigation to Medical Records
- [ ] Clinical Notes section

---

## ?? **??????? ????:**

1. **Security**: ??? ?????? ?? ?? ?????? ???? ???????
2. **Lab Results Tracking**: ?????? `hasResult` = false ?????? (????? integration)
3. **Upload Flow**: ????? ??? Medical Records ???????
4. **QR Code**: ??? ?????? ???????? ??? ??? ??? ?? Medical Records

---

## ?? **??????? ???????:**

1. **Frontend**: ????? ???? ????????
2. **Integration**: ??? Medical Records ?? Prescriptions
3. **Testing**: ?????? ??? flow ??????
4. **Enhancement**: ????? tracking ??? lab results

---

**? Backend ????! ???? ????? ??? Frontend ???????! ??**
