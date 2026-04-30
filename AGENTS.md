# PulseX — Project Reference for Codex

PulseX is a graduation-project medical platform connecting patients and doctors.
It has three main codebases that run together:

| Codebase | Tech | Default Port |
|---|---|---|
| Frontend | React 18 + Vite + Tailwind | 5173 |
| Backend API | ASP.NET Core 8 (C#) | 5245 |
| AI Service | Python FastAPI | 8001 |

---

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, React Router v6 (`createBrowserRouter`), Axios, `@microsoft/signalr`, React Hook Form + Yup, Flowbite React.

**Backend (.NET):** ASP.NET Core 8, Entity Framework Core + SQL Server, AutoMapper, SignalR, JWT Bearer auth. Three-project solution: `PulseX.API` / `PulseX.Core` / `PulseX.Data`.

**AI Service:** Python FastAPI, scikit-learn (recommendation model), TensorFlow/Keras (X-ray CNN), custom chatbot service.

---

## Key Architecture Rules

- **Session storage (not localStorage):** `getToken()`, `setSession()`, `clearSession()`, `getStoredUser()` in `Frontend/src/utils/api.js` all use `sessionStorage`. This is intentional — each browser tab has its own isolated session so doctor and patient can be tested simultaneously.
- **Role-based routing:** `ProtectedRoute` in `Frontend/src/components/ProtectedRoute/ProtectedRoute.jsx` reads role from `getStoredUser()` and redirects to the correct dashboard on refresh.
- **JWT role claim type:** `"http://schemas.microsoft.com/ws/2008/06/identity/claims/role"` — set as `RoleClaimType` in `Program.cs`.
- **Egypt timezone:** `AppointmentDate` is stored as Egypt local time (Unspecified DateTime kind, UTC+2). Backend uses `EgyptNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, EgyptTz)` for comparisons. Do NOT call `ConvertTimeFromUtc` on `AppointmentDate` itself — it is already local.
- **Chat activation rules:** Credit card → `ChatExpiryDate = UtcNow + 24h` set at booking. Cash → `ChatExpiryDate = null`; chat auto-opens during appointment's 24 h window. Doctor can manually activate via `ActivateChatAsync` (sets `ChatExpiryDate = UtcNow + 24h`).
- **Real-time:** `VideoCallHub` (`/hubs/videocall`) handles WebRTC signaling. `ChatHub` (`/hubs/chat`) handles real-time messages, presence (`UserOnline`/`UserOffline`), and video call ring (`IncomingCall` / `NotifyIncomingCall`).
- **File uploads:** Served from `ContentRootPath/uploads/` at `/uploads/**`. Stored in subfolders: `doctors/`, `patients/`, `medical-records/`, `story-covers/`, `chat/`, `profile-pictures/`.
- **AI proxy:** `AiProxyController` / `AiServiceClient` bridge the .NET API to the Python FastAPI on port 8001.

---

## Full Directory Tree

```
PulseX/
├── AGENTS.md
├── README.md
├── SETUP_AND_RUN.md
├── OVERVIEW.txt
├── QUICK_START.txt
├── MIGRATION_COMMANDS.txt
├── MEDICAL_RECORDS_SUMMARY.txt
├── V2_UPGRADE_SUMMARY.txt
├── DOCTOR_PROFILE_MIGRATION.sql
├── FIX_PATIENT_ID.sql
├── .gitignore
├── .gitattributes
│
├── docs/
│   ├── api/
│   │   ├── API_DOCUMENTATION.md
│   │   ├── API_TESTING_GUIDE.md
│   │   └── SWAGGER_FILE_UPLOAD_FIX.md
│   ├── backend/
│   │   ├── README.md
│   │   ├── README_AR.md
│   │   ├── BACKEND_ORGANIZATION.md
│   │   ├── PASSWORD_RESET_V2_GUIDE.md
│   │   └── ai-service/
│   │       ├── README.md
│   │       ├── QUICKSTART.md
│   │       ├── SUMMARY.md
│   │       ├── UPDATE_SUMMARY.md
│   │       ├── CHATBOT_README.md
│   │       ├── SECURITY.md
│   │       ├── CHECKLIST.md
│   │       ├── IMPLEMENTATION_SUMMARY.md
│   │       └── DOTNET_INTEGRATION.md
│   ├── features/
│   │   ├── DOCTOR_BOOKING_COMPLETE.md
│   │   ├── DOCTOR_BOOKING_CHAT_SYSTEM.md
│   │   ├── DOCTOR_MEDICAL_DATA_ENTRY.md
│   │   ├── CHAT_SYSTEM_COMPLETE.md
│   │   ├── MEDICAL_RECORDS_COMPLETE_GUIDE.md
│   │   ├── MEDICAL_RECORDS_GUIDE.md
│   │   ├── E_PRESCRIPTION_COMPLETE_GUIDE.md
│   │   ├── E_PRESCRIPTION_GUIDE.md
│   │   ├── PRESCRIPTION_DETAILS_COMPLETE_GUIDE.md
│   │   ├── PRESCRIPTION_HISTORY_COMPLETE_GUIDE.md
│   │   ├── PATIENT_HEALTH_INFO_COMPLETE_GUIDE.md
│   │   ├── PATIENT_PROFILE_SETTINGS_GUIDE.md
│   │   ├── CHANGE_PASSWORD_COMPLETE_GUIDE.md
│   │   ├── LOGOUT_COMPLETE_FINAL.md
│   │   └── REGISTRATION_NOTIFICATIONS_SYSTEM.md
│   ├── fixes/
│   │   ├── MEDICAL_RECORDS_PATIENT_FIX.md
│   │   ├── NAME_HANDLING_COMPLETE_SOLUTION.md
│   │   ├── PDF_GENERATION_FIX.md
│   │   ├── RISK_ASSESSMENT_FIX.md
│   │   └── RISK_ASSESSMENT_MAPPING_FIX.md
│   ├── guides/
│   │   ├── FAQ.md
│   │   ├── FILE_LIST.md
│   │   ├── QUICKSTART.md
│   │   ├── QUICK_START_GUIDE.md
│   │   ├── WORKFLOW_GUIDE.md
│   │   └── LOGOUT_TESTING_GUIDE.md
│   ├── setup/
│   │   ├── FORGOT_PASSWORD_SETUP.md
│   │   ├── IMPLEMENTATION_CHECKLIST.md
│   │   └── SETUP_SUMMARY.md
│   ├── summaries/
│   │   ├── PROJECT_SUMMARY.md
│   │   ├── V2_COMPLETE_SUMMARY.md
│   │   ├── V1_VS_V2_COMPARISON.md
│   │   ├── IMPLEMENTATION_SUMMARY.md
│   │   ├── BUILD_FIXES_SUMMARY.md
│   │   ├── CHAT_SYSTEM_SUMMARY.md
│   │   ├── DASHBOARD_RISK_IMPLEMENTATION.md
│   │   ├── LOGOUT_SYSTEM_IMPLEMENTATION.md
│   │   ├── PRESCRIPTION_DETAILS_SUMMARY.md
│   │   ├── PRESCRIPTION_HISTORY_SUMMARY.md
│   │   ├── REGISTER_DASHBOARD_INTEGRATION.md
│   │   └── REGISTRATION_NOTIFICATIONS_SUMMARY.md
│   └── translations/
│       ├── README_AR.md
│       ├── FORGOT_PASSWORD_README_AR.md
│       ├── CHANGE_PASSWORD_MODAL_AR.md
│       ├── LOGOUT_SUMMARY_AR.md
│       ├── NAME_HANDLING_SOLUTION_AR.md
│       ├── PATIENT_HEALTH_INFO_SUMMARY_AR.md
│       ├── PATIENT_PROFILE_SUMMARY_AR.md
│       └── E_PRESCRIPTION_SUMMARY_AR.md
│
├── Frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── eslint.config.js
│   ├── package.json
│   ├── package-lock.json
│   ├── vercel.json
│   ├── generate-react-cli.json
│   ├── fix-runner.cjs
│   ├── fix-runner-v2.cjs
│   ├── fix.js
│   ├── undo.cjs
│   ├── README.md
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── .flowbite-react/
│   │   ├── class-list.json
│   │   ├── config.json
│   │   ├── init.tsx
│   │   └── .gitignore
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── README.md
│       │
│       ├── assets/
│       │   ├── Images/
│       │   │   ├── Login.svg
│       │   │   ├── Notfound.png
│       │   │   ├── Qrcodepatiant.svg
│       │   │   ├── doctor-profile.png
│       │   │   ├── f1.png
│       │   │   ├── f2.png
│       │   │   ├── f3.png
│       │   │   ├── f4.png
│       │   │   └── f5.png
│       │   └── logo/
│       │       └── logo.svg
│       │
│       ├── Button/
│       │   └── Button.jsx
│       │
│       ├── components/
│       │   ├── Container/
│       │   │   └── Container.jsx
│       │   ├── ErrorBoundary/
│       │   │   └── ErrorBoundary.jsx
│       │   ├── Footer/
│       │   │   └── Footer.jsx
│       │   ├── Layout/
│       │   │   └── Layout.jsx
│       │   ├── Navbar/
│       │   │   └── Navbar.jsx
│       │   ├── ProtectedRoute/
│       │   │   └── ProtectedRoute.jsx
│       │   ├── Toast/
│       │   │   └── Toast.jsx
│       │   └── index.js
│       │
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── ThemeContext.jsx
│       │
│       ├── hooks/
│       │   ├── index.js
│       │   ├── useChat.js
│       │   └── useVideoCall.js
│       │
│       ├── pages/
│       │   ├── DoctorDashboard/
│       │   │   └── DoctorDashboard.jsx
│       │   ├── ForgotPassword/
│       │   │   └── ForgotPassword.jsx
│       │   ├── Home/
│       │   │   └── Home.jsx
│       │   ├── Login/
│       │   │   └── Login.jsx
│       │   └── Regester/
│       │       └── Regester.jsx
│       │
│       ├── PatientHooks/
│       │   └── usePatientData.js
│       │
│       ├── schemas/
│       │   ├── authSchema.jsx
│       │   ├── forgotPasswordSchema.jsx
│       │   └── registerSchema.jsx
│       │
│       ├── services/
│       │   ├── adminService.js
│       │   ├── aiService.js
│       │   ├── appointmentService.js
│       │   ├── authService.js
│       │   ├── chatbotService.js
│       │   ├── doctorService.js
│       │   ├── healthService.js
│       │   ├── medicalRecordService.js
│       │   ├── messageService.js
│       │   ├── notificationService.js
│       │   ├── patientService.js
│       │   ├── prescriptionService.js
│       │   ├── reportService.js
│       │   ├── riskAssessmentService.js
│       │   ├── scheduleService.js
│       │   ├── storyService.js
│       │   └── videoCallService.js
│       │
│       ├── store/
│       │   └── index.js
│       │
│       ├── utils/
│       │   ├── api.js
│       │   └── profilePhotoStorage.js
│       │
│       └── features/
│           ├── README.md
│           │
│           ├── admin/
│           │   ├── README.md
│           │   ├── components/
│           │   │   ├── ActivityLogs/
│           │   │   │   ├── List/
│           │   │   │   │   └── ActivityLogsView.jsx
│           │   │   │   └── shared/
│           │   │   │       └── activityLogsMockData.js
│           │   │   ├── AdminHeader/
│           │   │   │   └── AdminHeader.jsx
│           │   │   ├── AdminLayout/
│           │   │   │   └── AdminLayout.jsx
│           │   │   ├── ConfirmModal/
│           │   │   │   └── ConfirmModal.jsx
│           │   │   ├── Container/
│           │   │   │   └── Container.jsx
│           │   │   ├── Doctor/
│           │   │   │   ├── AddDoctorBtn/
│           │   │   │   │   └── AddDoctorBtn.jsx
│           │   │   │   ├── DataTable/
│           │   │   │   │   └── DataTable.jsx
│           │   │   │   ├── DoctorManagement/
│           │   │   │   │   ├── DoctorManagement.jsx
│           │   │   │   │   ├── doctorsMockData.js
│           │   │   │   │   └── exportDoctorsToExcel.js
│           │   │   │   ├── EditDoctor/
│           │   │   │   │   ├── EditDoctor.jsx
│           │   │   │   │   └── doctorsMockById.js
│           │   │   │   └── EditForm/
│           │   │   │       └── EditForm.jsx
│           │   │   ├── DoctorForm/
│           │   │   │   └── shared/
│           │   │   │       ├── FieldError.jsx
│           │   │   │       ├── InputField.jsx
│           │   │   │       └── doctorValidationSchema.js
│           │   │   ├── EmptyState.jsx/
│           │   │   │   └── EmptyState.jsx
│           │   │   ├── NotFound/
│           │   │   │   └── NotFound.jsx
│           │   │   ├── PatientForm/
│           │   │   │   └── shared/
│           │   │   │       ├── FieldError.jsx
│           │   │   │       ├── InputField.jsx
│           │   │   │       └── patientValidationSchema.js
│           │   │   ├── Patients/
│           │   │   │   ├── AddPatientBtn/
│           │   │   │   │   └── AddPatientBtn.jsx
│           │   │   │   ├── EditPatient/
│           │   │   │   │   ├── EditPatient.jsx
│           │   │   │   │   └── patientMockById.js
│           │   │   │   └── PatientManagement/
│           │   │   │       ├── PatientManagement.jsx
│           │   │   │       ├── PatientsIcon.jsx
│           │   │   │       ├── exportPatientsToExcel.js
│           │   │   │       └── patientsMockData.js
│           │   │   ├── Reports/
│           │   │   │   ├── List/
│           │   │   │   │   └── ReportsManagementView.jsx
│           │   │   │   └── shared/
│           │   │   │       └── reportsMockData.js
│           │   │   ├── SettingsProfile/
│           │   │   │   └── Profile/
│           │   │   │       ├── PasswordChangeModal.jsx
│           │   │   │       └── SettingsProfileView.jsx
│           │   │   ├── Sidebar/
│           │   │   │   └── Sidebar.jsx
│           │   │   ├── SuccessPopup/
│           │   │   │   └── SuccessPopup.jsx
│           │   │   ├── ToastNotification/
│           │   │   │   └── ToastNotification.jsx
│           │   │   └── shared/
│           │   │       ├── EmptyState/
│           │   │       │   └── EmptyState.jsx
│           │   │       ├── GenderToggle/
│           │   │       │   └── GenderToggle.jsx
│           │   │       └── index.js
│           │   └── pages/
│           │       ├── ActivityLogs/
│           │       │   ├── List/
│           │       │   │   └── ActivityLogs.jsx
│           │       │   └── shared/
│           │       │       └── seo.js
│           │       ├── Dashboard/
│           │       │   ├── AdminDashboard.css
│           │       │   ├── AdminDashboard.jsx
│           │       │   └── components/
│           │       │       ├── Skeleton.jsx
│           │       │       └── StatCard.jsx
│           │       ├── Doctors/
│           │       │   ├── Create/
│           │       │   │   └── AddDoctorBtn.jsx
│           │       │   ├── Edit/
│           │       │   │   └── EditDoctor.jsx
│           │       │   └── List/
│           │       │       └── DoctorManagement.jsx
│           │       ├── Patients/
│           │       │   ├── Create/
│           │       │   │   └── AddPatientBtn.jsx
│           │       │   ├── Edit/
│           │       │   │   └── EditPatient.jsx
│           │       │   └── List/
│           │       │       └── PatientManagement.jsx
│           │       ├── Reports/
│           │       │   ├── List/
│           │       │   │   └── ReportsManagement.jsx
│           │       │   └── shared/
│           │       │       └── seo.js
│           │       ├── SettingsProfile/
│           │       │   ├── Profile/
│           │       │   │   └── SettingsProfile.jsx
│           │       │   └── shared/
│           │       │       └── seo.js
│           │       └── Stories/
│           │           ├── Comments/
│           │           │   └── StoryAllComments.jsx
│           │           ├── Details/
│           │           │   └── StoryDetails.jsx
│           │           ├── List/
│           │           │   └── StoriesManagement.jsx
│           │           └── shared/
│           │               ├── seo.js
│           │               └── storiesMockData.js
│           │
│           ├── auth/
│           │   ├── README.md
│           │   ├── components/
│           │   │   └── ForgotPassWrapper/
│           │   │       └── ForgotPassWrapper.jsx
│           │   └── pages/
│           │       ├── ForgotPassword/
│           │       │   └── ForgotPassword.jsx
│           │       ├── Login/
│           │       │   └── Login.jsx
│           │       └── Register/
│           │           └── Register.jsx
│           │
│           ├── doctor/
│           │   ├── README.md
│           │   ├── data/
│           │   │   └── patientsData.js
│           │   ├── components/
│           │   │   ├── AllComments/
│           │   │   │   ├── AddCommentSection.jsx
│           │   │   │   ├── AllCommentsHeader.jsx
│           │   │   │   ├── Avatar.jsx
│           │   │   │   ├── CommentsList.jsx
│           │   │   │   └── ReportModal.jsx
│           │   │   ├── Appointments/
│           │   │   │   ├── AppointmentsHeader.jsx
│           │   │   │   ├── AppointmentsStats.jsx
│           │   │   │   ├── AppointmentsTabs.jsx
│           │   │   │   └── AppointmentsTimeline.jsx
│           │   │   ├── Dashboard/
│           │   │   │   ├── CriticalPatientsCard.jsx
│           │   │   │   ├── DashboardHero.jsx
│           │   │   │   ├── PatientMessagesCard.jsx
│           │   │   │   ├── TodayAppointmentsCard.jsx
│           │   │   │   └── WeeklyOverviewCard.jsx
│           │   │   ├── DoctorHeader/
│           │   │   │   └── DoctorHeader.jsx
│           │   │   ├── DoctorLayout/
│           │   │   │   └── DoctorLayout.jsx
│           │   │   ├── DoctorRatingModal/
│           │   │   │   └── DoctorRatingModal.jsx
│           │   │   ├── DoctorSidebar/
│           │   │   │   └── DoctorSidebar.jsx
│           │   │   ├── Messages/
│           │   │   │   ├── ChatHeader.jsx
│           │   │   │   ├── MessageInputBar.jsx
│           │   │   │   ├── MessagesList.jsx
│           │   │   │   └── MessagesSidebar.jsx
│           │   │   ├── NotFound/
│           │   │   │   └── NotFound.jsx
│           │   │   ├── Patients/
│           │   │   │   ├── HealthMeasurementsSection.jsx
│           │   │   │   ├── MedicalMetricsSection.jsx
│           │   │   │   ├── PatientInfoCompactCard.jsx
│           │   │   │   ├── PatientListFilters.jsx
│           │   │   │   ├── PatientListHeader.jsx
│           │   │   │   ├── PatientListTable.jsx
│           │   │   │   ├── PatientProfileHero.jsx
│           │   │   │   ├── PatientQrSection.jsx
│           │   │   │   ├── PatientRecordsSection.jsx
│           │   │   │   └── PatientVitalsSection.jsx
│           │   │   ├── Prescription/
│           │   │   │   ├── ClinicalNotesSection.jsx
│           │   │   │   ├── LabRadiologySection.jsx
│           │   │   │   ├── MedicationEntrySection.jsx
│           │   │   │   ├── PatientInformationSection.jsx
│           │   │   │   ├── PrescriptionConfirmModal.jsx
│           │   │   │   ├── PrescriptionHeader.jsx
│           │   │   │   └── PrescriptionSuccessToast.jsx
│           │   │   ├── ScheduleSettings/
│           │   │   │   ├── AvailabilityCalendar.jsx
│           │   │   │   ├── ScheduleSettingsHeader.jsx
│           │   │   │   ├── TodaySlotsPanel.jsx
│           │   │   │   └── WeeklyRecurringSchedule.jsx
│           │   │   ├── SettingsProfile/
│           │   │   │   ├── AboutSection.jsx
│           │   │   │   ├── AccountSettingsSection.jsx
│           │   │   │   ├── PasswordChangeModal.jsx
│           │   │   │   ├── PersonalInfoSection.jsx
│           │   │   │   ├── ProfessionalExperienceSection.jsx
│           │   │   │   ├── SettingsHeader.jsx
│           │   │   │   └── StatusToast.jsx
│           │   │   ├── Stories/
│           │   │   │   ├── StoriesFooter.jsx
│           │   │   │   ├── StoriesGrid.jsx
│           │   │   │   └── StoriesHeader.jsx
│           │   │   ├── StoryDetails/
│           │   │   │   ├── AddCommentBox.jsx
│           │   │   │   ├── Avatar.jsx
│           │   │   │   ├── CommentsPreview.jsx
│           │   │   │   ├── EngagementBar.jsx
│           │   │   │   ├── RelatedStories.jsx
│           │   │   │   ├── ReportModal.jsx
│           │   │   │   ├── StoryArticle.jsx
│           │   │   │   ├── StoryAuthorSection.jsx
│           │   │   │   ├── StoryDetailsFooter.jsx
│           │   │   │   └── StoryDetailsHeader.jsx
│           │   │   └── VideoCall/
│           │   │       ├── FloatingCallWindow.jsx
│           │   │       ├── FullVideoScreen.jsx
│           │   │       ├── MinimizeModal.jsx
│           │   │       └── VideoCallContainer.jsx
│           │   └── pages/
│           │       ├── AddMedicalRecords/
│           │       │   └── AddMedicalRecords.jsx
│           │       ├── AllComments/
│           │       │   └── AllComments.jsx
│           │       ├── Appointments/
│           │       │   └── Appointments.jsx
│           │       ├── DoctorDashboard/
│           │       │   └── DoctorDashboard.jsx
│           │       ├── DoctorMessages/
│           │       │   └── DoctorMessages.jsx
│           │       ├── PatientDetails/
│           │       │   └── PatientDetails.jsx
│           │       ├── Patients/
│           │       │   └── Patients.jsx
│           │       ├── Prescription/
│           │       │   └── Prescription.jsx
│           │       ├── ScheduleSettings/
│           │       │   └── ScheduleSettings.jsx
│           │       ├── SettingsProfile/
│           │       │   └── SettingsProfile.jsx
│           │       ├── Stories/
│           │       │   └── Stories.jsx
│           │       └── StoryDetails/
│           │           └── StoryDetails.jsx
│           │
│           ├── home/
│           │   ├── README.md
│           │   ├── components/
│           │   │   ├── CustomSlider/
│           │   │   │   └── CustomSlider.jsx
│           │   │   ├── Doctors/
│           │   │   │   └── Doctors.jsx
│           │   │   ├── Features/
│           │   │   │   └── Features.jsx
│           │   │   ├── Hero/
│           │   │   │   ├── Hero.css
│           │   │   │   └── Hero.jsx
│           │   │   ├── HomeSectionWrapper/
│           │   │   │   └── HomeSectionWrapper.jsx
│           │   │   ├── HomeWrapper/
│           │   │   │   └── HomeWrapper.jsx
│           │   │   ├── JourneyTimeline/
│           │   │   │   └── JourneyTimeline.jsx
│           │   │   ├── PatientStories/
│           │   │   │   └── PatientStories.jsx
│           │   │   ├── SectionHeader/
│           │   │   │   └── SectionHeader.jsx
│           │   │   ├── SectionWrapper/
│           │   │   │   └── SectionWrapper.jsx
│           │   │   └── Stories/
│           │   │       └── Stories.jsx
│           │   └── pages/
│           │       └── Home/
│           │           └── Home.jsx
│           │
│           ├── patient/
│           │   ├── README.md
│           │   ├── hooks/
│           │   │   └── usePatientData.js
│           │   ├── components/
│           │   │   ├── AllComments/
│           │   │   │   ├── AddCommentSection.jsx
│           │   │   │   ├── AllCommentsHeader.jsx
│           │   │   │   ├── Avatar.jsx
│           │   │   │   ├── CommentsList.jsx
│           │   │   │   └── ReportModal.jsx
│           │   │   ├── Appointments/
│           │   │   │   ├── AppointmentsHeader.jsx
│           │   │   │   ├── AppointmentsList.jsx
│           │   │   │   ├── AppointmentsStats.jsx
│           │   │   │   └── AppointmentsTabs.jsx
│           │   │   ├── Booking/
│           │   │   │   ├── BookingCalendar.jsx
│           │   │   │   ├── BookingSidebar.jsx
│           │   │   │   └── BookingTimeSlots.jsx
│           │   │   ├── DoctorList/
│           │   │   │   ├── DoctorCard.jsx
│           │   │   │   ├── DoctorFilters.jsx
│           │   │   │   ├── DoctorGrid.jsx
│           │   │   │   ├── DoctorListHeader.jsx
│           │   │   │   ├── DoctorListStats.jsx
│           │   │   │   └── DoctorPagination.jsx
│           │   │   ├── DoctorProfile/
│           │   │   │   ├── DoctorAbout.jsx
│           │   │   │   ├── DoctorExperience.jsx
│           │   │   │   ├── DoctorHero.jsx
│           │   │   │   └── DoctorStats.jsx
│           │   │   ├── HeartRisk/
│           │   │   │   ├── PatientAIAlert.jsx
│           │   │   │   ├── PatientCriticalAlert.jsx
│           │   │   │   ├── PatientHeartRisk.jsx
│           │   │   │   ├── PatientRiskGauge.jsx
│           │   │   │   └── PatientRiskResult.jsx
│           │   │   ├── LifestyleSurvey/
│           │   │   │   ├── LifestyleSurveyHeader.jsx
│           │   │   │   ├── LifestyleSurveyResults.jsx
│           │   │   │   └── QuestionSection.jsx
│           │   │   ├── Messages/
│           │   │   │   ├── ChatHeader.jsx
│           │   │   │   ├── MessageInputBar.jsx
│           │   │   │   ├── MessagesList.jsx
│           │   │   │   └── MessagesSidebar.jsx
│           │   │   ├── NotFound/
│           │   │   │   └── NotFound.jsx
│           │   │   ├── PatientChatbot/
│           │   │   │   └── PatientChatbot.jsx
│           │   │   ├── PatientDashboard/
│           │   │   │   ├── DashboardWelcome.jsx
│           │   │   │   ├── LeftColumn.jsx
│           │   │   │   ├── PatientWeeklyChart.jsx
│           │   │   │   ├── ProgressRing.jsx
│           │   │   │   ├── RightColumn.jsx
│           │   │   │   ├── SectionHeader.jsx
│           │   │   │   ├── StarRating.jsx
│           │   │   │   ├── StatCard.jsx
│           │   │   │   └── VitalsSection.jsx
│           │   │   ├── PatientDoctorCard/
│           │   │   │   └── PatientDoctorCard.jsx
│           │   │   ├── PatientHeader/
│           │   │   │   └── PatientHeader.jsx
│           │   │   ├── PatientLayout/
│           │   │   │   └── PatientMainLayout.jsx
│           │   │   ├── PatientMedicalRecords/
│           │   │   │   ├── ConfirmDeleteModal.jsx
│           │   │   │   ├── DocumentsCardsMobile.jsx
│           │   │   │   ├── DocumentsTableDesktop.jsx
│           │   │   │   ├── QrCtaSection.jsx
│           │   │   │   ├── StatisticsCard.jsx
│           │   │   │   ├── UploadZones.jsx
│           │   │   │   └── constants.jsx
│           │   │   ├── PatientNextStep/
│           │   │   │   └── PatientNextStep.jsx
│           │   │   ├── PatientPayment/
│           │   │   │   └── PatientPayment.jsx
│           │   │   ├── PatientRatingModal/
│           │   │   │   └── PatientRatingModal.jsx
│           │   │   ├── PatientSettingsProfile/
│           │   │   │   ├── AccountSettingsSection.jsx
│           │   │   │   ├── FormPrimitives.jsx
│           │   │   │   ├── HealthInfoSection.jsx
│           │   │   │   ├── PasswordModal.jsx
│           │   │   │   ├── PersonalInfoSection.jsx
│           │   │   │   ├── SettingsHeader.jsx
│           │   │   │   ├── StoriesSection.jsx
│           │   │   │   └── constants.js
│           │   │   ├── PatientSidebar/
│           │   │   │   └── PatientSidebar.jsx
│           │   │   ├── PatientUploadCard/
│           │   │   │   └── PatientUploadCard.jsx
│           │   │   ├── PrescriptionDetail/
│           │   │   │   ├── ClinicalNotesSection.jsx
│           │   │   │   ├── LabsSection.jsx
│           │   │   │   ├── MedicationsSection.jsx
│           │   │   │   └── PrescriptionDetailHeader.jsx
│           │   │   ├── PrescriptionDetailModal/
│           │   │   │   └── PrescriptionDetailModal.jsx
│           │   │   ├── Prescriptions/
│           │   │   │   ├── AnimatedFilterPanel.jsx
│           │   │   │   ├── PrescriptionCard.jsx
│           │   │   │   ├── PrescriptionsGrid.jsx
│           │   │   │   ├── PrescriptionsHeader.jsx
│           │   │   │   ├── SearchFilterBar.jsx
│           │   │   │   ├── StatCard.jsx
│           │   │   │   └── StatsRow.jsx
│           │   │   ├── QRCode/
│           │   │   │   ├── QRCodeCard.jsx
│           │   │   │   ├── QRCodeDetails.jsx
│           │   │   │   └── QRCodeHeader.jsx
│           │   │   ├── Stories/
│           │   │   │   ├── StoriesFooter.jsx
│           │   │   │   ├── StoriesGrid.jsx
│           │   │   │   └── StoriesHeader.jsx
│           │   │   ├── StoryDetails/
│           │   │   │   ├── AddCommentBox.jsx
│           │   │   │   ├── Avatar.jsx
│           │   │   │   ├── CommentsPreview.jsx
│           │   │   │   ├── EngagementBar.jsx
│           │   │   │   ├── RelatedStories.jsx
│           │   │   │   ├── ReportModal.jsx
│           │   │   │   ├── StoryArticle.jsx
│           │   │   │   ├── StoryAuthorSection.jsx
│           │   │   │   ├── StoryDetailsFooter.jsx
│           │   │   │   └── StoryDetailsHeader.jsx
│           │   │   ├── UpdateHealth/
│           │   │   │   ├── NumberField.jsx
│           │   │   │   ├── SelectField.jsx
│           │   │   │   ├── UpdateHealthForm.jsx
│           │   │   │   └── UpdateHealthHeader.jsx
│           │   │   ├── VideoCall/
│           │   │   │   ├── EndCallModal.jsx
│           │   │   │   ├── FloatingCallWindow.jsx
│           │   │   │   ├── FullVideoScreen.jsx
│           │   │   │   ├── MinimizeModal.jsx
│           │   │   │   └── VideoCallContainer.jsx
│           │   │   └── WriteStory/
│           │   │       ├── CategoriesSection.jsx
│           │   │       ├── CoverImageSection.jsx
│           │   │       ├── StoryEditorSection.jsx
│           │   │       ├── StoryTitleSection.jsx
│           │   │       ├── WriteStoryActions.jsx
│           │   │       ├── WriteStoryHeader.jsx
│           │   │       ├── constants.js
│           │   │       └── editorUtils.js
│           │   └── pages/
│           │       ├── AllComments/
│           │       │   └── AllComments.jsx
│           │       ├── PatientAppointments/
│           │       │   └── PatientAppointments.jsx
│           │       ├── PatientBooking/
│           │       │   └── PatientBooking.jsx
│           │       ├── PatientDashboard/
│           │       │   └── PatientDashboard.jsx
│           │       ├── PatientDoctorList/
│           │       │   └── PatientDoctorList.jsx
│           │       ├── PatientDoctorProfile/
│           │       │   └── PatientDoctorProfile.jsx
│           │       ├── PatientLifestyleSurvey/
│           │       │   └── PatientLifestyleSurvey.jsx
│           │       ├── PatientMedicalRecords/
│           │       │   └── PatientMedicalRecords.jsx
│           │       ├── PatientMessages/
│           │       │   └── PatientMessages.jsx
│           │       ├── PatientPayment/
│           │       │   └── PatientPayment.jsx
│           │       ├── PatientSettingsProfile/
│           │       │   └── PatientSettingsProfile.jsx
│           │       ├── PatientUpdateHealth/
│           │       │   └── PatientUpdateHealth.jsx
│           │       ├── PrescriptionDetail/
│           │       │   └── PrescriptionDetail.jsx
│           │       ├── Prescriptions/
│           │       │   └── Prescriptions.jsx
│           │       ├── QRCode/
│           │       │   └── QRCode.jsx
│           │       ├── Stories/
│           │       │   └── Stories.jsx
│           │       ├── StoryDetails/
│           │       │   └── StoryDetails.jsx
│           │       └── WriteStory/
│           │           └── WriteStory.jsx
│           │
│           └── public/
│               └── PublicRecordsView.jsx
│
└── backend/
    ├── dotnet/
    │   ├── PulseX.slnx
    │   ├── global.json
    │   ├── appsettings.example.json
    │   ├── ADMIN_REPORTS_MANAGEMENT.md
    │   ├── FRONTEND_INTEGRATION_GUIDE.md
    │   ├── test_results.json
    │   │
    │   ├── PulseX.API/
    │   │   ├── PulseX.API.csproj
    │   │   ├── Program.cs
    │   │   ├── Properties/
    │   │   │   └── launchSettings.json
    │   │   ├── Controllers/
    │   │   │   ├── AdminController.cs
    │   │   │   ├── AiProxyController.cs
    │   │   │   ├── AppointmentController.cs
    │   │   │   ├── AuthController.cs
    │   │   │   ├── ChatbotController.cs
    │   │   │   ├── DoctorBookingController.cs
    │   │   │   ├── DoctorController.cs
    │   │   │   ├── DoctorScheduleController.cs
    │   │   │   ├── HealthDataController.cs
    │   │   │   ├── HealthSurveyController.cs
    │   │   │   ├── MedicalRecordsController.cs
    │   │   │   ├── MessageController.cs
    │   │   │   ├── NotificationsController.cs
    │   │   │   ├── PatientDashboardController.cs
    │   │   │   ├── PatientNotificationsController.cs
    │   │   │   ├── PrescriptionsController.cs
    │   │   │   ├── ReportsController.cs
    │   │   │   ├── ReportsManagementController.cs
    │   │   │   ├── RiskAssessmentController.cs
    │   │   │   ├── StoryController.cs
    │   │   │   ├── UserController.cs
    │   │   │   └── VideoCallController.cs
    │   │   ├── Helpers/
    │   │   │   ├── JwtHelper.cs
    │   │   │   ├── MappingProfile.cs
    │   │   │   ├── NameHelper.cs
    │   │   │   └── PasswordHelper.cs
    │   │   ├── Hubs/
    │   │   │   ├── ChatHub.cs
    │   │   │   └── VideoCallHub.cs
    │   │   ├── Services/
    │   │   │   ├── AdminService.cs
    │   │   │   ├── AiServiceClient.cs
    │   │   │   ├── AppointmentService.cs
    │   │   │   ├── AuthService.cs
    │   │   │   ├── ChatbotService.cs
    │   │   │   ├── ContentReportService.cs
    │   │   │   ├── DoctorBookingService.cs
    │   │   │   ├── DoctorScheduleService.cs
    │   │   │   ├── DoctorService.cs
    │   │   │   ├── EmailService.cs
    │   │   │   ├── HealthDataService.cs
    │   │   │   ├── HealthSurveyService.cs
    │   │   │   ├── MedicalRecordManagementService.cs
    │   │   │   ├── MessageService.cs
    │   │   │   ├── NotificationService.cs
    │   │   │   ├── PasswordResetService.cs
    │   │   │   ├── PatientDashboardService.cs
    │   │   │   ├── PatientNotificationService.cs
    │   │   │   ├── PrescriptionService.cs
    │   │   │   ├── RiskAssessmentService.cs
    │   │   │   ├── StoryService.cs
    │   │   │   ├── UserService.cs
    │   │   │   └── VideoCallService.cs
    │   │   ├── uploads/
    │   │   │   ├── doctors/
    │   │   │   ├── medical-records/
    │   │   │   ├── patients/
    │   │   │   └── story-covers/
    │   │   └── wwwroot/
    │   │       └── uploads/
    │   │           ├── chat/
    │   │           ├── medical-records/
    │   │           └── profile-pictures/
    │   │
    │   ├── PulseX.Core/
    │   │   ├── PulseX.Core.csproj
    │   │   ├── DTOs/
    │   │   │   ├── Appointment/
    │   │   │   │   ├── AppointmentDto.cs
    │   │   │   │   ├── CreateAppointmentDto.cs
    │   │   │   │   └── UpdateAppointmentStatusDto.cs
    │   │   │   ├── Admin/
    │   │   │   │   ├── ActivityLogDto.cs
    │   │   │   │   ├── AdminDashboardDto.cs
    │   │   │   │   ├── ApproveDoctorDto.cs
    │   │   │   │   ├── CreateDoctorByAdminDto.cs
    │   │   │   │   ├── CreatePatientByAdminDto.cs
    │   │   │   │   ├── ModerateContentDto.cs
    │   │   │   │   ├── UpdateDoctorByAdminDto.cs
    │   │   │   │   ├── UpdatePatientByAdminDto.cs
    │   │   │   │   ├── UpdateUserStatusDto.cs
    │   │   │   │   └── UserManagementDto.cs
    │   │   │   ├── Auth/
    │   │   │   │   ├── CreateAdminDto.cs
    │   │   │   │   ├── CreateDoctorDto.cs
    │   │   │   │   ├── ForgotPasswordDto.cs
    │   │   │   │   ├── LoginDto.cs
    │   │   │   │   ├── LoginResponseDto.cs
    │   │   │   │   ├── RegisterPatientDto.cs
    │   │   │   │   ├── ResetPasswordDto.cs
    │   │   │   │   ├── VerifyOtpDto.cs
    │   │   │   │   └── VerifyOtpResponseDto.cs
    │   │   │   ├── Doctor/
    │   │   │   │   ├── AddPatientMedicalDataDto.cs
    │   │   │   │   ├── DoctorDashboardDto.cs
    │   │   │   │   ├── DoctorListDto.cs
    │   │   │   │   ├── DoctorListingDto.cs
    │   │   │   │   ├── DoctorPatientListItemDto.cs
    │   │   │   │   ├── DoctorPatientProfileDto.cs
    │   │   │   │   ├── DoctorProfileDto.cs
    │   │   │   │   ├── DoctorRatingDto.cs
    │   │   │   │   ├── DoctorScheduleDto.cs
    │   │   │   │   ├── DoctorSettingsProfileDto.cs
    │   │   │   │   ├── PendingRatingDto.cs
    │   │   │   │   ├── SubmitRatingDto.cs
    │   │   │   │   └── UpdateDoctorProfileDto.cs
    │   │   │   ├── HealthData/
    │   │   │   │   ├── CreateHealthDataDto.cs
    │   │   │   │   ├── HealthDataDto.cs
    │   │   │   │   └── VitalSignsDto.cs
    │   │   │   ├── HealthSurvey/
    │   │   │   │   ├── HealthSurveyResultDto.cs
    │   │   │   │   └── SubmitHealthSurveyDto.cs
    │   │   │   ├── MedicalRecord/
    │   │   │   │   ├── MedicalRecordDto.cs
    │   │   │   │   └── MedicalRecordManagementDto.cs
    │   │   │   ├── Message/
    │   │   │   │   └── MessageDto.cs
    │   │   │   ├── Notification/
    │   │   │   │   ├── NotificationDto.cs
    │   │   │   │   └── PatientNotificationDto.cs
    │   │   │   ├── Patient/
    │   │   │   │   └── PatientDashboardDto.cs
    │   │   │   ├── Prescription/
    │   │   │   │   └── PrescriptionDto.cs
    │   │   │   ├── Report/
    │   │   │   │   └── ReportDto.cs
    │   │   │   ├── RiskAssessment/
    │   │   │   │   ├── AIHeartRiskAssessmentDto.cs
    │   │   │   │   ├── CreateRiskAssessmentDto.cs
    │   │   │   │   ├── HeartRiskAssessmentDto.cs
    │   │   │   │   └── RiskAssessmentDto.cs
    │   │   │   ├── Story/
    │   │   │   │   ├── CreateStoryDto.cs
    │   │   │   │   └── StoryDto.cs
    │   │   │   ├── User/
    │   │   │   │   ├── ChangePasswordDto.cs
    │   │   │   │   ├── PatientDashboardDto.cs
    │   │   │   │   ├── PatientProfileDto.cs
    │   │   │   │   ├── UpdateAccountSettingsDto.cs
    │   │   │   │   ├── UpdateHealthDataDto.cs
    │   │   │   │   ├── UpdatePatientProfileDto.cs
    │   │   │   │   ├── UpdateProfileDto.cs
    │   │   │   │   └── UserProfileDto.cs
    │   │   │   ├── VideoCall/
    │   │   │   │   └── VideoCallDtos.cs
    │   │   │   ├── ChatbotRequestDto.cs
    │   │   │   └── ChatbotResponseDto.cs
    │   │   ├── Enums/
    │   │   │   ├── AppointmentStatus.cs
    │   │   │   ├── PaymentMethod.cs
    │   │   │   ├── PaymentStatus.cs
    │   │   │   └── UserRole.cs
    │   │   ├── Interfaces/
    │   │   │   ├── IActivityLogRepository.cs
    │   │   │   ├── IAppointmentRepository.cs
    │   │   │   ├── IContentReportRepository.cs
    │   │   │   ├── IDoctorRatingRepository.cs
    │   │   │   ├── IDoctorRepository.cs
    │   │   │   ├── IDoctorScheduleRepository.cs
    │   │   │   ├── IEmailService.cs
    │   │   │   ├── IHealthDataRepository.cs
    │   │   │   ├── IMedicalRecordRepository.cs
    │   │   │   ├── IMessageRepository.cs
    │   │   │   ├── INotificationRepository.cs
    │   │   │   ├── IPasswordResetRepository.cs
    │   │   │   ├── IPatientHealthInfoRepository.cs
    │   │   │   ├── IPatientNotificationRepository.cs
    │   │   │   ├── IPatientRepository.cs
    │   │   │   ├── IPrescriptionRepository.cs
    │   │   │   ├── IRiskAssessmentRepository.cs
    │   │   │   ├── IStoryCommentRepository.cs
    │   │   │   ├── IStoryRepository.cs
    │   │   │   └── IUserRepository.cs
    │   │   └── Models/
    │   │       ├── ActivityLog.cs
    │   │       ├── Appointment.cs
    │   │       ├── ContentReport.cs
    │   │       ├── Doctor.cs
    │   │       ├── DoctorNotification.cs
    │   │       ├── DoctorRating.cs
    │   │       ├── DoctorScheduleSlot.cs
    │   │       ├── HealthData.cs
    │   │       ├── HealthSurvey.cs
    │   │       ├── MedicalRecord.cs
    │   │       ├── Message.cs
    │   │       ├── PasswordResetToken.cs
    │   │       ├── Patient.cs
    │   │       ├── PatientHealthInfo.cs
    │   │       ├── PatientNotification.cs
    │   │       ├── Prescription.cs
    │   │       ├── RiskAssessment.cs
    │   │       ├── Story.cs
    │   │       ├── StoryComment.cs
    │   │       ├── User.cs
    │   │       └── VideoCallSession.cs
    │   │
    │   └── PulseX.Data/
    │       ├── PulseX.Data.csproj
    │       ├── ApplicationDbContext.cs
    │       ├── Repositories/
    │       │   ├── ActivityLogRepository.cs
    │       │   ├── AppointmentRepository.cs
    │       │   ├── ContentReportRepository.cs
    │       │   ├── DoctorRatingRepository.cs
    │       │   ├── DoctorRepository.cs
    │       │   ├── DoctorScheduleRepository.cs
    │       │   ├── HealthDataRepository.cs
    │       │   ├── MedicalRecordRepository.cs
    │       │   ├── MessageRepository.cs
    │       │   ├── NotificationRepository.cs
    │       │   ├── PasswordResetRepository.cs
    │       │   ├── PatientHealthInfoRepository.cs
    │       │   ├── PatientNotificationRepository.cs
    │       │   ├── PatientRepository.cs
    │       │   ├── PrescriptionRepository.cs
    │       │   ├── RiskAssessmentRepository.cs
    │       │   ├── StoryCommentRepository.cs
    │       │   ├── StoryRepository.cs
    │       │   └── UserRepository.cs
    │       └── Migrations/
    │           ├── 20260202124812_InitialCreate.cs
    │           ├── 20260202124812_InitialCreate.Designer.cs
    │           ├── 20260202150342_AddDoctorApprovalAndRating.cs
    │           ├── 20260202150342_AddDoctorApprovalAndRating.Designer.cs
    │           ├── 20260202174842_UpdateDoctorTable.cs
    │           ├── 20260202174842_UpdateDoctorTable.Designer.cs
    │           ├── 20260202232351_UpdatePatientAndHealthDataModels.cs
    │           ├── 20260202232351_UpdatePatientAndHealthDataModels.Designer.cs
    │           ├── 20260202234147_UpdatePatientAndRiskModels.cs
    │           ├── 20260202234147_UpdatePatientAndRiskModels.Designer.cs
    │           ├── 20260202235624_UpdateDoctorModel.cs
    │           ├── 20260202235624_UpdateDoctorModel.Designer.cs
    │           ├── 20260203004509_UpdateDoctorandpatientModel.cs
    │           ├── 20260203004509_UpdateDoctorandpatientModel.Designer.cs
    │           ├── 20260203220749_AddForgotPasswordSystem.cs
    │           ├── 20260203220749_AddForgotPasswordSystem.Designer.cs
    │           ├── 20260204015438_UpdateResetFlowWithToken.cs
    │           ├── 20260204015438_UpdateResetFlowWithToken.Designer.cs
    │           ├── 20260204131546_UpdatePatientFlow.cs
    │           ├── 20260204131546_UpdatePatientFlow.Designer.cs
    │           ├── 20260204144846_ChangeCholesterolToBloodCount.cs
    │           ├── 20260204144846_ChangeCholesterolToBloodCount.Designer.cs
    │           ├── 20260204154209_FixPatientUserRelation.cs
    │           ├── 20260204154209_FixPatientUserRelation.Designer.cs
    │           ├── 20260204155903_FinalizeRiskMapping.cs
    │           ├── 20260204155903_FinalizeRiskMapping.Designer.cs
    │           ├── 20260204180837_UpdateMedicalRecordsLogic.cs
    │           ├── 20260204180837_UpdateMedicalRecordsLogic.Designer.cs
    │           ├── 20260204182352_FinalMedicalRecordsUploadFix.cs
    │           ├── 20260204182352_FinalMedicalRecordsUploadFix.Designer.cs
    │           ├── 20260205005420_FixPatientLookupInMedicalRecords.cs
    │           ├── 20260205005420_FixPatientLookupInMedicalRecords.Designer.cs
    │           ├── 20260206161505_AddBookingAndChatSystem.cs
    │           ├── 20260206161505_AddBookingAndChatSystem.Designer.cs
    │           ├── 20260215234041_UpdatePatientAndDoctorFlow.cs
    │           ├── 20260215234041_UpdatePatientAndDoctorFlow.Designer.cs
    │           ├── 20260216001719_UpdateDoctorFlow.cs
    │           ├── 20260216001719_UpdateDoctorFlow.Designer.cs
    │           ├── 20260216003920_AddPrescriptionAndHealthRecordsFlow.cs
    │           ├── 20260216003920_AddPrescriptionAndHealthRecordsFlow.Designer.cs
    │           ├── 20260216005912_AddFinalIntegratedFlow.cs
    │           ├── 20260216005912_AddFinalIntegratedFlow.Designer.cs
    │           ├── 20260216010040_UpdateDoctorProfile.cs
    │           ├── 20260216010040_UpdateDoctorProfile.Designer.cs
    │           ├── 20260216010625_Updatechangepassword.cs
    │           ├── 20260216010625_Updatechangepassword.Designer.cs
    │           ├── 20260216015220_somechangespatanddoc.cs
    │           ├── 20260216015220_somechangespatanddoc.Designer.cs
    │           ├── 20260216020331_changepatientflow.cs
    │           ├── 20260216020331_changepatientflow.Designer.cs
    │           ├── 20260216022115_updatesetting.cs
    │           ├── 20260216022115_updatesetting.Designer.cs
    │           ├── 20260216104057_updatepatientflow2.cs
    │           ├── 20260216104057_updatepatientflow2.Designer.cs
    │           ├── 20260216110733_updateheartriskandhealthsurvey.cs
    │           ├── 20260216110733_updateheartriskandhealthsurvey.Designer.cs
    │           ├── 20260216111920_updatealertandmsgpatient.cs
    │           ├── 20260216111920_updatealertandmsgpatient.Designer.cs
    │           ├── 20260216121045_updatedashboard.cs
    │           ├── 20260216121045_updatedashboard.Designer.cs
    │           ├── 20260218003346_AddDateOfBirthToUser.cs
    │           ├── 20260218003346_AddDateOfBirthToUser.Designer.cs
    │           ├── 20260220131626_AddDoctorScheduleSlots.cs
    │           ├── 20260220131626_AddDoctorScheduleSlots.Designer.cs
    │           ├── 20260220170808_AddStoryCommentsAndEngagement.cs
    │           ├── 20260220170808_AddStoryCommentsAndEngagement.Designer.cs
    │           ├── 20260220195319_AddCommentRepliesAndEngagement.cs
    │           ├── 20260220195319_AddCommentRepliesAndEngagement.Designer.cs
    │           ├── 20260220222943_AddContentReports.cs
    │           ├── 20260220222943_AddContentReports.Designer.cs
    │           ├── 20260319143419_AddVideoCallSessions.cs
    │           ├── 20260319143419_AddVideoCallSessions.Designer.cs
    │           ├── 20260321105613_AddAIHeartRiskAssessmentAndPatientNotifications.cs
    │           ├── 20260321105613_AddAIHeartRiskAssessmentAndPatientNotifications.Designer.cs
    │           ├── 20260420181607_AddOtpAndRegistrationUpdates.cs
    │           ├── 20260420181607_AddOtpAndRegistrationUpdates.Designer.cs
    │           ├── 20260420223940_AddOtpAndRegistrationUpdates2.cs
    │           ├── 20260420223940_AddOtpAndRegistrationUpdates2.Designer.cs
    │           └── ApplicationDbContextModelSnapshot.cs
    │
    └── ai-service/
        ├── main.py
        ├── config.py
        ├── requirements.txt
        ├── Dockerfile
        ├── docker-compose.yml
        ├── create_model.py
        ├── monitor_training.py
        ├── setup_models.py
        ├── simple_monitor.py
        ├── train_cardiac_xray.py
        ├── train_enhanced.py
        ├── train_recommendation.py
        ├── wait_for_results.py
        ├── wait_for_training.py
        ├── example_chatbot_client.py
        ├── example_client.py
        ├── test_api.py
        ├── test_chatbot.py
        ├── test_chatbot_simple.py
        ├── test_recommendation.py
        ├── test_setup.py
        ├── test_trained_model.py
        ├── test_xray_endpoint.py
        ├── check_training.sh
        ├── download_dataset.sh
        ├── .env.example
        ├── .gitignore
        ├── models/
        │   ├── binary_metadata.json
        │   ├── recommendation_metadata.json
        │   ├── recommendation_model.pkl
        │   ├── confusion_matrix.png
        │   ├── confusion_matrix_recommendation.png
        │   ├── roc_curve_recommendation.png
        │   └── training_history.png
        ├── services/
        │   ├── __init__.py
        │   ├── chatbot_service.py
        │   ├── recommendation_service.py
        │   └── xray_service.py
        ├── tests/
        │   ├── __init__.py
        │   ├── conftest.py
        │   ├── test_api.py
        │   ├── test_chatbot.py
        │   ├── test_recommendation.py
        │   └── test_xray.py
        ├── test_images/
        │   └── .gitkeep
        └── uploads/
            ├── ecg/
            └── xray_temp/
```
