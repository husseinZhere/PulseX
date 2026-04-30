# PulseX — Integrated Project Setup & Run Guide

PulseX is a heart-care platform with 3 parts that are now wired together end-to-end:

| Part | Tech | Folder | Default Port |
|---|---|---|---|
| Frontend | React 19 + Vite + Tailwind + Axios + SignalR | `Frontend/` | **5173** |
| Backend API | ASP.NET Core 8 + EF Core + SignalR + JWT | `backend/dotnet/` | **5245** (http) / **7152** (https) |
| AI Service | Python FastAPI + PyTorch + scikit-learn | `backend/ai-service/` | **8001** |

---

## Prerequisites

- **.NET 8 SDK** (`dotnet --version` should print `8.x`)
- **Node.js ≥ 20** (`node --version`)
- **Python ≥ 3.10** (`python --version`)
- **SQL Server** (LocalDB, Express, or full) reachable from `appsettings.json`
- (Windows) PowerShell 5+ or Git Bash

---

## 1) Backend (.NET) — First Run

```bash
cd backend/dotnet/PulseX.API

# edit appsettings.json and update ConnectionStrings:DefaultConnection
# to your SQL Server instance. Example:
#   "Server=localhost;Database=PulseXDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true"

# apply database migrations
dotnet ef database update --project ../PulseX.Data --startup-project .

# run
dotnet run
```

- Swagger: <http://localhost:5245/swagger>
- **Default admin account is auto-seeded:** `admin@pulsex.com` / `Admin@123`
- CORS is already open to `http://localhost:5173` and `http://localhost:3000`
- The `AiService:BaseUrl` in `appsettings.json` must match where the Python service runs (default `http://localhost:8001`)

### What's registered

- `HttpClient<AiServiceClient>` — bridges to the FastAPI service
- `VideoCallHub` mapped at `/hubs/videocall` (SignalR, auth via `access_token` query string)
- SMTP email for password reset (already configured to a Gmail app password in `appsettings.json`)

---

## 2) AI Service (Python FastAPI)

```bash
cd backend/ai-service

# create venv (first time only)
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux

pip install -r requirements.txt

# optional: set GEMINI_API_KEY in .env for smarter chatbot responses
cp .env.example .env

# run
python main.py
```

- API: <http://localhost:8001>
- Health: <http://localhost:8001/health>
- Endpoints (consumed by .NET `AiProxyController`):
  - `POST /api/xray/analyze` — binary Normal/Abnormal classifier (or cardiac multi-label if weights present)
  - `POST /api/recommendation` — Framingham-based 10-year CHD risk
  - `POST /api/chat` — heart-health chatbot with medical-intent guard
  - `POST /api/ecg/upload` — ECG file storage

**First run models**: the service tries `./models/xray_binary_model.pth` and `./models/cardiac_xray_model.pth`. If those aren't present, `python setup_models.py` (inside `backend/ai-service/`) downloads them.

---

## 3) Frontend (React + Vite)

```bash
cd Frontend

cp .env.example .env     # already created; adjust if ports differ

npm install
npm run dev
```

App opens on <http://localhost:5173>.

### Frontend `.env`

```env
VITE_API_BASE_URL=http://localhost:5245
VITE_AI_BASE_URL=http://localhost:8001
```

- `VITE_API_BASE_URL` → .NET backend (used for auth, data, file uploads, SignalR)
- `VITE_AI_BASE_URL` → FastAPI AI service (called directly by the chatbot + X-Ray analyze flow). You can also route all AI calls through the .NET proxy under `/api/Ai/*` if you prefer.

---

## How the 3 parts are wired

### Frontend ↔ .NET
- `src/utils/api.js` creates an axios instance with the JWT attached automatically from localStorage; 401s auto-logout.
- `src/context/AuthContext.jsx` handles login/register/logout and normalizes the `LoginResponseDto` (so both `full_name` and `first_name`/`last_name` are available).
- `src/components/ProtectedRoute/ProtectedRoute.jsx` gates `/admin`, `/patient`, `/doctor` by role.
- Every domain has a service file under `src/services/` that matches the backend controller (admin, auth, doctor, appointment, message, prescription, story, report, schedule, health, medicalRecord, notification, patient, video call, risk, AI, chatbot).

### .NET ↔ FastAPI
- `backend/dotnet/PulseX.API/Services/AiServiceClient.cs` is a typed `HttpClient` wrapper; endpoint *names* differ between the two stacks and this class is the translator:
  - `.NET` `/api/Ai/xray/analyze` → `FastAPI` `/api/xray/analyze`
  - `.NET` `/api/Ai/recommendation` → `FastAPI` `/api/recommendation`
  - `.NET` `/api/Ai/chat` → `FastAPI` `/api/chat`
- `AiProxyController` exposes these proxied endpoints with JWT auth so the browser never hits FastAPI directly if you don't want it to.
- The frontend also hits FastAPI **directly** from `chatbotService.chatViaAiDirect` and `aiService.analyzeXRay` for low-latency. Pick one path — both work.

### Video Call (SignalR + WebRTC)
- Backend: `Hubs/VideoCallHub.cs` already handles `JoinSession`, `SendOffer`, `SendAnswer`, `SendIceCandidate`, `ToggleVideo`, `ToggleAudio`, `EndCall`, `ReportConnectionQuality`.
- Frontend: `src/hooks/useVideoCall.js` is a SignalR client + `RTCPeerConnection` wrapper that:
  - Connects with the JWT from `access_token` query
  - Requests camera/mic
  - Creates/receives SDP Offer/Answer and ICE candidates
  - Renders incoming-call UI with Accept
  - Cleans up on end
- `features/patient/components/VideoCall/VideoCallContainer.jsx` and `features/doctor/components/VideoCall/VideoCallContainer.jsx` both use this hook. Pass `appointmentId` and `asInitiator` props.

---

## Run all three, end-to-end

1. Start **SQL Server**.
2. Terminal A:
   ```bash
   cd backend/dotnet/PulseX.API
   dotnet run
   ```
3. Terminal B:
   ```bash
   cd backend/ai-service
   .venv\Scripts\activate    # or source .venv/bin/activate
   python main.py
   ```
4. Terminal C:
   ```bash
   cd Frontend
   npm run dev
   ```
5. Open <http://localhost:5173>.
6. Login as admin with `admin@pulsex.com` / `Admin@123`.
7. Create a doctor (admin → Doctor Management → Add Doctor).
8. Register a patient (landing page → Register). Patient self-registration is enabled.
9. As Patient, complete the Health Survey, Heart Risk Assessment (upload an X-Ray), book an appointment with the doctor you created.
10. As Doctor, accept the appointment, chat, send a prescription, start a Video Call.

---

## Role scope (current)

| Role | Can do |
|---|---|
| **Admin** | Create/delete doctors and patients, edit their profiles, moderate stories and comments, view reports and activity logs, settings & profile (password change). **Not** activate/deactivate accounts, **not** approve doctors — by design. |
| **Doctor** | View dashboard, view patients, view patient medical records, manage schedule, respond to messages, create prescriptions, join/start video calls, write/view stories, edit own profile directly (no admin approval). |
| **Patient** | Register, browse doctors, book + pay for appointments, upload ECG/X-Ray medical records, generate QR for records (doctor-login required to view), view appointments, chat with doctors during chat window, get AI-powered Heart Risk + Chatbot, view prescriptions, manage profile & health data, share stories with the community. |

---

## Production deploy notes

- Move the JWT key and SMTP password out of `appsettings.json` into environment variables or a secrets store.
- Set `AiService:BaseUrl` to the production URL of the FastAPI service (and restrict CORS accordingly on the Python side).
- On HTTPS, the SignalR hub also runs over WSS with the same `access_token` query param.
- Swap the Gmail SMTP sender for SendGrid or AWS SES for deliverability.
- The default admin password **must** be changed on first deploy.

---

## Build/verify (no runtime)

```bash
# Frontend typecheck + production build
cd Frontend
npm run build

# Backend compile check
cd ../backend/dotnet
dotnet build
```

Both should complete without errors. If you hit a missing package on the first run:
```bash
cd Frontend && npm install
cd backend/dotnet && dotnet restore
cd backend/ai-service && pip install -r requirements.txt
```
