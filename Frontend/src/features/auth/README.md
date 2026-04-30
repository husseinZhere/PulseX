# PulseX Auth Module 🔐

The Auth module handles account access and identity entry points for the application.
It focuses on a clean and reliable authentication journey.

## Folder Structure

```text
auth/
├─ components/
│  └─ ForgotPassWrapper/
└─ pages/
   ├─ Login/
   ├─ Register/
   └─ ForgotPassword/
```

## Purpose of Each Part

- `pages/`
  Route-level entry screens for login, register, and password recovery.

- `components/`
  Reusable UI wrappers and support blocks shared across auth pages.

## Auth Flow (High-Level)

1. User opens `/login`, `/register`, or `/forgot-password`.
2. Page renders form-focused UI.
3. Validation is applied through shared schema logic.
4. User transitions to the next route after successful action.

## Responsive Behavior

- Forms are centered and readable on small screens.
- Inputs, buttons, and spacing are tuned for touch-first usage.
- Layout scales gracefully for tablet and desktop widths.

## Extension Guidelines

- Add new auth screens under `pages/`.
- Keep shared wrappers or reusable field blocks in `components/`.
- Keep forms simple and accessible with clear validation messaging.

## Summary

This module keeps the authentication journey isolated, predictable, and easy to maintain.
