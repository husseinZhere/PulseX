import React from 'react';

const CalendarIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <path d="M10 15l2 2 4-4" />
  </svg>
);

const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const AppointmentRow = ({ time, name, slot, avatar, colorType, offset, isBreak }) => {
  const colors = {
    peach: 'bg-[#F5E5E5] dark:bg-[#0B1120]',
    green: 'bg-[#E5F5E6] dark:bg-[#0B1120]',
    mint: 'bg-[#C9F3EC] dark:bg-[#0B1120]',
    blue: 'bg-[#C1E2F4] dark:bg-[#0B1120]',
  };
  const bgClass = colors[colorType] || colors.peach;

  return (
    <div className="relative flex min-h-[56px] items-center py-2">
      <span className="w-[65px] flex-shrink-0 text-[13px] font-semibold text-white whitespace-nowrap tracking-wide">
        {time}
      </span>

      {/* Dashed line */}
      <div className="absolute left-[75px] right-3 top-1/2 h-[1px] -translate-y-1/2 border-t-[1.5px] border-dashed border-white/50 dark:border-gray-600" />

      {isBreak ? (
        <div className="relative z-10 flex h-[30px] items-center justify-center rounded-[30px] bg-[#0913C3] dark:bg-[#333CF5] px-5 shadow-[0px_4px_12px_rgba(0,0,0,0.12)] ml-[10%] sm:ml-[25%] w-fit">
          <span className="text-[12px] font-semibold text-white tracking-wide">Break Time</span>
        </div>
      ) : (
        <div
          className={`relative z-10 flex w-auto max-w-full sm:max-w-[240px] items-center gap-3 rounded-[16px] px-3.5 py-2 shadow-sm dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-transform hover:-translate-y-0.5 border border-transparent dark:border-gray-800
            ${bgClass} 
            ${offset === 'right' ? 'ml-auto mr-0 sm:mr-3' : 'ml-[2%] mr-auto'}
          `}
        >
          {avatar ? (
            <img src={avatar} alt={name} className="h-[36px] w-[36px] shrink-0 rounded-full border-[1.5px] border-[#010218] dark:border-gray-800 object-cover shadow-sm dark:shadow-none" />
          ) : (
            <div className="h-[36px] w-[36px] shrink-0 rounded-full border-[1.5px] border-[#010218] dark:border-gray-800 bg-white/80 text-[#333CF5] flex items-center justify-center text-[13px] font-bold shadow-sm dark:shadow-none">
              {name?.charAt(0)?.toUpperCase() || 'P'}
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="text-[15px] sm:text-[16px] font-bold text-[#010218] dark:text-[#E2E8F0] tracking-tight truncate">{name}</span>
            <div className="flex items-center gap-1.5 mt-0.5 text-[#010218] dark:text-gray-400 shrink-0">
              <ClockIcon />
              <span className="text-[10px] font-medium opacity-90 whitespace-nowrap">{slot}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TodayAppointmentsCard = ({ appointments, onViewCalendar }) => {
  if (!appointments.length) {
    return (
      <section className="rounded-[24px] bg-gradient-to-br from-[#77A2F3] to-[#4F79E0] p-6 lg:p-8 text-white shadow-lg dark:shadow-none overflow-hidden relative" aria-labelledby="appointments-title-empty">
        <div className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-10 -left-6 h-24 w-24 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute top-1/2 right-4 h-16 w-16 rounded-full bg-white/5" />

        <div className="flex items-center gap-3 mb-6 relative">
          <h2 id="appointments-title-empty" className="text-[22px] font-bold">Today Appointments</h2>
          <CalendarIcon />
        </div>

        <div className="relative rounded-2xl border border-white/25 bg-white/15 backdrop-blur-sm p-6 text-center">
          <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <path d="M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h.01" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-[20px] font-bold">Free Day!</p>
          <p className="mt-1.5 text-[13px] text-white/70">No appointments scheduled for today.</p>
          <button
            type="button"
            onClick={onViewCalendar}
            className="cursor-pointer mt-5 px-6 py-2.5 rounded-xl bg-white text-[#4F79E0] text-[13px] font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
          >
            View Calendar
          </button>
        </div>
      </section>
    );
  }

  const themeMap = ['peach', 'green', 'mint', 'blue'];
  const list = appointments.map((app, index) => ({
    ...app,
    colorType: themeMap[index % themeMap.length],
    offset: index % 2 !== 0 ? 'right' : 'left',
  }));

  return (
    <section className="rounded-[24px] bg-[#77A2F3] dark:bg-[#111827] p-6 lg:p-8 shadow-sm dark:shadow-none overflow-hidden" aria-labelledby="appointments-title">
      <div className="flex items-center gap-3 mb-7">
        <h2 id="appointments-title" className="text-[22px] font-bold text-white tracking-wide">Today Appointments</h2>
        <CalendarIcon />
      </div>
      <div className="flex flex-col gap-1.5">
        {list.map((item) => (
          <AppointmentRow
            key={item.id}
            time={item.time}
            name={item.name}
            slot={item.slot}
            avatar={item.avatar}
            colorType={item.colorType}
            offset={item.offset}
            isBreak={item.isBreak}
          />
        ))}
      </div>
    </section>
  );
};

export default TodayAppointmentsCard;
