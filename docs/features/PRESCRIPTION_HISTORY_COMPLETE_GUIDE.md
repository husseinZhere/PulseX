# ?? ???? Prescription History - ???? ??????? ??????

## ? ???? ???????: **????? 100%**

????? ???????: 2025-01-XX

---

## ?? **?? ?? ??????**

### 1?? **Enhanced API Endpoints**

#### **GET /api/prescriptions/my-prescriptions**
```http
GET /api/prescriptions/my-prescriptions?status=active&searchTerm=Dr.Smith&page=1&pageSize=10
Authorization: Bearer {patient_token}
```

**Query Parameters:**
- `status`: "active", "completed", or null ????
- `searchTerm`: ??? ?? Doctor name ?? Date ?? Prescription ID
- `page`: ??? ?????? (default: 1)
- `pageSize`: ??? ??????? (default: 10)

**Response:**
```json
{
  "prescriptions": [
    {
      "id": 5,
      "doctorId": 3,
      "doctorName": "Dr. Sarah Mitchell",
      "doctorSpecialization": "Internal Medicine",
      "patientId": 12,
      "patientName": "Mohamed Salem",
      "appointmentId": null,
      "medications": [
        {
          "drugName": "Aspirin",
          "dosage": "100mg",
          "frequency": "Once daily",
          "duration": "30 days"
        },
        {
          "drugName": "Metformin",
          "dosage": "500mg",
          "frequency": "Twice daily",
          "duration": "30 days"
        }
      ],
      "labRequests": [
        {
          "testName": "Complete Blood Count",
          "additionalNotes": "Fasting required"
        }
      ],
      "clinicalNotes": "Continue current treatment plan",
      "createdAt": "2026-02-10T09:30:00Z",
      "isRead": false,
      "status": "Active",
      "prescriptionId": "RX-2026-0210-0005"
    }
  ],
  "stats": {
    "totalPrescriptions": 6,
    "activePrescriptions": 2,
    "completedPrescriptions": 4
  },
  "totalCount": 6,
  "page": 1,
  "pageSize": 10,
  "totalPages": 1
}
```

---

#### **GET /api/prescriptions/my-prescriptions/stats**
```http
GET /api/prescriptions/my-prescriptions/stats
Authorization: Bearer {patient_token}
```

**Response:**
```json
{
  "totalPrescriptions": 6,
  "activePrescriptions": 2,
  "completedPrescriptions": 4
}
```

---

### 2?? **Status Logic**

```csharp
// ?? MapToPrescriptionResponseDto
var daysSinceCreation = (DateTime.UtcNow - prescription.CreatedAt).Days;
var status = daysSinceCreation <= 30 ? "Active" : "Completed";
```

**???????:**
- **Active**: ??????? ???? ?? 30 ???
- **Completed**: ??????? ???? ?? 30 ???

---

### 3?? **Prescription ID Format**

```csharp
var prescriptionId = $"RX-{prescription.CreatedAt:yyyy-MMdd}-{prescription.Id:D4}";
```

**????:**
- `RX-2026-0210-0005`
- `RX-2025-1220-0147`

---

### 4?? **Search Functionality**

```csharp
if (!string.IsNullOrEmpty(searchTerm))
{
    var searchLower = searchTerm.ToLower();
    prescriptionDtos = prescriptionDtos.Where(p =>
        p.DoctorName.ToLower().Contains(searchLower) ||
        p.CreatedAt.ToString("MMMM dd, yyyy").ToLower().Contains(searchLower) ||
        p.PrescriptionId.ToLower().Contains(searchLower)
    ).ToList();
}
```

**???? ??:**
- ??? ??????? (Dr. Sarah Mitchell)
- ????? ??????? (February 10, 2026)
- ??? ??????? (RX-2026-0210-0005)

---

### 5?? **Filter by Status**

```csharp
if (status.ToLower() == "active")
{
    prescriptionDtos = prescriptionDtos.Where(p => p.Status == "Active").ToList();
}
else if (status.ToLower() == "completed")
{
    prescriptionDtos = prescriptionDtos.Where(p => p.Status == "Completed").ToList();
}
```

---

### 6?? **Pagination**

```csharp
var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
var paginatedPrescriptions = prescriptionDtos
    .OrderByDescending(p => p.CreatedAt)
    .Skip((page - 1) * pageSize)
    .Take(pageSize)
    .ToList();
```

---

## ?? **Frontend Integration**

### **React Component ????:**

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PrescriptionHistory = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [stats, setStats] = useState({});
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
  }, [filter, searchTerm, page]);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const status = filter === 'all' ? null : filter;
      
      const response = await axios.get(
        `${API_URL}/api/prescriptions/my-prescriptions`,
        {
          params: { status, searchTerm, page, pageSize: 10 },
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      setPrescriptions(response.data.prescriptions);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prescription-history">
      {/* Stats Cards */}
      <div className="stats-grid">
        <StatsCard 
          title="Total Prescriptions" 
          value={stats.totalPrescriptions} 
          color="blue" 
        />
        <StatsCard 
          title="Active" 
          value={stats.activePrescriptions} 
          color="green" 
        />
        <StatsCard 
          title="Completed" 
          value={stats.completedPrescriptions} 
          color="gray" 
        />
      </div>

      {/* Filters */}
      <div className="filters">
        <input 
          type="text" 
          placeholder="Search by Doctor or Date..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={filter === 'active' ? 'active' : ''}
            onClick={() => setFilter('active')}
          >
            Active Only
          </button>
          <button 
            className={filter === 'completed' ? 'active' : ''}
            onClick={() => setFilter('completed')}
          >
            Completed Only
          </button>
        </div>
      </div>

      {/* Prescriptions List */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="prescriptions-list">
          <p>Showing {prescriptions.length} prescriptions</p>
          
          {prescriptions.map(prescription => (
            <PrescriptionCard key={prescription.id} prescription={prescription} />
          ))}
        </div>
      )}
    </div>
  );
};

const PrescriptionCard = ({ prescription }) => {
  return (
    <div className="prescription-card">
      {/* Doctor Info */}
      <div className="doctor-info">
        <div className="avatar">{prescription.doctorName[0]}</div>
        <div>
          <h3>{prescription.doctorName}</h3>
          <p>{prescription.doctorSpecialization}</p>
          <span className={`badge ${prescription.status.toLowerCase()}`}>
            {prescription.status}
          </span>
        </div>
      </div>

      {/* Issued Date */}
      <p className="issued-date">
        Issued: {new Date(prescription.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </p>

      {/* Details */}
      <div className="details">
        <div>
          <span>Medications</span>
          <strong>{prescription.medications.length} Items</strong>
        </div>
        <div>
          <span>Tests Requested</span>
          <strong>{prescription.labRequests.length} Items</strong>
        </div>
      </div>

      {/* Prescription ID */}
      <p className="prescription-id">ID: {prescription.prescriptionId}</p>

      {/* Actions */}
      <div className="actions">
        <button className="view-btn">?? View</button>
        <button className="download-btn">? Download</button>
      </div>
    </div>
  );
};

export default PrescriptionHistory;
```

---

## ?? **UI Design ??????? (??? ??????)**

### **1. Statistics Cards:**
```jsx
<div className="stats-cards">
  <div className="stat-card blue-border">
    <h4>Total Prescriptions</h4>
    <p className="number">6</p>
  </div>
  
  <div className="stat-card green-border">
    <h4>Active</h4>
    <p className="number green">2</p>
  </div>
  
  <div className="stat-card gray-border">
    <h4>Completed</h4>
    <p className="number gray">4</p>
  </div>
</div>
```

### **2. Search Bar:**
```jsx
<div className="search-container">
  <input 
    type="text" 
    placeholder="Search by Doctor or Date..." 
    className="search-input"
  />
  <button className="filter-btn">
    ?? Filter
  </button>
</div>
```

### **3. Filter Tabs:**
```jsx
<div className="filter-tabs">
  <button className="tab">All</button>
  <button className="tab active">Active Only</button>
  <button className="tab">Completed Only</button>
</div>
```

### **4. Prescription Card:**
```jsx
<div className="prescription-card">
  {/* Avatar + Doctor Info */}
  <div className="doctor-section">
    <div className="avatar">S</div>
    <div>
      <h3>Dr. Sarah Mitchell</h3>
      <p>Internal Medicine</p>
    </div>
    <span className="badge active">Active</span>
  </div>

  {/* Date */}
  <p className="date">?? Issued: February 10, 2026</p>

  {/* Stats */}
  <div className="stats">
    <div>
      <span>Medications</span>
      <strong>3 Items</strong>
    </div>
    <div>
      <span>Tests Requested</span>
      <strong>2 Items</strong>
    </div>
  </div>

  {/* ID */}
  <p className="id">ID: RX-2026-0210-4523</p>

  {/* Buttons */}
  <div className="buttons">
    <button className="view">?? View</button>
    <button className="download">?</button>
  </div>
</div>
```

---

## ?? **Testing**

### **1. Get All Prescriptions:**
```bash
curl -X GET "http://localhost:5000/api/prescriptions/my-prescriptions" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **2. Filter Active Only:**
```bash
curl -X GET "http://localhost:5000/api/prescriptions/my-prescriptions?status=active" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **3. Search by Doctor:**
```bash
curl -X GET "http://localhost:5000/api/prescriptions/my-prescriptions?searchTerm=Sarah" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **4. Get Stats:**
```bash
curl -X GET "http://localhost:5000/api/prescriptions/my-prescriptions/stats" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ? **Checklist**

### Backend:
- [x] Enhanced GET /api/prescriptions/my-prescriptions
- [x] Added stats endpoint
- [x] Status logic (Active/Completed)
- [x] Search functionality
- [x] Filter by status
- [x] Pagination
- [x] Prescription ID generation
- [x] Doctor specialization in response
- [x] Build successful

### Frontend (????? ?????):
- [ ] Stats cards component
- [ ] Search input
- [ ] Filter tabs
- [ ] Prescription card component
- [ ] Pagination component
- [ ] View modal
- [ ] Download PDF

---

## ?? **??????? ????**

1. **Status Logic**: ?????? ????? ??? 30 ???? ???? ??????
2. **Pagination**: default page size = 10
3. **Search**: case-insensitive
4. **Sorting**: ?????? ?? ?????? ??????

---

**? Backend ???? 100%!**

???? ??? ????? ??? Frontend ?????? ??? UI! ??
