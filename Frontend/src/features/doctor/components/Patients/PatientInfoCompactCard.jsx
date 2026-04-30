const getRiskClass = (riskLevel) => {
  const normalized = String(riskLevel || '').toLowerCase();
  if (normalized.includes('high')) return 'bg-[#FEE2E2] text-[#B91C1C]';
  if (normalized.includes('medium') || normalized.includes('moderate')) return 'bg-[#FEF3C7] text-[#92400E]';
  if (normalized.includes('low')) return 'bg-[#DCFCE7] text-[#166534]';
  return 'bg-[#E5E7EB] text-[#4B5563]';
};

const PatientInfoCompactCard = ({ patient }) => {
  return (
    <section className="rounded-2xl border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-[#111827] p-4" aria-labelledby="patient-info-card-title">
      <h2 id="patient-info-card-title" className="text-[24px] font-bold text-black-main-text dark:text-[#E2E8F0]">Patient Information</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[70px_1fr_1fr_1fr_1fr] items-center">
        <img src={patient.avatar} alt={patient.name} className="h-14 w-14 rounded-full object-cover" />
        <div><p className="text-[12px] text-[#6B7280]">Patient Name</p><p className="text-[14px] font-semibold">{patient.name}</p></div>
        <div><p className="text-[12px] text-[#6B7280]">Age</p><p className="text-[14px] font-semibold">{patient.age} years old</p></div>
        <div><p className="text-[12px] text-[#6B7280]">Gender</p><p className="text-[14px] font-semibold">{patient.gender}</p></div>
        <div><p className="text-[12px] text-[#6B7280]">Risk Level</p><p className={`inline-block rounded-full px-2 py-0.5 text-[12px] font-semibold ${getRiskClass(patient.riskLevel)}`}>{patient.riskLevel}</p></div>
      </div>
    </section>
  );
};

export default PatientInfoCompactCard;
