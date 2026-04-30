# ?? Medical Records Management System - Complete Guide

## ?? Overview

The Medical Records Management System allows patients to:
1. **Upload medical files** (ECG or X-Ray images/PDFs)
2. **View and manage** their records
3. **Share records with doctors** via QR Code
4. **Track upload history** with timestamps

---

## ?? Key Features

### 1?? Flexible Upload System
- **Two Record Types**:
  - **ECG** (Electrocardiogram / ??? ?????)
  - **X-Ray** (Radiography / ??????)
- **Optional**: Patient can upload ECG only, X-Ray only, both, or none
- **Supported Formats**: JPG, PNG, PDF
- **Max File Size**: 10 MB per file
- **Auto-naming**: Files stored with unique names to prevent conflicts

### 2?? Smart Organization
- Records automatically categorized by type
- Easy filtering by ECG or X-Ray
- View summary (total records, ECG count, X-Ray count)
- Track last update timestamp

### 3?? QR Code Sharing
- Generate QR Code for doctor visits
- QR Code displays timestamp of generation
- Shows last record update date
- Doctor scans ? Views all records instantly

### 4?? Security
- Patient can only access/delete their own records
- Doctors can view via QR Code or direct API
- Files stored securely on server
- JWT authentication required for all operations

---

## ?? API Endpoints

### 1. Upload Medical Record

**Endpoint**: `POST /api/MedicalRecords/upload`  
**Authorization**: Patient JWT Token  
**Content-Type**: `multipart/form-data`

**Form Data**:
```
recordType: "ECG" or "X-Ray"
file: (binary file)
notes: "Optional description" (optional)
```

**Example using Postman**:
1. Select POST method
2. Enter URL: `http://localhost:5000/api/MedicalRecords/upload`
3. Go to "Headers" ? Add `Authorization: Bearer {your_token}`
4. Go to "Body" ? Select "form-data"
5. Add fields:
   - `recordType` (text): `ECG`
   - `file` (file): Select your image/PDF
   - `notes` (text): `ECG from checkup on 2025-01-01`

**Response** (200 OK):
```json
{
  "id": 1,
  "recordType": "ECG",
  "fileName": "ecg_report.pdf",
  "filePath": "/uploads/medical-records/ECG_1_20250101120000_abc123.pdf",
  "fileType": "application/pdf",
  "fileSize": 2048576,
  "fileSizeFormatted": "1.95 MB",
  "notes": "ECG from checkup on 2025-01-01",
  "uploadedAt": "2025-01-01T12:00:00Z",
  "updatedAt": null
}
```

**Error Responses**:
```json
// Invalid record type
{
  "message": "Invalid record type. Must be 'ECG' or 'X-Ray'"
}

// File too large
{
  "message": "File size must not exceed 10MB"
}

// Invalid file format
{
  "message": "Only image files (JPG, PNG) and PDF files are allowed"
}
```

---

### 2. Get All My Records (Summary)

**Endpoint**: `GET /api/MedicalRecords/my-records`  
**Authorization**: Patient JWT Token

**Response** (200 OK):
```json
{
  "totalRecords": 5,
  "ecgRecords": 3,
  "xRayRecords": 2,
  "lastUpdated": "2025-01-01T12:00:00Z",
  "records": [
    {
      "id": 1,
      "recordType": "ECG",
      "fileName": "ecg_report.pdf",
      "filePath": "/uploads/medical-records/ECG_1_20250101120000_abc123.pdf",
      "fileType": "application/pdf",
      "fileSize": 2048576,
      "fileSizeFormatted": "1.95 MB",
      "notes": "ECG from checkup",
      "uploadedAt": "2025-01-01T12:00:00Z",
      "updatedAt": null
    },
    {
      "id": 2,
      "recordType": "X-Ray",
      "fileName": "chest_xray.jpg",
      "filePath": "/uploads/medical-records/X-Ray_1_20250101130000_def456.jpg",
      "fileType": "image/jpeg",
      "fileSize": 1536000,
      "fileSizeFormatted": "1.46 MB",
      "notes": "Chest X-Ray",
      "uploadedAt": "2025-01-01T13:00:00Z",
      "updatedAt": null
    }
  ]
}
```

---

### 3. Get Records by Type (Filter)

**Endpoint**: `GET /api/MedicalRecords/my-records/{recordType}`  
**Authorization**: Patient JWT Token  
**Parameters**: 
- `recordType` (path): `ECG` or `X-Ray`

**Example**:
```
GET /api/MedicalRecords/my-records/ECG
```

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "recordType": "ECG",
    "fileName": "ecg_report.pdf",
    "filePath": "/uploads/medical-records/ECG_1_20250101120000_abc123.pdf",
    "fileType": "application/pdf",
    "fileSize": 2048576,
    "fileSizeFormatted": "1.95 MB",
    "notes": "ECG from checkup",
    "uploadedAt": "2025-01-01T12:00:00Z",
    "updatedAt": null
  }
]
```

---

### 4. Delete Medical Record

**Endpoint**: `DELETE /api/MedicalRecords/{recordId}`  
**Authorization**: Patient JWT Token  
**Parameters**: 
- `recordId` (path): ID of the record to delete

**Example**:
```
DELETE /api/MedicalRecords/1
```

**Response** (200 OK):
```json
{
  "message": "Record deleted successfully"
}
```

**Error Responses**:
```json
// Record not found
{
  "message": "Record not found"
}

// Unauthorized (not your record)
{
  "message": "Unauthorized: This record does not belong to you"
}
```

---

### 5. Generate QR Code

**Endpoint**: `GET /api/MedicalRecords/generate-qr`  
**Authorization**: Patient JWT Token

**Response** (200 OK):
```json
{
  "qrCodeData": "http://localhost:5000/api/MedicalRecords/view/1",
  "qrCodeImageBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "generatedAt": "2025-01-01T14:00:00Z",
  "lastRecordUpdate": "2025-01-01T13:00:00Z",
  "totalRecords": 5
}
```

**Usage**:
- Display `qrCodeImageBase64` in an `<img>` tag
- Doctor scans QR Code ? Opens URL in `qrCodeData`
- `generatedAt`: When QR was created
- `lastRecordUpdate`: When last record was uploaded/modified

---

### 6. View Patient Records (Doctor Access)

**Endpoint**: `GET /api/MedicalRecords/view/{patientId}`  
**Authorization**: Doctor or Admin JWT Token  
**Parameters**: 
- `patientId` (path): ID of the patient

**Example**:
```
GET /api/MedicalRecords/view/1
```

**Response**: Same as "Get All My Records" endpoint

---

## ?? Database Migration Required

Since we updated the `MedicalRecord` model, you need to create a migration:

```bash
# Stop API first
cd Backend
dotnet ef migrations add AddRecordTypeToMedicalRecords --project PulseX.Data --startup-project PulseX.API
dotnet ef database update --project PulseX.Data --startup-project PulseX.API
```

**New/Updated Columns**:
- `RecordType` (NVARCHAR(50), NOT NULL) - ECG or X-Ray
- `Notes` (NVARCHAR(MAX), NULLABLE) - Renamed from Description
- `UpdatedAt` (DATETIME2, NULLABLE) - Track modifications

---

## ?? Testing Guide

### Test 1: Upload ECG Record

1. **Login as patient**:
```http
POST /api/auth/login
Body: {"email": "patient@example.com", "password": "password"}
? Copy token
```

2. **Upload ECG**:
```http
POST /api/MedicalRecords/upload
Headers: Authorization: Bearer {token}
Content-Type: multipart/form-data
Body:
  - recordType: "ECG"
  - file: (select ECG image/PDF)
  - notes: "ECG from hospital checkup"
? Should return 200 with record details
```

---

### Test 2: Upload X-Ray Record

```http
POST /api/MedicalRecords/upload
Headers: Authorization: Bearer {token}
Body:
  - recordType: "X-Ray"
  - file: (select X-Ray image)
  - notes: "Chest X-Ray"
? Should return 200 with record details
```

---

### Test 3: Get All Records

```http
GET /api/MedicalRecords/my-records
Headers: Authorization: Bearer {token}
? Should return summary with both ECG and X-Ray records
```

**Expected Response**:
```json
{
  "totalRecords": 2,
  "ecgRecords": 1,
  "xRayRecords": 1,
  "lastUpdated": "2025-01-01T13:00:00Z",
  "records": [...]
}
```

---

### Test 4: Filter by Type

```http
GET /api/MedicalRecords/my-records/ECG
Headers: Authorization: Bearer {token}
? Should return only ECG records

GET /api/MedicalRecords/my-records/X-Ray
Headers: Authorization: Bearer {token}
? Should return only X-Ray records
```

---

### Test 5: Generate QR Code

```http
GET /api/MedicalRecords/generate-qr
Headers: Authorization: Bearer {token}
? Should return QR code image in Base64 format
```

**Frontend Display**:
```html
<img src="{qrCodeImageBase64}" alt="Medical Records QR Code" />
```

---

### Test 6: Delete Record

```http
DELETE /api/MedicalRecords/1
Headers: Authorization: Bearer {token}
? Should return 200 with success message
```

---

### Test 7: Doctor Access (via QR)

1. **Login as doctor**:
```http
POST /api/auth/login
Body: {"email": "doctor@example.com", "password": "password"}
? Copy doctor token
```

2. **View patient records**:
```http
GET /api/MedicalRecords/view/1
Headers: Authorization: Bearer {doctor_token}
? Should return all records for patient ID 1
```

---

## ?? Frontend Integration

### Upload Form (React Example)

```jsx
const UploadMedicalRecord = () => {
  const [recordType, setRecordType] = useState('ECG');
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('recordType', recordType);
    formData.append('file', file);
    formData.append('notes', notes);
    
    const response = await fetch('http://localhost:5000/api/MedicalRecords/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const data = await response.json();
    if (response.ok) {
      alert('Record uploaded successfully!');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <select value={recordType} onChange={(e) => setRecordType(e.target.value)}>
        <option value="ECG">ECG (??? ?????)</option>
        <option value="X-Ray">X-Ray (??????)</option>
      </select>
      
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      
      <textarea 
        placeholder="Notes (optional)" 
        value={notes} 
        onChange={(e) => setNotes(e.target.value)} 
      />
      
      <button type="submit">Upload</button>
    </form>
  );
};
```

---

### View Records with Filtering

```jsx
const MedicalRecords = () => {
  const [filter, setFilter] = useState('all'); // all, ECG, X-Ray
  const [records, setRecords] = useState([]);
  
  useEffect(() => {
    fetchRecords();
  }, [filter]);
  
  const fetchRecords = async () => {
    const url = filter === 'all' 
      ? 'http://localhost:5000/api/MedicalRecords/my-records'
      : `http://localhost:5000/api/MedicalRecords/my-records/${filter}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    setRecords(filter === 'all' ? data.records : data);
  };
  
  return (
    <div>
      <div className="filters">
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('ECG')}>ECG</button>
        <button onClick={() => setFilter('X-Ray')}>X-Ray</button>
      </div>
      
      <div className="records">
        {records.map(record => (
          <div key={record.id} className="record-card">
            <h3>{record.recordType}</h3>
            <p>{record.fileName}</p>
            <p>{record.fileSizeFormatted}</p>
            <p>{record.notes}</p>
            <p>Uploaded: {new Date(record.uploadedAt).toLocaleDateString()}</p>
            <button onClick={() => deleteRecord(record.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

### QR Code Display

```jsx
const QRCodeDisplay = () => {
  const [qrCode, setQRCode] = useState(null);
  
  const generateQR = async () => {
    const response = await fetch('http://localhost:5000/api/MedicalRecords/generate-qr', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    setQRCode(data);
  };
  
  return (
    <div>
      <button onClick={generateQR}>Generate QR Code</button>
      
      {qrCode && (
        <div className="qr-container">
          <img src={qrCode.qrCodeImageBase64} alt="Medical Records QR" />
          <p>Generated: {new Date(qrCode.generatedAt).toLocaleString()}</p>
          <p>Last Update: {new Date(qrCode.lastRecordUpdate).toLocaleString()}</p>
          <p>Total Records: {qrCode.totalRecords}</p>
        </div>
      )}
    </div>
  );
};
```

---

## ?? File Storage Structure

```
PulseX.API/
??? wwwroot/
    ??? uploads/
        ??? medical-records/
            ??? ECG_1_20250101120000_abc123.pdf
            ??? ECG_1_20250101130000_def456.jpg
            ??? X-Ray_1_20250101140000_ghi789.jpg
            ??? X-Ray_2_20250101150000_jkl012.png
```

**Naming Convention**:
```
{RecordType}_{PatientId}_{Timestamp}_{UniqueGuid}.{Extension}
```

---

## ?? Security Features

1. **Authentication**: All endpoints require valid JWT token
2. **Authorization**: 
   - Patients can only access their own records
   - Doctors can view via QR or direct API
   - Admins have full access
3. **File Validation**:
   - Type checking (images/PDF only)
   - Size limit (10MB max)
   - Safe file naming (prevents path traversal)
4. **Physical File Deletion**: When record deleted, file removed from disk

---

## ?? Important Notes

1. **File Size**: 10MB limit per file (configurable in service)
2. **Supported Formats**: JPG, PNG, PDF only
3. **QR Code**: Valid as long as patient has records
4. **Last Update Tracking**: Automatically updated when records change
5. **Static Files**: Ensure `app.UseStaticFiles()` is enabled in Program.cs

---

## ?? Status

**Medical Records Upload**: ? Complete  
**ECG/X-Ray Filtering**: ? Complete  
**QR Code Generation**: ? Complete  
**Doctor Access**: ? Complete  
**File Management**: ? Complete  
**Build Status**: ? Needs migration  

---

## ?? Next Steps

1. **Stop API** (important for migration)
2. **Run migration** for MedicalRecord updates
3. **Test upload** with both ECG and X-Ray
4. **Test QR Code** generation
5. **Test doctor access** via QR

---

**Version**: 1.0 (Medical Records)  
**Date**: 2025-01-04  
**Status**: ? Code Complete | ? Migration Pending  

---

**Built with ?? for PulseX Graduation Project**

?? **Next**: Dashboard ? Risk Assessment ? Medical Records ? **QR Code Flow Testing** ?
