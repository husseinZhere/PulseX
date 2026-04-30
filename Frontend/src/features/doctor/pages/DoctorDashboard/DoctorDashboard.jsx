import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CriticalPatientsCard from '../../components/Dashboard/CriticalPatientsCard';
import DashboardHero from '../../components/Dashboard/DashboardHero';
import PatientMessagesCard from '../../components/Dashboard/PatientMessagesCard';
import TodayAppointmentsCard from '../../components/Dashboard/TodayAppointmentsCard';
import WeeklyOverviewCard from '../../components/Dashboard/WeeklyOverviewCard';
import {
  getDoctorDashboard,
  getDoctorPatients,
} from '../../../../services/doctorService';
import { resolveFileUrl } from '../../../../utils/api';

const resolveAvatar = (path, fallback = '') => {
  if (!path) return fallback;
  if (String(path).startsWith('data:')) return path;
  return resolveFileUrl(path);
};

const formatPercent = (value) => {
  const numeric = Number(value || 0);
  return `${numeric > 0 ? '+' : ''}${Math.round(numeric)}%`;
};

const trendFromPercent = (value, positiveIsGood = true) => {
  const numeric = Number(value || 0);
  if (numeric === 0) return 'up';
  return positiveIsGood
    ? (numeric > 0 ? 'up' : 'down')
    : (numeric > 0 ? 'down' : 'up');
};

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [dashboard, setDashboard] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Doctor Dashboard | PulseX';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Doctor dashboard showing stats, appointments, messages, and critical patients.');
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true);
      try {
        const [d, pList] = await Promise.all([
          getDoctorDashboard().catch(() => null),
          getDoctorPatients().catch(() => []),
        ]);
        if (ignore) return;
        setDashboard(d || null);
        setPatients(Array.isArray(pList) ? pList : (pList?.items || []));
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, []);

  const hasData = searchParams.get('mode') !== 'empty' && !loading;

  const stats = [
    {
      label: 'Total Patients',
      value: dashboard?.totalPatients ?? patients.length,
      delta: formatPercent(dashboard?.patientsGrowthPercent),
      trend: trendFromPercent(dashboard?.patientsGrowthPercent),
    },
    {
      label: 'Critical Cases',
      value: dashboard?.criticalCases ?? 0,
      delta: formatPercent(dashboard?.criticalGrowthPercent),
      trend: trendFromPercent(dashboard?.criticalGrowthPercent, false),
    },
    {
      label: 'Appointments',
      value: dashboard?.todayAppointments ?? 0,
      delta: formatPercent(dashboard?.appointmentsGrowthPercent ?? dashboard?.weeklyOverview?.changePercentage),
      trend: trendFromPercent(dashboard?.appointmentsGrowthPercent ?? dashboard?.weeklyOverview?.changePercentage),
    },
  ];

  const todayList = (dashboard?.todayAppointmentsList || dashboard?.nextAppointments || []).map((a) => ({
    id: a.id,
    time: a.appointmentDate
      ? new Date(a.appointmentDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      : '',
    name: a.patientName || '',
    slot: a.appointmentTime || a.timeSlot || '',
    status: a.status || '',
    avatar: resolveAvatar(a.patientProfilePicture || a.patientAvatar || ''),
  }));

  const messages = (dashboard?.recentMessages || []).map((m) => ({
    id: m.messageId || m.id,
    appointmentId: m.appointmentId,
    patientId: m.patientId,
    name: m.patientName || m.senderName || '',
    text: m.messagePreview || m.content || '',
    time: m.timeAgo || (m.sentAt ? new Date(m.sentAt).toLocaleString() : ''),
    avatar: resolveAvatar(m.patientProfilePicture || m.senderAvatar || ''),
  }));

  const critical = (dashboard?.criticalPatients || []).map((p) => ({
    id: p.patientId || p.id,
    name: p.patientName || p.fullName || '',
    date: p.lastVisit ? new Date(p.lastVisit).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) : '',
    risk: p.riskLevel || 'Low Risk',
    score: p.riskScore,
    avatar: resolveAvatar(p.profilePicture || ''),
  }));

  const doctorName = dashboard?.doctorName || 'Doctor';
  const doctorPhoto = resolveAvatar(dashboard?.doctorProfilePicture || '', '/image/doctor-hero.jpg');

  return (
    <main className="min-h-full p-6 sm:p-8 space-y-6" aria-label="Doctor dashboard page">

      <div className="w-full space-y-6">
        <DashboardHero
          stats={hasData ? stats : stats.map((c) => ({ ...c, value: 0, delta: '0%' }))}
          doctorName={doctorName}
          doctorPhoto={doctorPhoto}
        />

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.95fr_1fr]">
          <WeeklyOverviewCard hasData={hasData} overview={dashboard?.weeklyOverview} />
          <PatientMessagesCard
            messages={hasData ? messages : []}
            onViewAll={() => navigate('/doctor/messages')}
          />
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.05fr_1fr]">
          <TodayAppointmentsCard
            appointments={hasData ? todayList : []}
            onViewCalendar={() => navigate('/doctor/schedule')}
          />
          <CriticalPatientsCard
            patients={hasData ? critical : []}
            onViewMore={() => navigate('/doctor/patients')}
          />
        </section>
      </div>
    </main>
  );
};

export default DoctorDashboard;
