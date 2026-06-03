# PulseX — AI-Powered Cardiovascular Health Platform

PulseX is a graduation-project medical platform that connects patients with cardiologists, offering AI-powered heart-risk assessment, real-time consultations, e-prescriptions, and remote health monitoring.

> **Live demo:** https://pulsex-ten.vercel.app

---

## 🧱 Architecture

PulseX is built from three independent services that run together:

| Service | Tech | Local Port |
|---|---|---|
| **Frontend** | React 18 + Vite + Tailwind CSS | 5173 |
| **Backend API** | ASP.NET Core 8 (C#) | 5245 |
| **AI Service** | Python FastAPI + PyTorch | 8001 |

```
┌──────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Frontend   │ ───► │   Backend API    │ ───► │   AI Service    │
│  React/Vite  │      │  ASP.NET Core 8  │      │  FastAPI/PyTorch│
└──────────────┘      └──────────────────┘      └─────────────────┘
       │                       │                         │
   (Vercel)              (SQL Server)            (DenseNet121 + ML)
```

---

## ✨ Features

### 👤 Patient
- Self-registration with email OTP verification
- Personal dashboard with vitals, weekly trends, and AI risk gauge
- Browse and filter doctors (specialty, rating, price)
- Book appointments with a real-time slot calendar (booked slots flagged)
- Cash or credit-card payment flow
- Real-time chat & video calls with doctors
- **AI Chest X-Ray Analysis** (DenseNet121 cardiomegaly classifier)
- **Heart Risk Assessment** (Framingham ML model)
- AI health chatbot (EKO)
- E-prescriptions, medical records, QR code for emergency record sharing
- Write & share community health stories

### 🩺 Doctor
- Dashboard with today's appointments, critical patients, and weekly charts
- Weekly recurring + single-slot schedule management
- Patient list, profiles, vitals, and medical records
- E-prescription builder (medications, clinical notes, lab orders, PDF export)
- Real-time messaging and video calls
- Community stories feed

### 🛡️ Admin
- Doctor & patient management (CRUD + Excel export)
- Story moderation
- Activity logs and reports
- Profile & settings

---

## 🛠️ Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, React Router v6, Axios, `@microsoft/signalr`, React Hook Form + Yup.

**Backend:** ASP.NET Core 8, Entity Framework Core + SQL Server, AutoMapper, SignalR (real-time chat & WebRTC signaling), JWT Bearer auth. Three-project clean architecture: `PulseX.API` / `PulseX.Core` / `PulseX.Data`.

**AI Service:** Python FastAPI, PyTorch (DenseNet121 chest X-ray, AUC ≈ 0.86), scikit-learn (Framingham 10-year CHD risk), custom medical chatbot.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- .NET 8 SDK
- Python 3.10+
- SQL Server (LocalDB / Express / full)

### 1. Backend API
```bash
cd backend/dotnet/PulseX.API
# Copy the template and fill in your own values
cp appsettings.example.json appsettings.json
dotnet ef database update          # apply migrations
dotnet run
```

### 2. Frontend
```bash
cd Frontend
cp .env.example .env               # set VITE_API_BASE_URL + VITE_AI_BASE_URL
npm install
npm run dev
```

### 3. AI Service
```bash
cd backend/ai-service
python -m venv .venv
.venv\Scripts\activate             # (Windows)  |  source .venv/bin/activate (Unix)
pip install -r requirements.txt
python main.py
```

---

## 🔐 Configuration & Secrets

**No real credentials are committed to this repository.** All secret-bearing files are templated:

| File | Purpose |
|---|---|
| `backend/dotnet/PulseX.API/appsettings.example.json` | Template — copy to `appsettings.json` and fill in |
| `appsettings.Production.json` | Real production secrets (git-ignored, never committed) |
| `Frontend/.env` | API + AI base URLs |

Required configuration values:
- **ConnectionStrings:DefaultConnection** — your SQL Server connection
- **Jwt:Key** — a random secret string (≥ 32 chars)
- **Email** — SMTP host / username / app-password for OTP emails
- **AiService:BaseUrl** — URL of the running AI service

---

## 🔑 Roles

| Role | Access |
|---|---|
| **Patient** | Self-registers with OTP. Books appointments, uses AI tools, manages records. |
| **Doctor** | Created by admin. Manages schedule, patients, prescriptions, consultations. |
| **Admin** | Full platform management and moderation. |

JWT-based authentication with role-based route protection on both frontend and backend.

---

## 🤖 AI Models

| Model | Task | Metric |
|---|---|---|
| `cardiac_binary_model.pth` | Chest X-ray cardiomegaly classification (DenseNet121) | AUC ≈ 0.86 |
| `recommendation_model.pkl` | Framingham 10-year CHD risk prediction | — |

---

## 📦 Deployment

| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend API | IIS / Windows hosting |
| AI Service | Hugging Face Spaces (port 7860) |

---

## 📝 License

Developed as a graduation project for educational purposes.

---

**Built with ❤️ for the PulseX Graduation Project**
