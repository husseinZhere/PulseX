import React, { useEffect, useState } from 'react';
import ConfirmModal from '../../../admin/components/ConfirmModal/ConfirmModal';
import AppointmentsHeader from '../../components/Appointments/AppointmentsHeader';
import AppointmentsStats from '../../components/Appointments/AppointmentsStats';
import AppointmentsTabs from '../../components/Appointments/AppointmentsTabs';
import AppointmentsList from '../../components/Appointments/AppointmentsList';
import {
  getMyAppointments,
  updateAppointmentStatus,
} from '../../../../services/appointmentService';
import { resolveFileUrl } from '../../../../utils/api';

const mapStatus = (s) => {
  const v = String(s || '').toLowerCase();
  if (v.includes('complete')) return 'Completed';
  if (v.includes('cancel')) return 'Cancelled';
  return 'Upcoming';
};

const isOnlinePayment = (pm) => {
  if (pm === null || pm === undefined) return false;
  const s = String(pm).toLowerCase();
  return s === '2' || s.includes('credit') || s.includes('online') || s.includes('card');
};

const mapAppointment = (a) => {
  const date = a.appointmentDate ? new Date(a.appointmentDate) : null;
  const online = isOnlinePayment(a.paymentMethod) || a.paymentStatus === 'Paid';
  return {
    id: a.id,
    doc: a.doctorName || 'Doctor',
    date: date ? date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
    time: a.timeSlot || (date ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''),
    method: online ? 'Online Payment' : 'Cash at Clinic',
    isOnline: online,
    loc: a.clinicLocation || 'Clinic',
    status: mapStatus(a.status),
    img: resolveFileUrl(a.doctorProfilePicture || a.doctorAvatar || ''),
  };
};

const PatientAppointments = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [appointments, setAppointments] = useState([]);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    document.title = 'Appointments | PulseX';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'View your scheduled and completed appointments.');
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const data = await getMyAppointments();
        const list = Array.isArray(data) ? data : (data?.items || data?.appointments || []);
        if (!ignore) setAppointments(list.map(mapAppointment));
      } catch (err) {
        console.error('Load appointments failed', err);
      }
    };
    load();
    return () => { ignore = true; };
  }, []);

  const upcoming = appointments.filter((a) => a.status === 'Upcoming');
  const completed = appointments.filter((a) => a.status === 'Completed');
  const list = activeTab === 'upcoming' ? upcoming : completed;

  const handleConfirmCancel = async () => {
    const targetId = cancelTarget;
    setCancelTarget(null);
    try {
      await updateAppointmentStatus(targetId, { status: 4 });
      setAppointments((prev) =>
        prev.map((a) => (a.id === targetId ? { ...a, status: 'Cancelled' } : a))
      );
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Cancel failed', err);
    }
  };

  return (
    <main
      className="min-h-screen flex flex-col gap-6 p-6 sm:p-[24px]"
    >
      <ConfirmModal
        isOpen={!!cancelTarget}
        title="Cancel Appointment?"
        desc="Are you sure you want to cancel this appointment? This action cannot be undone."
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelTarget(null)}
      />

      <AppointmentsHeader />

      <AppointmentsStats
        upcomingCount={upcoming.length}
        completedCount={completed.length}
      />

      <AppointmentsTabs activeTab={activeTab} onChange={setActiveTab} />

      <AppointmentsList
        list={list}
        activeTab={activeTab}
        onCancel={setCancelTarget}
      />

      <footer className="sr-only">
        <p>End of appointments page.</p>
      </footer>
    </main>
  );
};

export default PatientAppointments;
