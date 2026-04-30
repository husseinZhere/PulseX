import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const toIso = (year, month, day) =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const AvailabilityCalendar = ({
  currentMonth,
  selectedDate,
  availableDates,
  todayIso,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}) => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthLabel = `${MONTH_NAMES[month]} ${year}`;

  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Grid: leading empty cells then numbered days
  const cells = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <section
      className="relative overflow-hidden rounded-[22px] border border-[#E6ECF5] dark:border-[#29354A] bg-white dark:bg-[#0E172A] p-4 sm:p-5 shadow-[0_12px_30px_rgba(2,6,23,0.05)] dark:shadow-[0_14px_36px_rgba(2,6,23,0.4)]"
      aria-label="Select available days"
    >
      <div className="pointer-events-none absolute -top-20 -left-10 h-36 w-36 rounded-full bg-brand-main/8 blur-3xl" />

      {/* Header row */}
      <div className="relative flex items-center justify-between mb-3">
        <h2 className="text-[24px] font-semibold text-black-main-text dark:text-[#E2E8F0]">
          Select Available Days
        </h2>
        <div className="flex items-center gap-2 text-[#9CA3AF]">
          <button
            type="button"
            onClick={onPrevMonth}
            className="h-8 w-8 rounded-xl border border-[#E3E9F2] dark:border-[#2A3448] bg-white dark:bg-[#101D33] flex items-center justify-center cursor-pointer hover:border-brand-main/50 transition-colors"
            aria-label="Previous month"
          >
            <HiChevronLeft />
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            className="h-8 w-8 rounded-xl border border-[#E3E9F2] dark:border-[#2A3448] bg-white dark:bg-[#101D33] flex items-center justify-center cursor-pointer hover:border-brand-main/50 transition-colors"
            aria-label="Next month"
          >
            <HiChevronRight />
          </button>
        </div>
      </div>

      {/* Month label pill */}
      <p className="inline-flex items-center rounded-full border border-[#DEE8F5] dark:border-[#2B3750] bg-[#F6FAFF] dark:bg-[#111E35] px-3 py-1 text-[14px] text-[#374151] dark:text-[#C9D4E7] font-medium mb-4">
        {monthLabel}
      </p>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2">
        {WEEK_DAYS.map((d) => (
          <span key={d} className="text-center text-[11px] font-medium tracking-wide text-[#9CA3AF]">
            {d}
          </span>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {cells.map((day, idx) => {
          if (day === null) return <div key={`e-${idx}`} />;

          const iso = toIso(year, month, day);
          const isAvailable = availableDates.has(iso);
          const isSelected = selectedDate === iso;
          const isToday = todayIso === iso;

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelectDate(iso)}
              className={`h-11 sm:h-12 rounded-[14px] border text-[13px] font-semibold transition-all cursor-pointer ${
                isAvailable
                  ? 'border-brand-main bg-brand-main text-white shadow-[0_12px_24px_rgba(51,60,245,0.34)]'
                  : isSelected
                  ? 'border-brand-main/35 bg-[#E9EEFF] dark:bg-[#182440] text-brand-main'
                  : isToday
                  ? 'border-brand-main/40 bg-[#F0F3FF] dark:bg-[#141E35] text-brand-main font-bold'
                  : 'border-[#E7EEF7] dark:border-[#243047] bg-[#F9FBFF] dark:bg-[#101C31] text-[#374151] dark:text-[#AAB6CC] hover:border-brand-main/30 hover:text-brand-main'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-[#E8EEF7] dark:border-[#263247] flex items-center gap-4">
        <span className="inline-flex items-center gap-2 text-[12px] text-[#6B7280] dark:text-[#9AA7C0]">
          <span className="w-3 h-3 rounded-sm bg-brand-main" /> Available
        </span>
        <span className="inline-flex items-center gap-2 text-[12px] text-[#6B7280] dark:text-[#9AA7C0]">
          <span className="w-3 h-3 rounded-sm border border-brand-main/40 bg-[#F0F3FF] dark:bg-[#141E35]" /> Today
        </span>
      </div>
    </section>
  );
};

export default AvailabilityCalendar;