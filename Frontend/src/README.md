# Source Structure (src)

This file documents the complete current structure of the `src` directory.

## Role Overview

- Admin
  Manages the platform operations, including dashboard monitoring, doctor and patient management, story moderation, reports handling, and profile settings.

- Patient
  Uses the core healthcare journey features such as dashboard insights, doctor browsing, booking, medical records, prescriptions, messages, and personal settings.

- Doctor (Coming Soon)
  Dedicated doctor workflow documentation will be added soon.

```text
src/
├─ assets/
│  ├─ Images/
│  │  ├─ f1.png
│  │  ├─ f2.png
│  │  ├─ f3.png
│  │  ├─ f4.png
│  │  ├─ f5.png
│  │  ├─ Login.svg
│  │  ├─ Notfound.png
│  │  └─ Qrcodepatiant.svg
│  └─ logo/
│     └─ logo.svg
├─ Button/
│  └─ Button.jsx
├─ components/
│  ├─ Container/
│  │  └─ Container.jsx
│  ├─ ErrorBoundary/
│  │  └─ ErrorBoundary.jsx
│  ├─ Footer/
│  │  └─ Footer.jsx
│  ├─ Layout/
│  │  └─ Layout.jsx
│  ├─ Navbar/
│  │  └─ Navbar.jsx
│  ├─ Toast/
│  │  └─ Toast.jsx
│  └─ index.js
├─ features/
│  ├─ admin/
│  │  ├─ components/
│  │  │  ├─ ActivityLogs/
│  │  │  │  ├─ List/
│  │  │  │  │  └─ ActivityLogsView.jsx
│  │  │  │  └─ shared/
│  │  │  │     └─ activityLogsMockData.js
│  │  │  ├─ AdminHeader/
│  │  │  │  └─ AdminHeader.jsx
│  │  │  ├─ AdminLayout/
│  │  │  │  └─ AdminLayout.jsx
│  │  │  ├─ ConfirmModal/
│  │  │  │  └─ ConfirmModal.jsx
│  │  │  ├─ Container/
│  │  │  │  └─ Container.jsx
│  │  │  ├─ Doctor/
│  │  │  │  ├─ AddDoctorBtn/
│  │  │  │  │  └─ AddDoctorBtn.jsx
│  │  │  │  ├─ DataTable/
│  │  │  │  │  └─ DataTable.jsx
│  │  │  │  ├─ DoctorManagement/
│  │  │  │  │  ├─ DoctorManagement.jsx
│  │  │  │  │  ├─ doctorsMockData.js
│  │  │  │  │  └─ exportDoctorsToExcel.js
│  │  │  │  ├─ EditDoctor/
│  │  │  │  │  ├─ doctorsMockById.js
│  │  │  │  │  └─ EditDoctor.jsx
│  │  │  │  └─ EditForm/
│  │  │  │     └─ EditForm.jsx
│  │  │  ├─ DoctorForm/
│  │  │  │  └─ shared/
│  │  │  │     ├─ doctorValidationSchema.js
│  │  │  │     ├─ FieldError.jsx
│  │  │  │     └─ InputField.jsx
│  │  │  ├─ EmptyState.jsx/
│  │  │  │  └─ EmptyState.jsx
│  │  │  ├─ NotFound/
│  │  │  │  └─ NotFound.jsx
│  │  │  ├─ PatientForm/
│  │  │  │  └─ shared/
│  │  │  │     ├─ FieldError.jsx
│  │  │  │     ├─ InputField.jsx
│  │  │  │     └─ patientValidationSchema.js
│  │  │  ├─ Patients/
│  │  │  │  ├─ AddPatientBtn/
│  │  │  │  │  └─ AddPatientBtn.jsx
│  │  │  │  ├─ EditPatient/
│  │  │  │  │  ├─ EditPatient.jsx
│  │  │  │  │  └─ patientMockById.js
│  │  │  │  └─ PatientManagement/
│  │  │  │     ├─ exportPatientsToExcel.js
│  │  │  │     ├─ PatientManagement.jsx
│  │  │  │     ├─ PatientsIcon.jsx
│  │  │  │     └─ patientsMockData.js
│  │  │  ├─ Reports/
│  │  │  │  ├─ List/
│  │  │  │  │  └─ ReportsManagementView.jsx
│  │  │  │  └─ shared/
│  │  │  │     └─ reportsMockData.js
│  │  │  ├─ SettingsProfile/
│  │  │  │  └─ Profile/
│  │  │  │     ├─ PasswordChangeModal.jsx
│  │  │  │     └─ SettingsProfileView.jsx
│  │  │  ├─ shared/
│  │  │  │  ├─ EmptyState/
│  │  │  │  │  └─ EmptyState.jsx
│  │  │  │  ├─ GenderToggle/
│  │  │  │  │  └─ GenderToggle.jsx
│  │  │  │  └─ index.js
│  │  │  ├─ Sidebar/
│  │  │  │  └─ Sidebar.jsx
│  │  │  ├─ SuccessPopup/
│  │  │  │  └─ SuccessPopup.jsx
│  │  │  └─ ToastNotification/
│  │  │     └─ ToastNotification.jsx
│  │  ├─ pages/
│  │  │  ├─ ActivityLogs/
│  │  │  │  ├─ List/
│  │  │  │  │  └─ ActivityLogs.jsx
│  │  │  │  └─ shared/
│  │  │  │     └─ seo.js
│  │  │  ├─ Dashboard/
│  │  │  │  ├─ components/
│  │  │  │  │  ├─ Skeleton.jsx
│  │  │  │  │  └─ StatCard.jsx
│  │  │  │  └─ AdminDashboard.jsx
│  │  │  ├─ Doctors/
│  │  │  │  ├─ Create/
│  │  │  │  │  └─ AddDoctorBtn.jsx
│  │  │  │  ├─ Edit/
│  │  │  │  │  └─ EditDoctor.jsx
│  │  │  │  └─ List/
│  │  │  │     └─ DoctorManagement.jsx
│  │  │  ├─ Patients/
│  │  │  │  ├─ Create/
│  │  │  │  │  └─ AddPatientBtn.jsx
│  │  │  │  ├─ Edit/
│  │  │  │  │  └─ EditPatient.jsx
│  │  │  │  └─ List/
│  │  │  │     └─ PatientManagement.jsx
│  │  │  ├─ Reports/
│  │  │  │  ├─ List/
│  │  │  │  │  └─ ReportsManagement.jsx
│  │  │  │  └─ shared/
│  │  │  │     └─ seo.js
│  │  │  ├─ SettingsProfile/
│  │  │  │  ├─ Profile/
│  │  │  │  │  └─ SettingsProfile.jsx
│  │  │  │  └─ shared/
│  │  │  │     └─ seo.js
│  │  │  └─ Stories/
│  │  │     ├─ Comments/
│  │  │     │  └─ StoryAllComments.jsx
│  │  │     ├─ Details/
│  │  │     │  └─ StoryDetails.jsx
│  │  │     ├─ List/
│  │  │     │  └─ StoriesManagement.jsx
│  │  │     └─ shared/
│  │  │        ├─ seo.js
│  │  │        └─ storiesMockData.js
│  │  └─ README.md
│  ├─ auth/
│  │  ├─ components/
│  │  │  └─ ForgotPassWrapper/
│  │  │     └─ ForgotPassWrapper.jsx
│  │  └─ pages/
│  │     ├─ ForgotPassword/
│  │     │  └─ ForgotPassword.jsx
│  │     ├─ Login/
│  │     │  └─ Login.jsx
│  │     └─ Register/
│  │        └─ Register.jsx
│  ├─ doctor/
│  │  ├─ components/
│  │  │  ├─ DoctorHeader/
│  │  │  │  └─ DoctorHeader.jsx
│  │  │  ├─ DoctorLayout/
│  │  │  │  └─ DoctorLayout.jsx
│  │  │  ├─ DoctorSidebar/
│  │  │  │  └─ DoctorSidebar.jsx
│  │  │  └─ NotFound/
│  │  │     └─ NotFound.jsx
│  │  └─ pages/
│  │     └─ DoctorDashboard/
│  │        └─ DoctorDashboard.jsx
│  ├─ home/
│  │  ├─ components/
│  │  │  ├─ CustomSlider/
│  │  │  │  └─ CustomSlider.jsx
│  │  │  ├─ Doctors/
│  │  │  │  └─ Doctors.jsx
│  │  │  ├─ Features/
│  │  │  │  └─ Features.jsx
│  │  │  ├─ Hero/
│  │  │  │  └─ Hero.jsx
│  │  │  ├─ HomeSectionWrapper/
│  │  │  │  └─ HomeSectionWrapper.jsx
│  │  │  ├─ HomeWrapper/
│  │  │  │  └─ HomeWrapper.jsx
│  │  │  ├─ JourneyTimeline/
│  │  │  │  └─ JourneyTimeline.jsx
│  │  │  ├─ PatientStories/
│  │  │  │  └─ PatientStories.jsx
│  │  │  ├─ SectionHeader/
│  │  │  │  └─ SectionHeader.jsx
│  │  │  ├─ SectionWrapper/
│  │  │  │  └─ SectionWrapper.jsx
│  │  │  └─ Stories/
│  │  │     └─ Stories.jsx
│  │  └─ pages/
│  │     └─ Home/
│  │        └─ Home.jsx
│  └─ patient/
│     ├─ components/
│     │  ├─ AllComments/
│     │  │  ├─ AddCommentSection.jsx
│     │  │  ├─ AllCommentsHeader.jsx
│     │  │  ├─ Avatar.jsx
│     │  │  ├─ CommentsList.jsx
│     │  │  └─ ReportModal.jsx
│     │  ├─ Appointments/
│     │  │  ├─ AppointmentsHeader.jsx
│     │  │  ├─ AppointmentsList.jsx
│     │  │  ├─ AppointmentsStats.jsx
│     │  │  └─ AppointmentsTabs.jsx
│     │  ├─ Booking/
│     │  │  ├─ BookingCalendar.jsx
│     │  │  ├─ BookingSidebar.jsx
│     │  │  └─ BookingTimeSlots.jsx
│     │  ├─ DoctorList/
│     │  │  ├─ DoctorCard.jsx
│     │  │  ├─ DoctorFilters.jsx
│     │  │  ├─ DoctorGrid.jsx
│     │  │  ├─ DoctorListHeader.jsx
│     │  │  ├─ DoctorListStats.jsx
│     │  │  └─ DoctorPagination.jsx
│     │  ├─ DoctorProfile/
│     │  │  ├─ DoctorAbout.jsx
│     │  │  ├─ DoctorExperience.jsx
│     │  │  ├─ DoctorHero.jsx
│     │  │  └─ DoctorStats.jsx
│     │  ├─ HeartRisk/
│     │  │  ├─ PatientAIAlert.jsx
│     │  │  ├─ PatientCriticalAlert.jsx
│     │  │  ├─ PatientHeartRisk.jsx
│     │  │  ├─ PatientRiskGauge.jsx
│     │  │  └─ PatientRiskResult.jsx
│     │  ├─ LifestyleSurvey/
│     │  │  ├─ LifestyleSurveyHeader.jsx
│     │  │  ├─ LifestyleSurveyResults.jsx
│     │  │  └─ QuestionSection.jsx
│     │  ├─ Messages/
│     │  │  ├─ ChatHeader.jsx
│     │  │  ├─ MessageInputBar.jsx
│     │  │  ├─ MessagesList.jsx
│     │  │  └─ MessagesSidebar.jsx
│     │  ├─ NotFound/
│     │  │  └─ NotFound.jsx
│     │  ├─ PatientChatbot/
│     │  │  └─ PatientChatbot.jsx
│     │  ├─ PatientDashboard/
│     │  │  ├─ DashboardWelcome.jsx
│     │  │  ├─ LeftColumn.jsx
│     │  │  ├─ PatientWeeklyChart.jsx
│     │  │  ├─ ProgressRing.jsx
│     │  │  ├─ RightColumn.jsx
│     │  │  ├─ SectionHeader.jsx
│     │  │  ├─ StarRating.jsx
│     │  │  ├─ StatCard.jsx
│     │  │  └─ VitalsSection.jsx
│     │  ├─ PatientDoctorCard/
│     │  │  └─ PatientDoctorCard.jsx
│     │  ├─ PatientHeader/
│     │  │  └─ PatientHeader.jsx
│     │  ├─ PatientLayout/
│     │  │  └─ PatientMainLayout.jsx
│     │  ├─ PatientMedicalRecords/
│     │  │  ├─ ConfirmDeleteModal.jsx
│     │  │  ├─ constants.jsx
│     │  │  ├─ DocumentsCardsMobile.jsx
│     │  │  ├─ DocumentsTableDesktop.jsx
│     │  │  ├─ QrCtaSection.jsx
│     │  │  ├─ StatisticsCard.jsx
│     │  │  └─ UploadZones.jsx
│     │  ├─ PatientNextStep/
│     │  │  └─ PatientNextStep.jsx
│     │  ├─ PatientPayment/
│     │  │  └─ PatientPayment.jsx
│     │  ├─ PatientRatingModal/
│     │  │  └─ PatientRatingModal.jsx
│     │  ├─ PatientSettingsProfile/
│     │  │  ├─ AccountSettingsSection.jsx
│     │  │  ├─ constants.js
│     │  │  ├─ FormPrimitives.jsx
│     │  │  ├─ HealthInfoSection.jsx
│     │  │  ├─ PasswordModal.jsx
│     │  │  ├─ PersonalInfoSection.jsx
│     │  │  ├─ SettingsHeader.jsx
│     │  │  └─ StoriesSection.jsx
│     │  ├─ PatientSidebar/
│     │  │  └─ PatientSidebar.jsx
│     │  ├─ PatientUploadCard/
│     │  │  └─ PatientUploadCard.jsx
│     │  ├─ PrescriptionDetail/
│     │  │  ├─ ClinicalNotesSection.jsx
│     │  │  ├─ LabsSection.jsx
│     │  │  ├─ MedicationsSection.jsx
│     │  │  └─ PrescriptionDetailHeader.jsx
│     │  ├─ PrescriptionDetailModal/
│     │  │  └─ PrescriptionDetailModal.jsx
│     │  ├─ Prescriptions/
│     │  │  ├─ AnimatedFilterPanel.jsx
│     │  │  ├─ PrescriptionCard.jsx
│     │  │  ├─ PrescriptionsGrid.jsx
│     │  │  ├─ PrescriptionsHeader.jsx
│     │  │  ├─ SearchFilterBar.jsx
│     │  │  ├─ StatCard.jsx
│     │  │  └─ StatsRow.jsx
│     │  ├─ QRCode/
│     │  │  ├─ QRCodeCard.jsx
│     │  │  ├─ QRCodeDetails.jsx
│     │  │  └─ QRCodeHeader.jsx
│     │  ├─ Stories/
│     │  │  ├─ StoriesFooter.jsx
│     │  │  ├─ StoriesGrid.jsx
│     │  │  └─ StoriesHeader.jsx
│     │  ├─ StoryDetails/
│     │  │  ├─ AddCommentBox.jsx
│     │  │  ├─ Avatar.jsx
│     │  │  ├─ CommentsPreview.jsx
│     │  │  ├─ EngagementBar.jsx
│     │  │  ├─ RelatedStories.jsx
│     │  │  ├─ ReportModal.jsx
│     │  │  ├─ StoryArticle.jsx
│     │  │  ├─ StoryAuthorSection.jsx
│     │  │  ├─ StoryDetailsFooter.jsx
│     │  │  └─ StoryDetailsHeader.jsx
│     │  ├─ UpdateHealth/
│     │  │  ├─ NumberField.jsx
│     │  │  ├─ SelectField.jsx
│     │  │  ├─ UpdateHealthForm.jsx
│     │  │  └─ UpdateHealthHeader.jsx
│     │  ├─ VideoCall/
│     │  │  ├─ FloatingCallWindow.jsx
│     │  │  ├─ FullVideoScreen.jsx
│     │  │  ├─ MinimizeModal.jsx
│     │  │  └─ VideoCallContainer.jsx
│     │  └─ WriteStory/
│     │     ├─ CategoriesSection.jsx
│     │     ├─ constants.js
│     │     ├─ CoverImageSection.jsx
│     │     ├─ editorUtils.js
│     │     ├─ StoryEditorSection.jsx
│     │     ├─ StoryTitleSection.jsx
│     │     ├─ WriteStoryActions.jsx
│     │     └─ WriteStoryHeader.jsx
│     ├─ hooks/
│     │  └─ usePatientData.js
│     ├─ pages/
│     │  ├─ AllComments/
│     │  │  └─ AllComments.jsx
│     │  ├─ PatientAppointments/
│     │  │  └─ PatientAppointments.jsx
│     │  ├─ PatientBooking/
│     │  │  └─ PatientBooking.jsx
│     │  ├─ PatientDashboard/
│     │  │  └─ PatientDashboard.jsx
│     │  ├─ PatientDoctorList/
│     │  │  └─ PatientDoctorList.jsx
│     │  ├─ PatientDoctorProfile/
│     │  │  └─ PatientDoctorProfile.jsx
│     │  ├─ PatientLifestyleSurvey/
│     │  │  └─ PatientLifestyleSurvey.jsx
│     │  ├─ PatientMedicalRecords/
│     │  │  └─ PatientMedicalRecords.jsx
│     │  ├─ PatientMessages/
│     │  │  └─ PatientMessages.jsx
│     │  ├─ PatientPayment/
│     │  │  └─ PatientPayment.jsx
│     │  ├─ PatientSettingsProfile/
│     │  │  └─ PatientSettingsProfile.jsx
│     │  ├─ PatientUpdateHealth/
│     │  │  └─ PatientUpdateHealth.jsx
│     │  ├─ PrescriptionDetail/
│     │  │  └─ PrescriptionDetail.jsx
│     │  ├─ Prescriptions/
│     │  │  └─ Prescriptions.jsx
│     │  ├─ QRCode/
│     │  │  └─ QRCode.jsx
│     │  ├─ Stories/
│     │  │  └─ Stories.jsx
│     │  ├─ StoryDetails/
│     │  │  └─ StoryDetails.jsx
│     │  ├─ VideoCall/
│     │  └─ WriteStory/
│     │     └─ WriteStory.jsx
│     └─ README.md
├─ hooks/
│  └─ index.js
├─ pages/
│  ├─ DoctorDashboard/
│  │  └─ DoctorDashboard.jsx
│  ├─ ForgotPassword/
│  │  └─ ForgotPassword.jsx
│  ├─ Home/
│  │  └─ Home.jsx
│  ├─ Login/
│  │  └─ Login.jsx
│  └─ Regester/
│     └─ Regester.jsx
├─ PatientHooks/
│  └─ usePatientData.js
├─ schemas/
│  ├─ authSchema.jsx
│  ├─ forgotPasswordSchema.jsx
│  └─ registerSchema.jsx
├─ store/
│  └─ index.js
├─ App.jsx
├─ index.css
└─ main.jsx
```

## Structure Explanation (What and Why)

### Root Files

- `App.jsx`
  Main routing entry. It connects route groups (Admin, Patient, Doctor, Public) and controls the app-level navigation flow.

- `main.jsx`
  React bootstrap file. It mounts the app and starts the rendering lifecycle.

- `index.css`
  Global styling baseline. It is used for shared styles and utility-level visual consistency.

### Core Directories

- `assets/`
  Stores static files (images, logos, illustrations). Keeping assets in one place makes media management and reuse easier.

- `components/`
  Shared reusable UI (layout, navbar, footer, global toast, etc.). This avoids duplicating common building blocks across features.

- `features/`
  Domain-based modules. This is the heart of the architecture and keeps code grouped by business role instead of by file type only.

- `hooks/`
  Shared hooks used across multiple parts of the app. It centralizes reusable behavior and side-effect logic.

- `schemas/`
  Validation schemas (Formik/Yup related). Keeping validation in one place improves consistency and maintainability.

- `store/`
  State/store setup. This is where app-level state configuration is defined.

- `pages/`
  Legacy or top-level route pages outside feature folders. Useful for compatibility and simple route mapping.

- `PatientHooks/`
  Patient-specific hooks separated for clearer domain ownership.

- `Button/`
  Standalone button module used as a dedicated UI utility unit.

### Feature Domains (`features/`)

- `features/admin/`
  Admin control center: dashboard, management workflows, moderation, reports, logs, and settings.
  Why: admin workflows are broad and operation-heavy, so they are grouped in a dedicated domain for clarity and scalability.

- `features/auth/`
  Authentication journey: login, register, forgot password.
  Why: auth is a cross-cutting concern and should remain isolated, predictable, and easy to evolve.

- `features/doctor/`
  Doctor-facing experience and layout.
  Why: role-specific UX and future doctor workflows are easier to scale when isolated in their own domain.

- `features/patient/`
  Patient journey modules: appointments, booking, records, stories, chatbot, settings, and more.
  Why: patient features are extensive and benefit from a dedicated, modular structure.

- `features/home/`
  Public landing/home sections.
  Why: home content evolves frequently and is cleaner when separated from authenticated role domains.

### Inside Feature Modules (General Pattern)

- `components/`
  UI and feature view units.
  Why: reusable UI blocks stay close to their domain logic.

- `pages/`
  Route-level entry points.
  Why: keeps navigation layer thin while composing domain components cleanly.

- `shared/` (where available)
  Shared pieces within the same feature (not global).
  Why: prevents duplication inside a domain without polluting global components.
