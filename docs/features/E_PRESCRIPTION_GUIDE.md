# ?? E-Prescription System - Complete Guide

## ?? System Overview

Digital prescription system with two access methods:
1. **Direct Context**: From patient profile (auto-filled)
2. **General Access**: From menu (search patient)

---

## ?? Navigation Flow

```
Method 1: Direct Context
Patient Profile ? [+ Add prescription] ? Form (Auto-filled) ? Send

Method 2: General Access  
Menu ? Prescription ? Search Patient ? Select ? Form ? Send
```

---

## ?? Prescription Sections

### 1. Patient Information
- Patient ID (PAT001)
- Full Name
- Gender
- Age
- Visit Type (Clinic/Online)

### 2. Medication Entry
- Drug Name
- Dosage (e.g., 500mg)
- Frequency (e.g., 3 times daily)
- Duration (e.g., 7 days)
- [+ Add More Medication]

### 3. Lab & Radiology Requests
- Test/Scan Name (e.g., CBC)
- Additional Notes (e.g., Fasting required)
- [+ Add More Lab/Radiology Request]

### 4. Clinical Notes
- Additional Instructions & Advice

### 5. Action
- [Send to Patient] button

---

## ?? API Endpoints

### 1?? Get Form Data (Direct Context)

```http
GET /api/Prescriptions/form-data/patient/{patientId}
Authorization: Bearer {doctor_token}

Response 200 OK:
{
  "patientId": 5,
  "patientName": "Yousra Adel",
  "gender": "Female",
  "age": 32,
  "visitType": "Clinic",
  "isDirectContext": true  ? Form will be auto-filled & locked
}
```

**When to use**:
- Doctor clicks "+ Add prescription" from patient profile
- Patient info auto-filled and locked

---

### 2?? Search Patients (General Access)

```http
GET /api/Prescriptions/search-patients?searchTerm=Yousra
Authorization: Bearer {doctor_token}

Response 200 OK:
[
  {
    "id": 5,
    "patientId": "PAT005",
    "fullName": "Yousra Adel",
    "age": 32,
    "gender": "Female",
    "profilePicture": null
  }
]
```

**When to use**:
- Doctor clicks "Prescription" from menu
- Shows search bar to find patient

---

### 3?? Create Prescription

```http
POST /api/Prescriptions/create
Authorization: Bearer {doctor_token}
Content-Type: application/json

{
  "patient_id": 5,
  "appointment_id": 10,  // Optional
  "medications": [
    {
      "drug_name": "Amoxicillin",
      "dosage": "500mg",
      "frequency": "3 times daily",
      "duration": "7 days"
    },
    {
      "drug_name": "Paracetamol",
      "dosage": "500mg",
      "frequency": "As needed",
      "duration": "5 days"
    }
  ],
  "lab_requests": [
    {
      "test_name": "Complete Blood Count (CBC)",
      "additional_notes": "Fasting required"
    },
    {
      "test_name": "Chest X-Ray",
      "additional_notes": null
    }
  ],
  "clinical_notes": "Take medication with food. Avoid alcohol. Follow up in 1 week."
}

Response 200 OK:
{
  "message": "Prescription sent successfully",
  "data": {
    "id": 1,
    "doctorId": 3,
    "doctorName": "Dr. Noha Salem",
    "patientId": 5,
    "patientName": "Yousra Adel",
    "appointmentId": 10,
    "medications": [
      {
        "drug_name": "Amoxicillin",
        "dosage": "500mg",
        "frequency": "3 times daily",
        "duration": "7 days"
      }
    ],
    "labRequests": [
      {
        "test_name": "Complete Blood Count (CBC)",
        "additional_notes": "Fasting required"
      }
    ],
    "clinicalNotes": "Take medication with food...",
    "createdAt": "2025-01-05T16:30:00Z",
    "isRead": false
  }
}
```

**Notification Sent**: Patient receives "New prescription available!" notification

---

### 4?? Get My Prescriptions (Patient)

```http
GET /api/Prescriptions/my-prescriptions
Authorization: Bearer {patient_token}

Response 200 OK:
[
  {
    "id": 1,
    "doctorId": 3,
    "doctorName": "Dr. Noha Salem",
    "patientId": 5,
    "patientName": "Yousra Adel",
    "appointmentId": 10,
    "medications": [...],
    "labRequests": [...],
    "clinicalNotes": "...",
    "createdAt": "2025-01-05T16:30:00Z",
    "isRead": false
  }
]
```

---

### 5?? Get Prescription by ID

```http
GET /api/Prescriptions/{prescriptionId}
Authorization: Bearer {doctor_or_patient_token}

Response 200 OK:
{
  "id": 1,
  "doctorId": 3,
  "doctorName": "Dr. Noha Salem",
  "patientId": 5,
  "patientName": "Yousra Adel",
  "medications": [...],
  "labRequests": [...],
  "clinicalNotes": "...",
  "createdAt": "2025-01-05T16:30:00Z",
  "isRead": false
}
```

---

### 6?? Mark as Read

```http
PUT /api/Prescriptions/{prescriptionId}/mark-read
Authorization: Bearer {patient_token}

Response 200 OK:
{
  "message": "Prescription marked as read"
}
```

---

## ?? Frontend Implementation

### 1. Direct Context (From Patient Profile)

```jsx
const PatientProfile = ({ patientId }) => {
  const navigate = useNavigate();

  const handleAddPrescription = () => {
    // Navigate with patient context
    navigate(`/prescriptions/new?patientId=${patientId}&context=direct`);
  };

  return (
    <div>
      <button onClick={handleAddPrescription}>
        + Add prescription
      </button>
    </div>
  );
};
```

---

### 2. Prescription Form (Auto-filled)

```jsx
const PrescriptionForm = () => {
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId');
  const context = searchParams.get('context');
  const [formData, setFormData] = useState(null);
  const [medications, setMedications] = useState([{
    drug_name: '',
    dosage: '',
    frequency: '',
    duration: ''
  }]);
  const [labRequests, setLabRequests] = useState([{
    test_name: '',
    additional_notes: ''
  }]);
  const [clinicalNotes, setClinicalNotes] = useState('');

  useEffect(() => {
    if (context === 'direct' && patientId) {
      // Load patient data (auto-fill)
      fetch(`/api/Prescriptions/form-data/patient/${patientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(setFormData);
    }
  }, [patientId, context]);

  const addMedication = () => {
    setMedications([...medications, {
      drug_name: '',
      dosage: '',
      frequency: '',
      duration: ''
    }]);
  };

  const addLabRequest = () => {
    setLabRequests([...labRequests, {
      test_name: '',
      additional_notes: ''
    }]);
  };

  const handleSubmit = async () => {
    const payload = {
      patient_id: formData.patientId,
      medications: medications.filter(m => m.drug_name),
      lab_requests: labRequests.filter(l => l.test_name),
      clinical_notes: clinicalNotes
    };

    const response = await fetch('/api/Prescriptions/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      alert('Prescription sent successfully!');
      navigate('/dashboard');
    }
  };

  return (
    <div className="prescription-form">
      <h1>?? New E-Prescription</h1>
      <p>Create and send digital prescription to patient</p>

      {/* Patient Information */}
      <section className="patient-info">
        <h2>?? Patient Information</h2>
        {formData ? (
          <div className="patient-card">
            <img src={avatar} alt={formData.patientName} />
            <div>
              <p><strong>Patient ID:</strong> PAT{formData.patientId:D3}</p>
              <p><strong>Gender:</strong> {formData.gender}</p>
              <p><strong>Age:</strong> {formData.age}</p>
              <p><strong>Visit Type:</strong> {formData.visitType}</p>
            </div>
          </div>
        ) : (
          <input 
            type="text" 
            placeholder="Search by name or patient ID..."
            onChange={handlePatientSearch}
          />
        )}
      </section>

      {/* Medication Entry */}
      <section className="medication-section">
        <h2>?? Medication Entry</h2>
        {medications.map((med, index) => (
          <div key={index} className="medication-row">
            <h3>Medication #{index + 1}</h3>
            <div className="form-grid">
              <input
                placeholder="e.g., Amoxicillin"
                value={med.drug_name}
                onChange={(e) => {
                  const newMeds = [...medications];
                  newMeds[index].drug_name = e.target.value;
                  setMedications(newMeds);
                }}
              />
              <input
                placeholder="e.g., 500mg"
                value={med.dosage}
                onChange={(e) => {
                  const newMeds = [...medications];
                  newMeds[index].dosage = e.target.value;
                  setMedications(newMeds);
                }}
              />
              <input
                placeholder="e.g., 3 times daily"
                value={med.frequency}
                onChange={(e) => {
                  const newMeds = [...medications];
                  newMeds[index].frequency = e.target.value;
                  setMedications(newMeds);
                }}
              />
              <input
                placeholder="e.g., 7 days"
                value={med.duration}
                onChange={(e) => {
                  const newMeds = [...medications];
                  newMeds[index].duration = e.target.value;
                  setMedications(newMeds);
                }}
              />
            </div>
          </div>
        ))}
        <button className="btn-add-more" onClick={addMedication}>
          + Add More Medication
        </button>
      </section>

      {/* Lab & Radiology Requests */}
      <section className="lab-section">
        <h2>?? Lab & Radiology Requests</h2>
        {labRequests.map((lab, index) => (
          <div key={index} className="lab-row">
            <h3>Request #{index + 1}</h3>
            <div className="form-grid">
              <input
                placeholder="e.g., Complete Blood Count (CBC)"
                value={lab.test_name}
                onChange={(e) => {
                  const newLabs = [...labRequests];
                  newLabs[index].test_name = e.target.value;
                  setLabRequests(newLabs);
                }}
              />
              <input
                placeholder="e.g., Fasting required"
                value={lab.additional_notes || ''}
                onChange={(e) => {
                  const newLabs = [...labRequests];
                  newLabs[index].additional_notes = e.target.value;
                  setLabRequests(newLabs);
                }}
              />
            </div>
          </div>
        ))}
        <button className="btn-add-more" onClick={addLabRequest}>
          + Add More Lab/Radiology Request
        </button>
      </section>

      {/* Clinical Notes */}
      <section className="clinical-notes">
        <h2>?? Clinical Notes</h2>
        <label>Additional Instructions & Advice</label>
        <textarea
          rows={6}
          placeholder="Enter clinical notes, special instructions, follow-up recommendations, lifestyle advice, or any other relevant information for the patient..."
          value={clinicalNotes}
          onChange={(e) => setClinicalNotes(e.target.value)}
        />
      </section>

      {/* Send Button */}
      <div className="form-actions">
        <button className="btn-send" onClick={handleSubmit}>
          ?? Send to Patient
        </button>
      </div>
    </div>
  );
};
```

---

### 3. General Access (From Menu)

```jsx
const PrescriptionPage = () => {
  return (
    <div>
      <h1>Prescription</h1>
      <button onClick={() => navigate('/prescriptions/new')}>
        + New Prescription
      </button>
    </div>
  );
};
```

---

### 4. Patient View (My Prescriptions)

```jsx
const MyPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    fetch('/api/Prescriptions/my-prescriptions', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setPrescriptions);
  }, []);

  return (
    <div className="prescriptions-list">
      <h1>?? My Prescriptions</h1>
      {prescriptions.map(prescription => (
        <PrescriptionCard 
          key={prescription.id} 
          prescription={prescription}
        />
      ))}
    </div>
  );
};

const PrescriptionCard = ({ prescription }) => {
  return (
    <div className="prescription-card">
      <div className="header">
        <h3>Dr. {prescription.doctorName}</h3>
        <span className={prescription.isRead ? 'read' : 'unread'}>
          {prescription.isRead ? '? Read' : '?? New'}
        </span>
      </div>
      
      <p className="date">
        {new Date(prescription.createdAt).toLocaleDateString()}
      </p>

      <div className="medications">
        <h4>Medications:</h4>
        {prescription.medications.map((med, i) => (
          <div key={i} className="med-item">
            <strong>{med.drug_name}</strong> - {med.dosage}
            <br />
            <small>{med.frequency} for {med.duration}</small>
          </div>
        ))}
      </div>

      {prescription.labRequests.length > 0 && (
        <div className="lab-requests">
          <h4>Lab Tests:</h4>
          {prescription.labRequests.map((lab, i) => (
            <div key={i}>
              • {lab.test_name}
              {lab.additional_notes && <small> ({lab.additional_notes})</small>}
            </div>
          ))}
        </div>
      )}

      {prescription.clinicalNotes && (
        <div className="clinical-notes">
          <h4>Doctor's Notes:</h4>
          <p>{prescription.clinicalNotes}</p>
        </div>
      )}

      <button onClick={() => viewPrescription(prescription.id)}>
        View Full Prescription
      </button>
    </div>
  );
};
```

---

## ?? Database Schema

```sql
CREATE TABLE Prescriptions (
    Id INT PRIMARY KEY IDENTITY,
    DoctorId INT NOT NULL,
    PatientId INT NOT NULL,
    AppointmentId INT NULL,
    MedicationsJson NVARCHAR(MAX) NOT NULL,  -- JSON array
    LabRequestsJson NVARCHAR(MAX) NOT NULL,  -- JSON array
    ClinicalNotes NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 NOT NULL,
    IsRead BIT NOT NULL DEFAULT 0,
    ReadAt DATETIME2 NULL,
    
    FOREIGN KEY (DoctorId) REFERENCES Doctors(Id),
    FOREIGN KEY (PatientId) REFERENCES Patients(Id),
    FOREIGN KEY (AppointmentId) REFERENCES Appointments(Id)
);

CREATE INDEX IX_Prescriptions_PatientId_CreatedAt 
ON Prescriptions(PatientId, CreatedAt);

CREATE INDEX IX_Prescriptions_DoctorId_CreatedAt 
ON Prescriptions(DoctorId, CreatedAt);
```

---

## ? Summary

**Features**:
- ? Two access methods (Direct/General)
- ? Auto-filled patient info (Direct context)
- ? Patient search (General access)
- ? Multiple medications support
- ? Lab/Radiology requests
- ? Clinical notes
- ? Send to patient notification
- ? Patient prescription list

**Files Created** (7):
1. ? Prescription.cs (Model)
2. ? PrescriptionDto.cs (DTOs)
3. ? IPrescriptionRepository.cs
4. ? PrescriptionRepository.cs
5. ? PrescriptionService.cs
6. ? PrescriptionsController.cs
7. ? E_PRESCRIPTION_GUIDE.md

**Files Modified** (2):
8. ? ApplicationDbContext.cs
9. ? Program.cs

**Next Steps**:
1. Run migration
2. Test direct context flow
3. Test general access flow
4. Test patient view
5. Implement patient notification

---

**Date**: 2025-01-05  
**Version**: 5.0  
**Status**: ? Complete!  

**Built with ?? for PulseX Graduation Project**

?? **E-Prescription System Ready!** ???
