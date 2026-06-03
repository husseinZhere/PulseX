import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import usePatientData from '../../../../PatientHooks/usePatientData';

const withDrPrefix = (name) => {
  if (!name) return '';
  const t = name.trim();
  return /^dr\.?\s/i.test(t) ? t : `DR. ${t}`;
};
import DashboardWelcome from '../../components/PatientDashboard/DashboardWelcome';
import VitalsSection from '../../components/PatientDashboard/VitalsSection';
import LeftColumn from '../../components/PatientDashboard/LeftColumn';
import RightColumn from '../../components/PatientDashboard/RightColumn';

/* ════════════════════════════════════
   3. Main Patient Dashboard
════════════════════════════════════ */
const PatientDashboard = () => {
  const { patient, isLoading } = usePatientData();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Patient Dashboard | PulseX';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'View your heart health overview, vitals, and recent updates in your patient dashboard.');
    }
  }, []);

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-[#FAFBFF] dark:bg-[#0B1120] text-[#333CF5] font-bold font-['Roboto']">Loading Dashboard…</div>;

  const v = patient.vitals;
  const doctors = (patient.featuredDoctors || []).map((doctor, index) => ({
    id: doctor.id ?? index,
    name: withDrPrefix(doctor.name || ''),
    loc: doctor.location || doctor.specialization || '',
    rating: Number(doctor.rating) || 0,
    img: doctor.img,
  }));

  return (
    <div className="min-h-screen bg-[#FAFBFF] dark:bg-gradient-to-b dark:from-[#0B1120] dark:to-[#0A1428]">
      <header className="pb-8 pt-4 md:px-6 md:pt-6 px-6">
        <DashboardWelcome patientName={patient.name} />
      </header>

      <main className="flex flex-col gap-6 px-4 pb-4 md:px-6 md:pb-6">
        <section aria-labelledby="dashboard-vitals-heading">
          <h2 id="dashboard-vitals-heading" className="sr-only">Vital signs</h2>
          <VitalsSection vitals={v} />
        </section>

        <section aria-labelledby="dashboard-details-heading" className="flex flex-col xl:flex-row gap-6 items-start w-full">
          <h2 id="dashboard-details-heading" className="sr-only">Detailed health overview</h2>
          <article className="w-full xl:flex-1 min-w-0" aria-label="Primary dashboard content">
            <LeftColumn
              navigate={navigate}
              doctors={doctors}
              weeklyData={patient.weeklyData}
              accuracy={patient.aiRisk?.accuracy}
            />
          </article>
          <aside className="w-full xl:w-[380px] shrink-0" aria-label="Secondary dashboard insights">
            <RightColumn navigate={navigate} patient={patient} />
          </aside>
        </section>
      </main>

      <footer className="px-4 pb-4 md:px-6 md:pb-6">
        <p className="text-xs font-normal font-['Roboto'] text-neutral-500 dark:text-gray-400">Last health sync: today</p>
      </footer>
    </div>
  );
};

export default PatientDashboard;
