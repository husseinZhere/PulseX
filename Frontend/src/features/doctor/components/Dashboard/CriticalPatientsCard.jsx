import React from 'react';

const ChevronRight = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const riskClass = (risk) => {
  if (risk === 'High Risk') return 'bg-[#FEE2E2] dark:bg-[#1E293B] text-[#B91C1C]';
  if (risk === 'Moderate') return 'bg-[#FEF9C3] dark:bg-[#1E293B] text-[#A16207]';
  return 'bg-[#DCFCE7] text-[#15803D]';
};

const CriticalPatientsCard = ({ patients, onViewMore }) => {
  if (!patients.length) {
    return (
      <section className="rounded-[24px] border-[0.5px] border-[#D7D8DC] dark:border-gray-700 bg-white dark:bg-[#111827] p-6 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] h-full" aria-labelledby="critical-title-empty">
        <div className="flex items-center justify-between rounded-[16px] bg-[#F0FDF4] dark:bg-[#052e16]/40 px-4 py-3 mb-2">
          <h2 id="critical-title-empty" className="text-[15px] font-bold text-[#166534] dark:text-[#86efac]">Critical Patients</h2>
          <span className="text-[11px] font-semibold text-[#16a34a] dark:text-[#4ade80] bg-[#dcfce7] dark:bg-[#052e16] px-2.5 py-0.5 rounded-full">All Clear</span>
        </div>
        <div className="flex flex-col items-center justify-center py-7 gap-3">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7] dark:from-[#052e16]/60 dark:to-[#14532d]/40 flex items-center justify-center shadow-sm">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#BBF7D0" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="9 12 11 14 15 10" stroke="#15803D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-[17px] font-bold text-[#010218] dark:text-[#E2E8F0]">All Patients Stable</p>
            <p className="mt-1 text-[12.5px] text-[#9CA3AF] leading-relaxed max-w-[190px] mx-auto">Great news! No critical patients at this time.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[24px] border-[0.5px] border-[#D7D8DC] dark:border-gray-700 bg-white dark:bg-[#111827] p-6 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] h-full" aria-labelledby="critical-title">
      {/* Header */}
      <div className="flex items-center justify-between rounded-[16px] bg-[#F1F2F5] dark:bg-[#1E293B] px-5 py-[11px]">
        <h2 id="critical-title" className="text-[15.5px] font-bold text-[#010218] dark:text-[#E2E8F0]">Critical Patients</h2>
        <button
          type="button"
          onClick={onViewMore}
          className="cursor-pointer group flex items-center gap-0.5 text-[12.5px] font-medium text-[#010218] dark:text-[#E2E8F0] transition-opacity hover:opacity-70"
          aria-label="View more critical patients"
        >
          View More
          <ChevronRight className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Patient List */}
      <div className="mt-3 flex flex-col">
        {patients.map((patient, index) => (
          <article
            key={patient.id}
            className={`flex items-center justify-between py-[16px] transition-colors hover:bg-gray-50 dark:hover:bg-[#1E293B] dark:bg-[#111827]/50 ${index !== patients.length - 1 ? 'border-b border-[#E5E7EB] dark:border-gray-700' : ''}`}
          >
            <div className="flex items-center gap-3.5 pl-1">
              {patient.avatar ? (
                <img src={patient.avatar} alt={patient.name} className="h-[44px] w-[44px] rounded-full object-cover border-[0.5px] border-black/10" />
              ) : (
                <div className="h-[44px] w-[44px] rounded-full bg-[#EEF2FF] text-[#333CF5] flex items-center justify-center text-[15px] font-bold border-[0.5px] border-black/10">
                  {patient.name?.charAt(0)?.toUpperCase() || 'P'}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-[16px] font-bold text-[#010218] dark:text-[#E2E8F0] leading-snug">{patient.name}</span>
                <span className="text-[13.5px] text-[#757575] mt-0.5">{patient.date}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pr-1">
              <span className={`rounded-xl px-3 py-1 text-[12px] font-semibold ${riskClass(patient.risk)}`}>
                {patient.risk}
              </span>
              <button
                type="button"
                aria-label={`View details for ${patient.name}`}
                className="cursor-pointer group flex h-7 w-7 items-center justify-center rounded-full text-[#010218] dark:text-[#E2E8F0] transition-all hover:bg-[#F1F2F5] dark:bg-[#1E293B]"
              >
                <ChevronRight className="w-[15px] h-[15px] stroke-[2.5] transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default CriticalPatientsCard;
