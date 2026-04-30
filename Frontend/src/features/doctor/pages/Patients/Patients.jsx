import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusToast from '../../components/SettingsProfile/StatusToast';
import PatientListFilters from '../../components/Patients/PatientListFilters';
import PatientListHeader from '../../components/Patients/PatientListHeader';
import PatientListTable from '../../components/Patients/PatientListTable';
import { getDoctorPatients } from '../../../../services/doctorService';
import { activateChat } from '../../../../services/appointmentService';
import { resolveFileUrl } from '../../../../utils/api';

const normalizeRiskLevel = (riskLevel, riskScore) => {
  const raw = String(riskLevel || '').trim().toLowerCase();

  if (raw.includes('high')) return 'High';
  if (raw.includes('medium') || raw.includes('moderate')) return 'Medium';
  if (raw.includes('low')) return 'Low';

  const hasScore = riskScore !== null && riskScore !== undefined && String(riskScore).trim() !== '';
  if (hasScore) {
    const score = Number(riskScore);
    if (!Number.isFinite(score)) return 'Unknown';
    if (score < 30) return 'Low';
    if (score < 70) return 'Medium';
    return 'High';
  }

  return 'Unknown';
};

const resolvePatientAvatar = (name, profilePicture) => {
  const resolved = resolveFileUrl(profilePicture || '');
  if (resolved) return resolved;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Patient')}&background=E2E8F0&color=334155`;
};

const firstNonEmpty = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    return value;
  }
  return undefined;
};

const mapPatient = (p) => {
  const name = firstNonEmpty(p.patientName, p.PatientName, p.fullName, p.FullName, p.name, p.Name, '');
  const riskRaw = firstNonEmpty(p.riskLevel, p.RiskLevel);
  const riskScoreRaw = firstNonEmpty(p.riskScore, p.RiskScore);
  const riskLevel = normalizeRiskLevel(riskRaw, riskScoreRaw);

  const lastVisitRaw = firstNonEmpty(p.lastVisit, p.LastVisit, p.lastVisitDate, p.LastVisitDate);
  const lastVisitRelative = firstNonEmpty(p.lastVisitRelative, p.LastVisitRelative);

  return {
    id: firstNonEmpty(p.patientId, p.PatientId, p.id, p.Id),
    appointmentId: firstNonEmpty(p.appointmentId, p.AppointmentId, 0),
    name,
    email: firstNonEmpty(p.email, p.Email, ''),
    phone: firstNonEmpty(p.phoneNumber, p.PhoneNumber, ''),
    lastVisit: lastVisitRelative || (lastVisitRaw ? new Date(lastVisitRaw).toLocaleDateString() : '—'),
    riskLevel,
    bloodPressure: firstNonEmpty(p.bloodPressure, p.BloodPressure, '—'),
    heartRate: firstNonEmpty(p.heartRate, p.HeartRate, '—'),
    avatar: resolvePatientAvatar(name, firstNonEmpty(p.profilePicture, p.ProfilePicture, '')),
    status: firstNonEmpty(p.status, p.Status, 'Active'),
    gender: firstNonEmpty(p.gender, p.Gender, ''),
    age: firstNonEmpty(p.age, p.Age, ''),
    visitType: firstNonEmpty(p.visitType, p.VisitType, ''),
    chatExpired: firstNonEmpty(p.chatStatus, p.ChatStatus, ''),
  };
};

const Patients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [filters, setFilters] = useState({ risk: 'All', payment: 'All', lastVisit: 'Today' });
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState({ visible: false, title: '', message: '' });

  useEffect(() => {
    document.title = 'Patient List | PulseX Doctor';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Doctor patient list with risk indicators, visit details, and quick access to patient records.');
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const resp = await getDoctorPatients();
        const list = Array.isArray(resp) ? resp : (resp?.items || []);
        if (!ignore) setPatients(list.map(mapPatient));
      } catch (err) {
        console.error('Load doctor patients failed', err);
      }
    };
    load();
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    if (!toast.visible) return undefined;
    const timer = setTimeout(() => setToast((state) => ({ ...state, visible: false })), 2200);
    return () => clearTimeout(timer);
  }, [toast.visible]);

  const rows = useMemo(() => {
    return patients.filter((patient) => {
      const matchedName = patient.name.toLowerCase().includes(search.toLowerCase());
      const matchedRisk = filters.risk === 'All' || (patient.riskLevel || '').toLowerCase().includes(filters.risk.toLowerCase());
      const visitIsOnline = String(patient.visitType || '').toLowerCase() === 'online';
      const matchedPayment =
        filters.payment === 'All' ||
        (filters.payment === 'Online' && visitIsOnline) ||
        (filters.payment === 'Cash' && !visitIsOnline);
      return matchedName && matchedRisk && matchedPayment;
    });
  }, [patients, search, filters]);

  return (
    <main className="min-h-full p-6 sm:p-8" aria-label="Doctor patient list page">
      <StatusToast visible={toast.visible} title={toast.title} message={toast.message} />

      <div className="w-full flex-col flex gap-5">
        <PatientListHeader />
        <PatientListFilters
          filters={filters}
          onFilterChange={(key, value) => setFilters((state) => ({ ...state, [key]: value }))}
          search={search}
          onSearchChange={setSearch}
        />
        <PatientListTable
          rows={rows}
          onOpenProfile={(id) => navigate(`/doctor/patients/${id}`)}
          onOpenChat={async (patient) => {
            try {
              if (patient.appointmentId) {
                await activateChat(patient.appointmentId);
                setPatients((prev) =>
                  prev.map((p) => p.id === patient.id ? { ...p, chatExpired: '7 days left' } : p)
                );
              }
              setToast({ visible: true, title: 'Chat Opened', message: `Chat with ${patient.name} is now active for 7 days.` });
              navigate('/doctor/messages');
            } catch (err) {
              console.error('Activate chat failed', err);
              setToast({ visible: true, title: 'Error', message: 'Could not activate chat. Please try again.' });
            }
          }}
        />
      </div>
    </main>
  );
};

export default Patients;
