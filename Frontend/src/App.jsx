import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import './index.css'

// ─── Loading Component ─────────────────────────────────────────
const PageLoader = () => (
  <div className="flex h-screen items-center justify-center bg-white dark:bg-[#020617]">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-main border-t-transparent"></div>
  </div>
);

// ─── Layouts ────────────────────────────────────────────────────
import AdminLayout from './features/admin/components/AdminLayout/AdminLayout'
import PatientMainLayout from './features/patient/components/PatientLayout/PatientMainLayout'
import DoctorLayout from './features/doctor/components/DoctorLayout/DoctorLayout'
import Layout from './components/Layout/Layout'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'

// ─── Lazy-loaded Pages ──────────────────────────────────────────
const Home = lazy(() => import('./features/home/pages/Home/Home'))
const Login = lazy(() => import('./features/auth/pages/Login/Login'))
const Register = lazy(() => import('./features/auth/pages/Register/Register'))
const ForgotPassword = lazy(() => import('./features/auth/pages/ForgotPassword/ForgotPassword'))
const NotFound = lazy(() => import('./features/admin/components/NotFound/NotFound'))

// Admin Pages
const AdminDashboard = lazy(() => import('./features/admin/pages/Dashboard/AdminDashboard'))
const DoctorManagement = lazy(() => import('./features/admin/pages/Doctors/List/DoctorManagement'))
const PatientManagement = lazy(() => import('./features/admin/pages/Patients/List/PatientManagement'))
const StoriesManagement = lazy(() => import('./features/admin/pages/Stories/List/StoriesManagement'))
const ActivityLogs = lazy(() => import('./features/admin/pages/ActivityLogs/List/ActivityLogs'))
const SettingsProfile = lazy(() => import('./features/admin/pages/SettingsProfile/Profile/SettingsProfile'))
const AddDoctorBtn = lazy(() => import('./features/admin/pages/Doctors/Create/AddDoctorBtn'))
const AddPatientBtn = lazy(() => import('./features/admin/pages/Patients/Create/AddPatientBtn'))
const EditPatient = lazy(() => import('./features/admin/pages/Patients/Edit/EditPatient'))
const EditDoctor = lazy(() => import('./features/admin/pages/Doctors/Edit/EditDoctor'))
const AdminReports = lazy(() => import('./features/admin/pages/Reports/List/ReportsManagement'))
const StoryDetails = lazy(() => import('./features/admin/pages/Stories/Details/StoryDetails'))
const StoryAllComments = lazy(() => import('./features/admin/pages/Stories/Comments/StoryAllComments'))

// Patient Pages
const PatientDashboard = lazy(() => import('./features/patient/pages/PatientDashboard/PatientDashboard'))
const PatientLifestyleSurvey = lazy(() => import('./features/patient/pages/PatientLifestyleSurvey/PatientLifestyleSurvey'))
const PatientHeartRisk = lazy(() => import('./features/patient/components/HeartRisk/PatientHeartRisk'))
const PatientDoctorList = lazy(() => import('./features/patient/pages/PatientDoctorList/PatientDoctorList'))
const PatientDoctorProfile = lazy(() => import('./features/patient/pages/PatientDoctorProfile/PatientDoctorProfile'))
const PatientBooking = lazy(() => import('./features/patient/pages/PatientBooking/PatientBooking'))
const PatientPayment = lazy(() => import('./features/patient/pages/PatientPayment/PatientPayment'))
const PatientAppointments = lazy(() => import('./features/patient/pages/PatientAppointments/PatientAppointments'))
const PatientQRCode = lazy(() => import('./features/patient/pages/QRCode/QRCode'))
const PatientMessages = lazy(() => import('./features/patient/pages/PatientMessages/PatientMessages'))
const PatientMedicalRecords = lazy(() => import('./features/patient/pages/PatientMedicalRecords/PatientMedicalRecords'))
const PatientStories = lazy(() => import('./features/patient/pages/Stories/Stories'))
const PatientStoryDetails = lazy(() => import('./features/patient/pages/StoryDetails/StoryDetails'))
const PatientAllComments = lazy(() => import('./features/patient/pages/AllComments/AllComments'))
const WriteStory = lazy(() => import('./features/patient/pages/WriteStory/WriteStory'))
const PatientPrescriptions = lazy(() => import('./features/patient/pages/Prescriptions/Prescriptions'))
const PrescriptionDetail = lazy(() => import('./features/patient/pages/PrescriptionDetail/PrescriptionDetail'))
const PatientSettingsProfile = lazy(() => import('./features/patient/pages/PatientSettingsProfile/PatientSettingsProfile'))
const PatientUpdateHealth = lazy(() => import('./features/patient/pages/PatientUpdateHealth/PatientUpdateHealth'))
const NotFoundpataint = lazy(() => import('./features/patient/components/NotFound/NotFound'))
const DoctorNotFound = lazy(() => import('./features/doctor/components/NotFound/NotFound'))
const PublicRecordsView = lazy(() => import('./features/public/PublicRecordsView'))

// Doctor Pages
const DoctorDashboard = lazy(() => import('./features/doctor/pages/DoctorDashboard/DoctorDashboard'))
const DoctorAppointments = lazy(() => import('./features/doctor/pages/Appointments/Appointments'))
const DoctorScheduleSettings = lazy(() => import('./features/doctor/pages/ScheduleSettings/ScheduleSettings'))
const DoctorSettingsProfile = lazy(() => import('./features/doctor/pages/SettingsProfile/SettingsProfile'))
const DoctorPatients = lazy(() => import('./features/doctor/pages/Patients/Patients'))
const DoctorPatientDetails = lazy(() => import('./features/doctor/pages/PatientDetails/PatientDetails'))
const DoctorAddMedicalRecords = lazy(() => import('./features/doctor/pages/AddMedicalRecords/AddMedicalRecords'))
const DoctorMessages = lazy(() => import('./features/doctor/pages/DoctorMessages/DoctorMessages'))
const DoctorPrescription = lazy(() => import('./features/doctor/pages/Prescription/Prescription'))
const DoctorStories = lazy(() => import('./features/doctor/pages/Stories/Stories'))
const DoctorStoryDetails = lazy(() => import('./features/doctor/pages/StoryDetails/StoryDetails'))
const DoctorAllComments = lazy(() => import('./features/doctor/pages/AllComments/AllComments'))
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  const routing = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [{ index: true, element: <Home /> }]
    },
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "/forgot-password", element: <ForgotPassword /> },
    { path: "/public-records/:patientId", element: <Suspense fallback={<PageLoader />}><PublicRecordsView /></Suspense> },

    {
      path: "/admin",
      element: (
        <ProtectedRoute allowedRoles={["Admin"]}>
          <AdminLayout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <AdminDashboard /> },
        { path: "dashboard", element: <AdminDashboard /> },
        { path: "doctors/list", element: <DoctorManagement /> },
        { path: "patients/list", element: <PatientManagement /> },
        { path: "stories/list", element: <StoriesManagement /> },
        { path: "stories-management", element: <StoriesManagement /> },
        { path: "activity-logs", element: <ActivityLogs /> },
        { path: "settings", element: <SettingsProfile /> },
        { path: "doctors/create", element: <AddDoctorBtn /> },
        { path: "patients/create", element: <AddPatientBtn /> },
        { path: "doctors/edit/:id", element: <EditDoctor /> },
        { path: "patients/edit/:id", element: <EditPatient /> },
        { path: "reports", element: <AdminReports /> },
        { path: "stories/:id", element: <StoryDetails /> },
        { path: "stories/:id/comments", element: <StoryAllComments /> },
        { path: "*", element: <NotFound /> }
      ]
    },

    {
      path: "/patient",
      element: (
        <ProtectedRoute allowedRoles={["Patient"]}>
          <PatientMainLayout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <PatientDashboard /> },
        { path: "dashboard", element: <PatientDashboard /> },
        { path: "survey", element: <PatientLifestyleSurvey /> },
        { path: "heart-risk", element: <PatientHeartRisk /> },
        { path: "doctors", element: <PatientDoctorList /> },
        { path: "doctor-profile/:id", element: <PatientDoctorProfile /> },
        { path: "booking/:id", element: <PatientBooking /> },
        { path: "payment/:id", element: <PatientPayment /> },
        { path: "appointments", element: <PatientAppointments /> },
        { path: "qr", element: <PatientQRCode /> },
        { path: "settings", element: <PatientSettingsProfile /> },
        { path: "update-health", element: <PatientUpdateHealth /> },
        { path: "messages", element: <PatientMessages /> },
        { path: "records", element: <PatientMedicalRecords /> },
        { path: "stories", element: <PatientStories /> },
        { path: "stories/:id", element: <PatientStoryDetails /> },
        { path: "stories/:id/comments", element: <PatientAllComments /> },
        { path: "write-story", element: <WriteStory /> },
        { path: "prescription", element: <PatientPrescriptions /> },
        { path: "prescription/:id", element: <PrescriptionDetail /> },
        { path: "*", element: <NotFoundpataint /> },
      ]
    },

    {
      path: "/doctor",
      element: (
        <ProtectedRoute allowedRoles={["Doctor"]}>
          <DoctorLayout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <DoctorDashboard /> },
        { path: "dashboard", element: <DoctorDashboard /> },
        { path: "patients", element: <DoctorPatients /> },
        { path: "patients/:id", element: <DoctorPatientDetails /> },
        { path: "patients/:id/medical-records/new", element: <DoctorAddMedicalRecords /> },
        { path: "appointments", element: <DoctorAppointments /> },
        { path: "schedule", element: <DoctorScheduleSettings /> },
        { path: "settings", element: <DoctorSettingsProfile /> },
        { path: "messages", element: <DoctorMessages /> },
        { path: "prescription", element: <DoctorPrescription /> },
        { path: "stories", element: <DoctorStories /> },
        { path: "stories/:id", element: <DoctorStoryDetails /> },
        { path: "stories/:id/comments", element: <DoctorAllComments /> },
        { path: "*", element: <DoctorNotFound /> },
      ]
    },

    { path: "*", element: <NotFound /> }
  ]);

  return (
    <ThemeProvider>
      <AuthProvider>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <RouterProvider router={routing} />
          </Suspense>
        </ErrorBoundary>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
