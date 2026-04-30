# PulseX Features Hub 🌐

This folder is the domain center of the application.
Each subfolder represents a business area or user role, which keeps the codebase scalable and easy to navigate.

## Why This Structure?

- It groups files by feature value, not only by technical type.
- It helps teams work in parallel without stepping on each other.
- It keeps route-level pages close to their related UI modules.

## Folder Structure

```text
features/
├─ admin/
├─ auth/
├─ doctor/
├─ home/
└─ patient/
```

## Domain Purpose

- `admin/`
  Platform operations and management flows.

- `auth/`
  Authentication journey (login, register, forgot password).

- `doctor/`
  Doctor-facing experience and workflows.

- `home/`
  Public landing content and marketing sections.

- `patient/`
  Patient healthcare journey and personalized tools.

## Common Internal Pattern

Most domains follow this layout:

```text
<domain>/
├─ components/   # Reusable UI blocks inside the same domain
├─ pages/        # Route-entry pages for this domain
└─ hooks/        # Optional domain-specific hooks (if needed)
```

## Responsive Strategy (Across Features)

- Mobile-first Tailwind classes are used by default.
- Layouts scale progressively using breakpoints (`sm`, `md`, `lg`, `xl`).
- Tables and dense UI blocks switch to stacked cards or scroll containers on smaller screens.
- Sidebars and secondary panels collapse/overlay for handheld devices.

## Developer Notes

- Keep each domain isolated.
- Reuse shared blocks inside the same domain before adding new ones.
- Keep page files focused on composition, and put UI-heavy parts in components.
