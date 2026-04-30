# PulseX Frontend 🚀

PulseX Frontend is the web interface for a heart-care platform built with React, organized clearly around three core user roles:

- Admin
- Doctor
- Patient

The current structure is designed to support fast development, clean organization, and long-term scalability as features grow.

## Quick Highlights ✨

- Feature-first architecture
- Role-oriented route grouping
- Tailwind CSS-based UI system
- Lazy-loaded pages for better performance
- Clear separation between layouts, pages, and reusable components

## Tech Stack

- React 19
- Vite 7
- React Router
- Tailwind CSS 4
- Axios
- Formik + Yup
- Framer Motion
- Recharts
- Flowbite React
- Swiper
- React Icons

## Project Structure (High-Level)

```text
Frontend/
├─ public/
├─ src/
├─ templates/
├─ index.html
├─ package.json
├─ vite.config.js
├─ eslint.config.js
└─ vercel.json
```

## src Structure (Main Lines Only)

```text
src/
├─ App.jsx
├─ main.jsx
├─ index.css
├─ assets/
├─ Button/
├─ components/
├─ features/
├─ hooks/
├─ pages/
├─ PatientHooks/
├─ schemas/
└─ store/
```

## Feature Domains

Inside `src/features/`, the main domains are:

- `admin/` for platform administration
- `auth/` for login, registration, and password recovery
- `doctor/` for doctor-facing screens and workflows
- `patient/` for patient-facing modules and journeys
- `home/` for public landing/home sections

## Routing Overview

- `/` public home page
- `/login`, `/register`, `/forgot-password` authentication routes
- `/admin/*` admin routes
- `/doctor/*` doctor routes
- `/patient/*` patient routes

## Run Locally

```bash
npm install
npm run dev
```

Default URL:

- http://localhost:5173

## Scripts

- `npm run dev` start the development server
- `npm run build` build the production bundle
- `npm run preview` preview the production build locally
- `npm run lint` run ESLint checks

## Deployment

- Live: https://versionpulsex1.vercel.app/
- Platform: Vercel

## Summary 💙

This project follows a clear and practical structure that helps teams move quickly while keeping the codebase organized and easy to scale.
