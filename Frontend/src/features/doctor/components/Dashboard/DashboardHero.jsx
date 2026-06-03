import React from 'react';

const ArrowTrendUp = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="ml-1 shrink-0">
    <path d="M22 7L13.5 15.5L8.5 10.5L2 17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 7H22V13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowTrendDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="ml-1 shrink-0">
    <path d="M22 17L13.5 8.5L8.5 13.5L2 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 17H22V11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const StatCard = ({ label, value, delta, trend }) => {
  const isDown = trend === 'down';

  const bg = isDown ? 'bg-[#FEE2E2] dark:bg-[#1E293B]/80' : 'bg-[#DFFDDD]/80';
  const color = isDown ? 'text-[#DC2626]' : 'text-[#166534]';

  return (
    <article className="group flex flex-1 min-w-[160px] max-w-none md:max-w-[280px] flex-col justify-between rounded-[24px] bg-white dark:bg-[#111827]/60 p-5 backdrop-blur-xl border border-[#E5E7EB] dark:border-gray-700 shadow-[0_8px_32px_rgba(0,0,0,0.04)] transition-all duration-300 hover:bg-white dark:hover:bg-[#111827]/80 hover:shadow-[0_8px_32px_rgba(51,60,245,0.08)] hover:-translate-y-1 z-10">
      <h3 className="text-[15px] font-semibold text-[#4A5565] dark:text-[#E2E8F0] transition-colors group-hover:text-[#010218] dark:group-hover:text-[#E2E8F0]">
        {label}
      </h3>
      <div className="mt-5 flex items-end justify-between gap-2">
        <span className="text-[36px] font-bold leading-none text-[#333CF5]">
          {value}
        </span>
        <div className={`flex items-center rounded-full px-2.5 py-1 ${bg} ${color} shadow-sm dark:shadow-none`}>
          <span className="text-[13px] font-bold leading-none">{delta}</span>
          {isDown ? <ArrowTrendDown /> : <ArrowTrendUp />}
        </div>
      </div>
    </article>
  );
};

const DoctorInitials = ({ name }) => {
  const clean = String(name || 'Doctor').replace(/^dr\.?\s/i, '').trim();
  const initials = clean.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || 'D';
  return (
    <div className="w-full h-full rounded-full flex items-center justify-center bg-gradient-to-br from-[#333CF5] to-[#7C3AED] text-white text-[44px] font-bold">
      {initials}
    </div>
  );
};

const DashboardHero = ({ stats, doctorName = 'Doctor', doctorPhoto = '' }) => {
  const displayName = doctorName === 'Doctor' || /^dr\.?\s/i.test(doctorName)
    ? doctorName
    : `Dr. ${doctorName}`;

  return (
    <section
      aria-label="Doctor greeting and quick stats"
      className="relative flex w-full flex-col justify-between overflow-hidden rounded-[32px] p-6 sm:p-8 lg:p-10 min-h-[300px] bg-gradient-to-br from-[#E6F6FF] via-[#B2E6FD] to-[#333CF5]/40 dark:from-[#0B1120] dark:via-[#0F172A] dark:to-[#1e1b4b] shadow-[0_12px_40px_rgba(51,60,245,0.12)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] border border-transparent dark:border-gray-800"
    >
      {/* Decorative Glowing Orbs for that Premium Glassmorphism effect */}
      <div className="absolute -top-32 -right-20 w-96 h-96 bg-[#333CF5]/20 dark:bg-[#333CF5]/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/40 dark:bg-[#1E293B]/60 rounded-full blur-[60px] pointer-events-none" />
      <div className="absolute top-10 right-40 w-40 h-40 bg-[#B2E6FD]/60 dark:bg-[#38bdf8]/10 rounded-full blur-[50px] pointer-events-none" />

      {/* Top Banner Area: Text & Profile Avatar */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10 w-full">

        <div className="max-w-[600px]">
          <span className="inline-block px-3 py-1 mb-4 rounded-full bg-white/50 dark:bg-transparent backdrop-blur-md text-[#333CF5] dark:text-[#E6F6FF] text-[13px] font-bold uppercase tracking-wider border border-[#333CF5]/10 dark:border-gray-700 shadow-sm dark:shadow-none">
            Dashboard Overview
          </span>
          <h1 className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-[28px] md:text-[34px] font-medium text-[#364153] dark:text-gray-200">
              Good Morning,
            </span>
            <span className="text-[38px] md:text-[44px] font-extrabold text-[#333CF5] dark:text-[#60A5FA] drop-shadow-sm dark:shadow-none">
              {displayName}!
            </span>
          </h1>
        </div>

        {/* Premium Profile Avatar Component */}
        <div className="hidden sm:block relative shrink-0 transform transition-transform hover:scale-105 duration-500 ease-out cursor-pointer">
          <div className="relative w-[160px] h-[160px] lg:w-[190px] lg:h-[190px] rounded-full p-2.5 bg-white dark:bg-[#111827]/40 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.1)] border border-[#E5E7EB] dark:border-gray-700">
            {doctorPhoto ? (
              <img
                src={doctorPhoto}
                alt="Profile"
                className="w-full h-full object-cover rounded-full shadow-inner dark:shadow-none"
              />
            ) : (
              <DoctorInitials name={doctorName} />
            )}
          </div>
          {/* Online Status Badge */}
          <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 bg-white dark:bg-[#111827] px-3 py-1.5 rounded-full shadow-lg dark:shadow-none border border-gray-100 dark:border-gray-800 flex items-center gap-2 z-10 animate-fade-in-up">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-[13px] font-bold text-gray-700 dark:text-gray-300">Online</span>
          </div>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="relative z-10 w-full flex flex-wrap gap-4 md:gap-6">
        {stats.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            delta={card.delta}
            trend={card.trend}
          />
        ))}
      </div>
    </section>
  );
};

export default DashboardHero;
