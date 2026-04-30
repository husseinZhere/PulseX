# ?? Medical Records System - Complete Guide

## ?? Overview

???? ???? ?????? ??????? ?????? (ECG & X-Ray) ??:
- ? ??? ??????? (??? ?? PDF)
- ? ??? ?? ????
- ? ???? ??????
- ? ????? QR Code
- ? ????? PDF ??? ?????

---

## ?? ??? Flow ??????

### 1?? Upload Page

**?????? ???? ????**:
- ??? ECG (??? ?????)
- ??? X-Ray (??????)
- ?? ??????? ?? ???

**Upload Button**:
```
POST /api/MedicalRecords/upload
Content-Type: multipart/form-data

Form Data:
- recordType: "ECG" or "X-Ray"
- file: (image or PDF file)
- notes: (optional description)
```

---

### 2?? Records Table

**???? ?? ??????? ?? ????**:

| Column | Description | Example |
|--------|-------------|---------|
| Filename | ??? ????? ?????? | `ecg_report.jpg` |
| Size | ??? ????? | `2.5 MB` |
| Type | ??? ????? | `image/jpeg` |
| Uploaded Date | ????? ????? | `2025-01-04 10:30 AM` |
| Record Type | ??? ????? | `ECG` or `X-Ray` |
| Delete | ???? ????? | ??? |

**API**:
```
GET /api/MedicalRecords/my-records

Response:
{
  "totalRecords": 5,
  "ecgRecords": 3,
  "xRayRecords": 2,
  "lastUpdated": "2025-01-04T10:30:00Z",
  "records": [
    {
      "id": 1,
      "recordType": "ECG",
      "fileName": "ecg_report.jpg",
      "filePath": "/uploads/medical-records/ECG_1_20250104103000_abc123.jpg",
      "fileType": "image/jpeg",
      "fileSize": 2621440,
      "fileSizeFormatted": "2.5 MB",
      "notes": "ECG from checkup",
      "uploadedAt": "2025-01-04T10:30:00Z",
      "updatedAt": null
    }
  ]
}
```

---

### 3?? Summary Section

**???? ????**:

```
???????????????????????????????????
? ?? Summary                      ?
???????????????????????????????????
? Total Files:        5           ?
? Last Uploaded:      Jan 4, 2025 ?
? ECG Files:          3           ?
? X-Ray Files:        2           ?
???????????????????????????????????
```

**??? ??? Response ?? `/my-records`** - ?? ?????? ??? summary fields:
- `totalRecords`
- `lastUpdated`
- `ecgRecords`
- `xRayRecords`

---

### 4?? Delete Record

**???? Delete ?? ?? ??**:

```
DELETE /api/MedicalRecords/{recordId}

Example:
DELETE /api/MedicalRecords/1

Response:
{
  "message": "Record deleted successfully"
}
```

**??? API ?????**:
1. ? ??? ????? ????????? ?? ???????
2. ? ??? ???? ?? ?????????
3. ? ?????? ?? ?????? ?? ???? ?????

---

### 5?? Generate QR Code Button

**??? ?????? ???? ??? ??????**:

```
GET /api/MedicalRecords/generate-qr

Response:
{
  "qrCodeData": "http://localhost:5000/api/MedicalRecords/view/1",
  "qrCodeImageBase64": "data:image/png;base64,iVBORw0KGgoAAAA...",
  "generatedAt": "2025-01-04T11:00:00Z",
  "lastRecordUpdate": "2025-01-04T10:30:00Z",
  "totalRecords": 5
}
```

**QR Code Page ????**:
```
???????????????????????????????????
?         [QR Code Image]         ?
?                                 ?
?  Generated on: Jan 4, 2025      ?
?  Last Updated: Jan 4, 2025      ?
?  Total Files:  5                ?
?                                 ?
?  [Download PDF] Button          ?
???????????????????????????????????
```

---

### 6?? Download PDF Button

**????? PDF ???**:
1. Title: "Medical Records - Patient Name"
2. Generated Date
3. Summary (Total, ECG, X-Ray counts)
4. **ECG Section** - ?? ??? ECG
5. **X-Ray Section** - ?? ??? X-Ray

**API**:
```
GET /api/MedicalRecords/download-pdf

Response:
Content-Type: application/pdf
Content-Disposition: attachment; filename="MedicalRecords_20250104.pdf"

(PDF Binary Data)
```

**??????? ??? PDF**:
```
???????????????????????????????
   Medical Records - John Doe
???????????????????????????????

Generated on: 2025-01-04 11:00 UTC

Summary
???????
Total Files: 5
ECG Files: 3
X-Ray Files: 2


ECG Records
???????????

File: ecg_report_1.jpg
Uploaded: 2025-01-04 10:00
Notes: Regular checkup

[Image embedded here]

?????????????????????????????????

File: ecg_report_2.jpg
Uploaded: 2025-01-04 10:15

[Image embedded here]

?????????????????????????????????


X-Ray Records
?????????????

File: chest_xray.jpg
Uploaded: 2025-01-04 10:30
Notes: Chest X-Ray

[Image embedded here]

?????????????????????????????????
```

---

## ?? Complete API Reference

### 1. Upload Record
```http
POST /api/MedicalRecords/upload
Authorization: Bearer {patient_token}
Content-Type: multipart/form-data

Form Data:
- recordType: "ECG" or "X-Ray" (required)
- file: Image or PDF file (required, max 10MB)
- notes: Optional description (optional)

Response 200 OK:
{
  "id": 1,
  "recordType": "ECG",
  "fileName": "original_filename.jpg",
  "filePath": "/uploads/medical-records/ECG_1_20250104103000_abc123.jpg",
  "fileType": "image/jpeg",
  "fileSize": 2621440,
  "fileSizeFormatted": "2.5 MB",
  "notes": "Optional notes",
  "uploadedAt": "2025-01-04T10:30:00Z",
  "updatedAt": null
}

Errors:
- 400: Invalid record type / File too large / Invalid format
- 401: Unauthorized
```

---

### 2. Get All Records (with Summary)
```http
GET /api/MedicalRecords/my-records
Authorization: Bearer {patient_token}

Response 200 OK:
{
  "totalRecords": 5,
  "ecgRecords": 3,
  "xRayRecords": 2,
  "lastUpdated": "2025-01-04T10:30:00Z",
  "records": [
    { /* record object */ }
  ]
}
```

---

### 3. Get Records by Type
```http
GET /api/MedicalRecords/my-records/ECG
GET /api/MedicalRecords/my-records/X-Ray
Authorization: Bearer {patient_token}

Response 200 OK:
[
  { /* record object */ }
]
```

---

### 4. Delete Record
```http
DELETE /api/MedicalRecords/{recordId}
Authorization: Bearer {patient_token}

Response 200 OK:
{
  "message": "Record deleted successfully"
}

Errors:
- 400: Record not found / Unauthorized
- 401: Unauthorized token
```

---

### 5. Generate QR Code
```http
GET /api/MedicalRecords/generate-qr
Authorization: Bearer {patient_token}

Response 200 OK:
{
  "qrCodeData": "http://localhost:5000/api/MedicalRecords/view/1",
  "qrCodeImageBase64": "data:image/png;base64,iVBORw0...",
  "generatedAt": "2025-01-04T11:00:00Z",
  "lastRecordUpdate": "2025-01-04T10:30:00Z",
  "totalRecords": 5
}
```

---

### 6. Download PDF
```http
GET /api/MedicalRecords/download-pdf
Authorization: Bearer {patient_token}

Response 200 OK:
Content-Type: application/pdf
Content-Disposition: attachment; filename="MedicalRecords_20250104.pdf"

(PDF Binary Data with all images embedded)
```

---

### 7. View Patient Records (Doctor)
```http
GET /api/MedicalRecords/view/{patientId}
Authorization: Bearer {doctor_token}

Response 200 OK:
{
  "totalRecords": 5,
  "ecgRecords": 3,
  "xRayRecords": 2,
  "lastUpdated": "2025-01-04T10:30:00Z",
  "records": [ /* all patient records */ ]
}
```

---

### 8. Download Patient PDF (Doctor)
```http
GET /api/MedicalRecords/view/{patientId}/download-pdf
Authorization: Bearer {doctor_token}

Response 200 OK:
Content-Type: application/pdf
Content-Disposition: attachment; filename="Patient_1_MedicalRecords_20250104.pdf"

(PDF with all patient records)
```

---

## ?? Frontend Integration

### Upload Form

```jsx
const UploadMedicalRecord = () => {
  const [recordType, setRecordType] = useState('ECG');
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('recordType', recordType);
    formData.append('file', file);
    formData.append('notes', notes);

    const response = await fetch('/api/MedicalRecords/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();
    console.log('Uploaded:', data);
  };

  return (
    <div>
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
      
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};
```

---

### Records Table

```jsx
const RecordsTable = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/MedicalRecords/my-records', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setData);
  }, []);

  const handleDelete = async (recordId) => {
    await fetch(`/api/MedicalRecords/${recordId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    // Refresh data
  };

  return (
    <div>
      {/* Summary */}
      <div className="summary">
        <p>Total Files: {data?.totalRecords}</p>
        <p>Last Uploaded: {new Date(data?.lastUpdated).toLocaleDateString()}</p>
        <p>ECG Files: {data?.ecgRecords}</p>
        <p>X-Ray Files: {data?.xRayRecords}</p>
      </div>

      {/* Table */}
      <table>
        <thead>
          <tr>
            <th>Filename</th>
            <th>Size</th>
            <th>Type</th>
            <th>Uploaded Date</th>
            <th>Record Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.records.map(record => (
            <tr key={record.id}>
              <td>{record.fileName}</td>
              <td>{record.fileSizeFormatted}</td>
              <td>{record.fileType}</td>
              <td>{new Date(record.uploadedAt).toLocaleString()}</td>
              <td>{record.recordType}</td>
              <td>
                <button onClick={() => handleDelete(record.id)}>??? Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

---

### QR Code Page

```jsx
const QRCodePage = () => {
  const [qrData, setQrData] = useState(null);

  const generateQR = async () => {
    const response = await fetch('/api/MedicalRecords/generate-qr', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setQrData(data);
  };

  const downloadPDF = async () => {
    const response = await fetch('/api/MedicalRecords/download-pdf', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const blob = await response.blob();
    
    // Download file
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MedicalRecords_${new Date().toISOString().split('T')[0]}.pdf`;
    a.click();
  };

  return (
    <div>
      <button onClick={generateQR}>Generate QR Code</button>

      {qrData && (
        <div className="qr-container">
          <img src={qrData.qrCodeImageBase64} alt="QR Code" />
          
          <p>Generated on: {new Date(qrData.generatedAt).toLocaleString()}</p>
          <p>Last Updated: {new Date(qrData.lastRecordUpdate).toLocaleString()}</p>
          <p>Total Files: {qrData.totalRecords}</p>
          
          <button onClick={downloadPDF}>Download PDF</button>
        </div>
      )}
    </div>
  );
};
```

---

## ?? File Structure

```
wwwroot/
??? uploads/
    ??? medical-records/
        ??? ECG_1_20250104103000_abc123.jpg
        ??? ECG_1_20250104103015_def456.pdf
        ??? X-Ray_1_20250104104000_ghi789.jpg
        ??? X-Ray_1_20250104104500_jkl012.png
```

**Naming Convention**:
```
{RecordType}_{PatientId}_{Timestamp}_{UniqueGuid}.{Extension}
```

---

## ?? Security

1. **Authentication**: All endpoints require valid JWT token
2. **Authorization**:
   - Patients: Can only access their own records
   - Doctors: Can view patient records via QR or direct API
   - Admins: Full access
3. **File Validation**:
   - Type: JPG, PNG, PDF only
   - Size: Max 10MB
   - Safe naming (prevents path traversal)
4. **Physical Deletion**: Files removed from disk when record deleted

---

## ? Summary

**What's Different**:
- ? Removed old `MedicalRecordController` (generic)
- ? Using new `MedicalRecordsController` (ECG/X-Ray specific)
- ? Added PDF generation with embedded images
- ? Complete flow from upload ? table ? summary ? QR ? PDF

**New Features**:
- ? PDF Download with all images
- ? Doctor can download patient PDF
- ? Images embedded in PDF (not just file list)
- ? Professional PDF layout with sections

---

**Version**: 2.0  
**Date**: 2025-01-04  
**Status**: ? Complete  

**Built with ?? for PulseX Graduation Project**
