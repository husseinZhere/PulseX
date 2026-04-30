# PulseX Patient Module 💙

This module delivers the full patient journey in PulseX.
It includes dashboard experiences, appointments, booking, stories, records, messaging, prescriptions, and settings.

## Folder Structure

```text
patient/
├─ components/
│  ├─ PatientLayout/
│  ├─ PatientSidebar/
│  ├─ PatientHeader/
│  ├─ PatientDashboard/
│  ├─ DoctorList/
│  ├─ DoctorProfile/
│  ├─ Booking/
│  ├─ Appointments/
│  ├─ Messages/
│  ├─ PatientMedicalRecords/
│  ├─ Prescriptions/
│  ├─ PrescriptionDetail/
│  ├─ Stories/
│  ├─ StoryDetails/
│  ├─ AllComments/
│  ├─ WriteStory/
│  ├─ LifestyleSurvey/
│  ├─ HeartRisk/
│  ├─ QRCode/
│  └─ ...
├─ pages/
│  ├─ PatientDashboard/
│  ├─ PatientDoctorList/
│  ├─ PatientDoctorProfile/
│  ├─ PatientBooking/
│  ├─ PatientAppointments/
│  ├─ PatientMessages/
│  ├─ PatientMedicalRecords/
│  ├─ Prescriptions/
│  ├─ PrescriptionDetail/
│  ├─ Stories/
│  ├─ StoryDetails/
│  ├─ AllComments/
│  ├─ WriteStory/
│  ├─ PatientSettingsProfile/
│  └─ ...
└─ hooks/
   └─ usePatientData.js
```

## Why This Structure Works

- `pages/` acts as route-entry composition.
- `components/` keeps reusable patient UI grouped by domain task.
- `hooks/` keeps patient-specific data logic reusable and isolated.

This pattern improves readability and helps teams ship features safely.

## High-Level Patient Flow

1. User lands on `/patient/*` routes.
2. `PatientLayout` provides shell navigation and content frame.
3. A route page from `pages/` loads the screen entry.
4. The page composes dedicated blocks from `components/`.
5. Interactions (search, booking, messaging, updates) are handled inside focused modules.

## Responsive Behavior

- Mobile-first layout strategy.
- Grids and cards scale through standard Tailwind breakpoints.
- Multi-column desktop areas collapse to single-column mobile stacks.
- Dense sections (tables/details panels) are optimized for small screens via stacked cards or controlled horizontal scrolling.

## UI and Styling Notes

- Uses Tailwind utility classes for predictable styling.
- Relies on shared theme values and local module constants where needed.
- Preserves visual consistency across patient screens.

## Extension Guidelines

1. Add route-level page under `pages/`.
2. Add UI units under the related `components/<Feature>/` folder.
3. Keep reusable behavior in `hooks/` when logic is shared.
4. Prefer composition over large monolithic components.

## Summary

The Patient module is organized for clarity, fast iteration, and a smooth cross-device experience. 📱💻
