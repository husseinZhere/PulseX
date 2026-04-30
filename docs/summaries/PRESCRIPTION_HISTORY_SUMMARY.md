# ?? ???? Prescription History - ???? ?????

## ? **?? ???????**

### ?? **API Endpoints:**

#### 1. **Get Prescriptions with Filters**
```
GET /api/prescriptions/my-prescriptions
  ?status=active
  &searchTerm=Dr.Sarah
  &page=1
  &pageSize=10

Authorization: Bearer {token}
```

#### 2. **Get Statistics**
```
GET /api/prescriptions/my-prescriptions/stats
Authorization: Bearer {token}
```

---

## ?? **Response Example:**

```json
{
  "prescriptions": [...],
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

## ?? **Features:**

? **Filter by Status:**
- All
- Active Only (< 30 days)
- Completed Only (> 30 days)

? **Search:**
- Doctor name
- Date
- Prescription ID

? **Pagination:**
- Page
- PageSize
- TotalPages

? **Prescription ID Format:**
- `RX-2026-0210-0005`

? **Doctor Info:**
- Name
- Specialization

? **Counts:**
- Total Prescriptions
- Active
- Completed

---

## ?? **Quick Frontend Example:**

```javascript
// Fetch prescriptions
const fetchPrescriptions = async (status, searchTerm) => {
  const response = await axios.get(
    `/api/prescriptions/my-prescriptions`,
    {
      params: { status, searchTerm, page: 1, pageSize: 10 },
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  
  console.log(response.data);
  // {
  //   prescriptions: [...],
  //   stats: { total: 6, active: 2, completed: 4 }
  // }
};
```

---

## ?? **UI Components Needed:**

1. **Stats Cards** - Total, Active, Completed
2. **Search Bar** - ??? ?? doctor/date
3. **Filter Tabs** - All/Active/Completed
4. **Prescription Cards** - ??? ????????
5. **Pagination** - ?????? ??? ???????

---

## ?? **Quick Test:**

```bash
# All prescriptions
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/prescriptions/my-prescriptions

# Active only
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5000/api/prescriptions/my-prescriptions?status=active"

# Stats
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/prescriptions/my-prescriptions/stats
```

---

**? Backend Done! Ready for Frontend! ??**
