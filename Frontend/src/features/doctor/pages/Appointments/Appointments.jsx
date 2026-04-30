import React, { useEffect, useMemo, useState } from 'react';
import ConfirmModal from '../../../admin/components/ConfirmModal/ConfirmModal';
import AppointmentsHeader from '../../components/Appointments/AppointmentsHeader';
import AppointmentsStats from '../../components/Appointments/AppointmentsStats';
import AppointmentsTabs from '../../components/Appointments/AppointmentsTabs';
import AppointmentsTimeline from '../../components/Appointments/AppointmentsTimeline';

const INITIAL_UPCOMING = [
  {
    id: 1,
    type: 'appointment',
    time: '08:00',
    patient: 'Sara Kamel',
    room: '203',
    tag: 'Checkup',
    tagClass: 'bg-[#DBEAFE] text-[#2563EB]',
    img: 'https://randomuser.me/api/portraits/women/33.jpg',
  },
  {
    id: 2,
    type: 'appointment',
    time: '08:30',
    patient: 'Ali Mohamed',
    room: '105',
    tag: 'Follow-up',
    tagClass: 'bg-[#F3E8FF] dark:bg-[#1E293B] text-[#9333EA]',
    img: 'https://randomuser.me/api/portraits/men/75.jpg',
  },
  {
    id: 3,
    type: 'break',
    duration: '30 minutes',
  },
  {
    id: 4,
    type: 'appointment',
    time: '09:00',
    patient: 'Soha Ali',
    room: '301',
    tag: 'Emergency',
    tagClass: 'bg-[#FFEDD5] dark:bg-[#1E293B] text-[#EA580C]',
    img: 'https://randomuser.me/api/portraits/women/65.jpg',
  },
  {
    id: 5,
    type: 'appointment',
    time: '09:30',
    patient: 'Waled Omar',
    room: '205',
    tag: 'Checkup',
    tagClass: 'bg-[#DBEAFE] text-[#2563EB]',
    img: 'https://randomuser.me/api/portraits/men/46.jpg',
  },
];

const COMPLETED_GROUPS = [
  {
    dateLabel: 'Monday, Oct 22',
    items: [
      {
        id: 101,
        patient: 'Sara Kamel',
        when: 'Today',
        room: '203',
        img: 'https://randomuser.me/api/portraits/women/33.jpg',
      },
      {
        id: 102,
        patient: 'Ali Mohamed',
        when: 'Today',
        room: '105',
        img: 'https://randomuser.me/api/portraits/men/75.jpg',
      },
      {
        id: 103,
        patient: 'Soha Ali',
        when: 'Oct 22, 2025 2:00 PM',
        room: '201',
        img: 'https://randomuser.me/api/portraits/women/65.jpg',
      },
    ],
  },
  {
    dateLabel: 'Sunday, Oct 21',
    items: [
      {
        id: 104,
        patient: 'Waled Omar',
        when: 'Oct 21, 2025 11:00 AM',
        room: '204',
        img: 'https://randomuser.me/api/portraits/men/46.jpg',
      },
      {
        id: 105,
        patient: 'Yousra Adel',
        when: 'Oct 21, 2025 3:30 PM',
        room: '322',
        img: 'https://randomuser.me/api/portraits/women/24.jpg',
      },
    ],
  },
];

import { useNavigate } from 'react-router-dom';
import { getMyAppointments, updateAppointmentStatus } from '../../../../services/appointmentService';
import { resolveFileUrl } from '../../../../utils/api';

const tagForType = (status) => {
  const s = (status || '').toLowerCase();
  if (s.includes('cancel')) return { label: 'Cancelled', cls: 'bg-[#FEE2E2] text-[#B91C1C]' };
  if (s.includes('complete')) return { label: 'Completed', cls: 'bg-[#DCFCE7] text-[#166534]' };
  return { label: 'Checkup', cls: 'bg-[#DBEAFE] text-[#2563EB]' };
};

const isOnlinePayment = (pm) => {
  if (pm === null || pm === undefined) return false;
  const s = String(pm).toLowerCase();
  return s === '2' || s.includes('credit') || s.includes('online') || s.includes('card');
};

const mapUpcomingApi = (a) => {
  const d = a.appointmentDate ? new Date(a.appointmentDate) : null;
  return {
    id: a.id,
    type: 'appointment',
    time: d ? d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '',
    patient: a.patientName || '',
    room: a.room || '—',
    tag: tagForType(a.status).label,
    tagClass: tagForType(a.status).cls,
    img: resolveFileUrl(a.patientProfilePicture || a.patientAvatar || ''),
    patientId: a.patientId,
    isOnline: isOnlinePayment(a.paymentMethod),
  };
};

const DoctorAppointments = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [upcomingList, setUpcomingList] = useState([]);
  const [completedGroups, setCompletedGroups] = useState([]);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [flashMessage, setFlashMessage] = useState('');

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const data = await getMyAppointments();
        const list = Array.isArray(data) ? data : (data?.items || data?.appointments || []);
        const upcoming = list
          .filter((a) => String(a.status || '').toLowerCase() === 'scheduled')
          .map(mapUpcomingApi);
        const completed = list
          .filter((a) => String(a.status || '').toLowerCase() === 'completed');

        const byDate = {};
        completed.forEach((a) => {
          const d = a.appointmentDate ? new Date(a.appointmentDate) : null;
          const key = d ? d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: '2-digit' }) : 'Recent';
          if (!byDate[key]) byDate[key] = [];
          byDate[key].push({
            id: a.id,
            time: d ? d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '',
            patient: a.patientName || '',
            room: a.room || '—',
            tag: 'Completed',
            tagClass: 'bg-[#DCFCE7] text-[#166534]',
            img: resolveFileUrl(a.patientProfilePicture || a.patientAvatar || ''),
            patientId: a.patientId,
            isOnline: isOnlinePayment(a.paymentMethod),
          });
        });
        const groups = Object.entries(byDate).map(([dateLabel, items]) => ({ dateLabel, items }));
        if (!ignore) {
          setUpcomingList(upcoming);
          setCompletedGroups(groups);
        }
      } catch (err) {
        console.error('Load doctor appointments failed', err);
      }
    };
    load();
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    document.title = 'Doctor Appointments | PulseX';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Manage doctor appointments with upcoming and completed timelines.');
    }
  }, []);

  const upcomingCount = useMemo(
    () => upcomingList.filter((item) => item.type === 'appointment').length,
    [upcomingList]
  );

  const completedCount = useMemo(
    () => completedGroups.reduce((sum, group) => sum + group.items.length, 0),
    [completedGroups]
  );

  const handleConfirmCancel = async () => {
    const targetId = cancelTarget;
    setCancelTarget(null);
    try {
      await updateAppointmentStatus(targetId, { status: 2 });
      setUpcomingList((prev) => prev.filter((item) => item.id !== targetId));
      setFlashMessage('Appointment cancelled successfully.');
    } catch (err) {
      setFlashMessage(err?.response?.data?.message || 'Cancel failed.');
    } finally {
      setTimeout(() => setFlashMessage(''), 2200);
    }
  };

  const handleViewRecord = (id) => {
    navigate(`/doctor/patients/${id}`);
  };

  return (
    <main
      className="flex flex-col gap-5 p-4 sm:p-[24px]"
      style={{
        '--appt-muted': '#757575',
      }}
    >
      <ConfirmModal
        isOpen={!!cancelTarget}
        title="Cancel Appointment?"
        desc="Are you sure you want to cancel this appointment?"
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelTarget(null)}
      />

      {flashMessage && (
        <section className="fixed top-6 right-6 z-[1200] bg-black-main-text text-white px-4 py-2 rounded-xl shadow-lg dark:shadow-none text-[13px]">
          {flashMessage}
        </section>
      )}

      <AppointmentsHeader />

      <AppointmentsStats
        upcomingCount={upcomingCount}
        completedCount={completedCount}
      />

      <AppointmentsTabs activeTab={activeTab} onChange={setActiveTab} />

      <AppointmentsTimeline
        activeTab={activeTab}
        upcomingList={upcomingList}
        completedGroups={completedGroups}
        onCancel={setCancelTarget}
        onViewRecord={handleViewRecord}
      />

      <footer className="sr-only">
        <p>End of doctor appointments page.</p>
      </footer>
    </main>
  );
};

export default DoctorAppointments;
