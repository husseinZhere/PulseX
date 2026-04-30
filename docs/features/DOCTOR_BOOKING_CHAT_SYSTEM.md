# ?? Doctor Booking & Chat System - Complete Guide

## ?? System Overview

Complete implementation of Doctor List ? Profile ? Booking ? Payment ? Chat flow.

---

## ?? Business Logic Flow

```
1. Doctor List (with filters)
   ?
2. Doctor Profile (with canChat check)
   ?
3. View Available Slots
   ?
4. Create Appointment
   ?
5. Payment (Simulated)
   ??? Cash ? PaymentStatus = Pending, Status = Scheduled
   ??? Card ? PaymentStatus = Paid, Status = Confirmed
   ?
6. Chat Enabled ? (if Paid & Confirmed)
```

---

## ?? API Endpoints

### 1?? Doctor List with Filtering

```http
GET /api/DoctorBooking/doctors?searchTerm=cardio&minRating=4.0&pageNumber=1&pageSize=10

Query Parameters:
- searchTerm (optional): Search by name or specialization
- minPrice (optional): Minimum consultation price
- maxPrice (optional): Maximum consultation price
- minRating (optional): Minimum doctor rating
- location (optional): Filter by clinic location
- pageNumber (default: 1)
- pageSize (default: 10)

Response 200 OK:
{
  "statistics": {
    "totalDoctors": 50,
    "topRatedDoctors": 15,
    "activeNow": 30
  },
  "doctors": [
    {
      "id": 1,
      "fullName": "Dr. Ahmed Hassan",
      "specialization": "Cardiologist",
      "profilePicture": "/images/doctor1.jpg",
      "clinicLocation": "Cairo, Egypt",
      "averageRating": 4.8,
      "totalRatings": 120,
      "consultationPrice": 500.00,
      "yearsOfExperience": 15,
      "isActiveNow": true
    }
  ],
  "pagination": {
    "currentPage": 1,
    "pageSize": 10,
    "totalPages": 5,
    "totalItems": 50,
    "hasPrevious": false,
    "hasNext": true
  }
}
```

---

### 2?? Doctor Profile with Chat Authorization

```http
GET /api/DoctorBooking/doctors/{doctorId}/profile
Authorization: Bearer {patient_token}

Response 200 OK:
{
  "id": 1,
  "fullName": "Dr. Ahmed Hassan",
  "specialization": "Cardiologist",
  "profilePicture": "/images/doctor1.jpg",
  "clinicLocation": "Cairo, Egypt",
  "averageRating": 4.8,
  "totalRatings": 120,
  "consultationPrice": 500.00,
  "yearsOfExperience": 15,
  "about": "Experienced cardiologist dedicated to providing comprehensive heart care.",
  "experience": "15+ years of experience in cardiovascular medicine and patient care.",
  "canChat": false  ? Important! Shows if patient can chat
}
```

**Chat Authorization Logic**:
- `canChat: true` ? Patient has **confirmed** appointment with **paid** status
- `canChat: false` ? Patient needs to book appointment first

---

### 3?? Get Available Time Slots

```http
GET /api/DoctorBooking/doctors/{doctorId}/slots?date=2025-01-05

Response 200 OK:
{
  "date": "2025-01-05T00:00:00Z",
  "availableSlots": [
    { "time": "09:00", "isAvailable": true },
    { "time": "09:30", "isAvailable": true },
    { "time": "10:00", "isAvailable": false },  ? Already booked
    { "time": "10:30", "isAvailable": true },
    ...
    { "time": "16:30", "isAvailable": true }
  ]
}
```

**Slot Logic**:
- Slots generated: 9:00 AM - 5:00 PM (every 30 minutes)
- `isAvailable: false` if already booked by another patient

---

### 4?? Create Appointment with Payment

```http
POST /api/DoctorBooking/appointments
Authorization: Bearer {patient_token}
Content-Type: application/json

{
  "doctor_id": 1,
  "appointment_date": "2025-01-05",
  "time_slot": "10:30",
  "payment_method": "Card",  ? "Cash" or "Card"
  "card_number": "4111111111111111",  ? Optional (for Card payment)
  "card_holder": "John Doe",  ? Optional
  "notes": "First consultation"
}

Response 200 OK (Cash Payment):
{
  "appointmentId": 1,
  "doctorName": "Dr. Ahmed Hassan",
  "specialization": "Cardiologist",
  "appointmentDate": "2025-01-05T10:30:00Z",
  "timeSlot": "10:30",
  "status": "Scheduled",  ? Scheduled (not confirmed yet)
  "paymentStatus": "Pending",  ? Pending (cash on arrival)
  "consultationFee": 500.00,
  "canChat": false  ? Can't chat until payment confirmed
}

Response 200 OK (Card Payment):
{
  "appointmentId": 2,
  "doctorName": "Dr. Ahmed Hassan",
  "specialization": "Cardiologist",
  "appointmentDate": "2025-01-05T11:00:00Z",
  "timeSlot": "11:00",
  "status": "Confirmed",  ? Confirmed immediately
  "paymentStatus": "Paid",  ? Paid (simulated)
  "consultationFee": 500.00,
  "canChat": true  ? Can chat immediately! ?
}
```

**Payment Logic**:

| Payment Method | Payment Status | Appointment Status | Can Chat? |
|----------------|----------------|--------------------|-----------|
| Cash | Pending | Scheduled | ? No |
| Card (Simulated) | Paid | Confirmed | ? Yes |

---

### 5?? Check Chat Authorization

```http
GET /api/DoctorBooking/doctors/{doctorId}/can-chat
Authorization: Bearer {patient_token}

Response 200 OK:
{
  "canChat": true
}

Response 200 OK (No appointment):
{
  "canChat": false
}
```

---

### 6?? Chat with Doctor (Protected)

```http
POST /api/Chatbot/chat/{doctorId}
Authorization: Bearer {patient_token}
Content-Type: application/json

{
  "message": "Hello, I have a question about my medication"
}

Response 200 OK (Authorized):
{
  "message": "Response generated successfully",
  "data": {
    "response": "Hello! How can I help you today?",
    // ... chatbot response
  }
}

Response 403 Forbidden (Not Authorized):
{
  "message": "Access denied. You need a confirmed appointment with this doctor to chat.",
  "requiresBooking": true
}
```

---

## ?? Authorization Rules

### Chat Access Requirements:
```
Patient can chat with doctor IF:
1. Has appointment with this doctor
2. Appointment status = Confirmed OR Completed
3. Payment status = Paid

Otherwise ? 403 Forbidden
```

### Implementation:
```csharp
public async Task<bool> CanChatWithDoctorAsync(int patientId, int doctorId)
{
    var appointments = await _appointmentRepository.GetByPatientIdAsync(patientId);
    
    return appointments.Any(a =>
        a.DoctorId == doctorId &&
        (a.Status == AppointmentStatus.Confirmed || 
         a.Status == AppointmentStatus.Completed) &&
        a.PaymentStatus == PaymentStatus.Paid);
}
```

---

## ?? Database Schema

### Appointments Table:
```sql
Appointments:
- Id (PK)
- PatientId (FK ? Patients)
- DoctorId (FK ? Doctors)
- AppointmentDate (DateTime)
- Status (Enum: Scheduled, Confirmed, Completed, Cancelled)
- PaymentMethod (Enum: Cash, Online)
- PaymentStatus (Enum: Pending, Paid, Failed)
- Notes (string)
- CreatedAt, UpdatedAt
```

---

## ?? Frontend Integration

### 1. Doctor List Page

```jsx
const DoctorList = () => {
  const [filters, setFilters] = useState({
    searchTerm: '',
    minPrice: null,
    maxPrice: null,
    minRating: null,
    location: '',
    pageNumber: 1
  });

  const fetchDoctors = async () => {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`/api/DoctorBooking/doctors?${queryParams}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    setStatistics(data.statistics);
    setDoctors(data.doctors);
    setPagination(data.pagination);
  };

  return (
    <div>
      {/* Statistics */}
      <div className="stats">
        <p>Total: {statistics.totalDoctors}</p>
        <p>Top Rated: {statistics.topRatedDoctors}</p>
        <p>Active Now: {statistics.activeNow}</p>
      </div>

      {/* Filters */}
      <input 
        placeholder="Search doctors..." 
        onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
      />

      {/* Doctor Cards */}
      {doctors.map(doctor => (
        <DoctorCard key={doctor.id} doctor={doctor} />
      ))}

      {/* Pagination */}
      <Pagination data={pagination} />
    </div>
  );
};
```

---

### 2. Doctor Profile Page

```jsx
const DoctorProfile = ({ doctorId }) => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetch(`/api/DoctorBooking/doctors/${doctorId}/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setProfile);
  }, [doctorId]);

  return (
    <div>
      <h1>{profile.fullName}</h1>
      <p>{profile.specialization}</p>
      <p>Price: ${profile.consultationPrice}</p>
      <p>Rating: {profile.averageRating} ?</p>

      {/* Chat Button - Conditional */}
      {profile.canChat ? (
        <button onClick={openChat}>?? Chat Now</button>
      ) : (
        <button onClick={openBooking}>?? Book Appointment First</button>
      )}
    </div>
  );
};
```

---

### 3. Booking Page

```jsx
const BookingPage = ({ doctorId }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  const fetchSlots = async (date) => {
    const response = await fetch(
      `/api/DoctorBooking/doctors/${doctorId}/slots?date=${date}`
    );
    const data = await response.json();
    setSlots(data.availableSlots);
  };

  const bookAppointment = async () => {
    const response = await fetch('/api/DoctorBooking/appointments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        doctor_id: doctorId,
        appointment_date: selectedDate,
        time_slot: selectedSlot,
        payment_method: paymentMethod,
        card_number: paymentMethod === 'Card' ? cardNumber : null
      })
    });

    const summary = await response.json();
    
    // Show success & chat availability
    if (summary.canChat) {
      alert('Booking confirmed! You can now chat with the doctor.');
    } else {
      alert('Booking successful! Payment pending.');
    }
  };

  return (
    <div>
      <DatePicker onChange={setSelectedDate} />
      <TimeSlotPicker slots={slots} onSelect={setSelectedSlot} />
      
      <select onChange={(e) => setPaymentMethod(e.target.value)}>
        <option value="Cash">Cash</option>
        <option value="Card">Card</option>
      </select>

      {paymentMethod === 'Card' && (
        <input placeholder="Card Number" onChange={(e) => setCardNumber(e.target.value)} />
      )}

      <button onClick={bookAppointment}>Confirm Booking</button>
    </div>
  );
};
```

---

### 4. Chat Page

```jsx
const ChatPage = ({ doctorId }) => {
  const [canChat, setCanChat] = useState(false);

  useEffect(() => {
    // Check authorization
    fetch(`/api/DoctorBooking/doctors/${doctorId}/can-chat`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setCanChat(data.canChat));
  }, [doctorId]);

  const sendMessage = async (message) => {
    if (!canChat) {
      alert('You need to book an appointment first!');
      return;
    }

    const response = await fetch(`/api/Chatbot/chat/${doctorId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    });

    if (response.status === 403) {
      alert('Access denied. Book an appointment to chat.');
      redirectTo('/booking');
      return;
    }

    const data = await response.json();
    displayMessage(data.data.response);
  };

  return (
    <div>
      {canChat ? (
        <ChatInterface onSend={sendMessage} />
      ) : (
        <div>
          <p>You need a confirmed appointment to chat with this doctor.</p>
          <button onClick={() => redirectTo('/booking')}>Book Now</button>
        </div>
      )}
    </div>
  );
};
```

---

## ?? Testing Scenarios

### Scenario 1: Book with Cash
```
1. Browse doctors ? GET /doctors
2. View profile ? GET /doctors/1/profile
   Response: canChat = false
3. Check slots ? GET /doctors/1/slots?date=2025-01-05
4. Book appointment ? POST /appointments (payment_method: "Cash")
   Response: paymentStatus = "Pending", canChat = false
5. Try to chat ? POST /chat/1
   Response: 403 Forbidden ?
```

### Scenario 2: Book with Card (Simulated)
```
1. Browse doctors ? GET /doctors
2. View profile ? GET /doctors/1/profile
   Response: canChat = false
3. Check slots ? GET /doctors/1/slots?date=2025-01-05
4. Book appointment ? POST /appointments (payment_method: "Card")
   Response: paymentStatus = "Paid", canChat = true ?
5. Chat with doctor ? POST /chat/1
   Response: 200 OK ?
```

---

## ? Summary

**What's Implemented**:
1. ? Doctor list with filtering & pagination
2. ? Doctor profile with chat authorization
3. ? Available time slots
4. ? Appointment booking
5. ? Simulated payment (Cash/Card)
6. ? Chat access control
7. ? Complete authorization flow

**Files Created**:
- ? `DoctorSearchDto.cs` - DTOs for doctor list/profile
- ? `BookingDto.cs` - DTOs for booking/payment
- ? `DoctorBookingService.cs` - Business logic
- ? `DoctorBookingController.cs` - API endpoints
- ? Updated `ChatbotController.cs` - Chat authorization

**Next Steps**:
1. Register service in Program.cs ?
2. Build & test endpoints
3. Frontend integration
4. Real payment gateway (future)

---

**Date**: 2025-01-04  
**Version**: 1.0  
**Status**: ? Complete & Ready for Testing!  

**Built with ?? for PulseX Graduation Project**

?? **Complete Doctor Booking & Chat Flow!** ????
