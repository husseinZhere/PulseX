# PulseX Admin Module 🛡️

The Admin module is the operational control center of PulseX.
It is designed to keep management flows organized, scalable, and easy for teams to maintain.

## What This Module Handles

- Dashboard insights
- Doctor management
- Patient management
- Stories moderation
- Reports review
- Activity logs tracking
- Settings and profile workflows

## Folder Structure

```text
admin/
├─ components/
│  ├─ AdminLayout/
│  ├─ AdminHeader/
│  ├─ Sidebar/
│  ├─ Doctor/
│  ├─ Patients/
│  ├─ Reports/
│  ├─ ActivityLogs/
│  ├─ SettingsProfile/
│  ├─ ConfirmModal/
│  ├─ ToastNotification/
│  └─ shared/
└─ pages/
   ├─ Dashboard/
   ├─ Doctors/
   ├─ Patients/
   ├─ Stories/
   ├─ Reports/
   ├─ ActivityLogs/
   └─ SettingsProfile/
```

## Why This Structure Works

- `pages/` keeps route-level composition and page entry points clear.
- `components/` contains reusable admin UI and feature views.
- `shared/` inside admin prevents duplication across admin sections.

This split makes development faster and keeps responsibilities clear.

## High-Level Admin Flow

1. User navigates to `/admin/*` routes.
2. `AdminLayout` renders the shell (sidebar, header, content outlet).
3. Route-specific page from `pages/` is loaded.
4. Page composes detailed UI from `components/`.
5. Actions like add/edit/delete/filter/export are handled in feature components.

## Responsive Behavior

- Sidebar collapses to mobile-friendly behavior (overlay/toggle).
- Header and action areas adapt spacing and density by breakpoint.
- Large data views (tables/cards) are adjusted for small screens with scroll or stacked layouts.
- Form screens preserve readability and tap targets on mobile.

## Extension Guidelines

When adding a new admin capability:

1. Add route entry under `pages/<Feature>/`.
2. Add related UI blocks under `components/<Feature>/`.
3. Reuse existing shared primitives where possible.
4. Keep page files thin; move heavy UI logic into components.

## Summary

The Admin module is structured for reliable operations, clean maintenance, and smooth expansion as the platform grows. 💙
