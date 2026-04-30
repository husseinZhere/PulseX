import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

const BookingCalendar = ({
  calHeaderLabel,
  weekDays,
  daysInMonth,
  firstDayOfWeek,
  availableDays,
  isSelectedDay,
  onPrev,
  onNext,
  onDayClick,
}) => {
  return (
    <section className="flex-1" aria-label="Calendar">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <button
          onClick={onPrev}
          className="cursor-pointer w-9 h-9 rounded-full bg-gray-50 dark:bg-[#0F172A] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#1F2937] transition"
          aria-label="Previous month"
        >
          <HiChevronLeft className="text-gray-400 dark:text-gray-300" />
        </button>
        <span className="text-base font-bold text-black-main-text dark:text-[#E2E8F0]">{calHeaderLabel}</span>
        <button
          onClick={onNext}
          className="cursor-pointer w-9 h-9 rounded-full bg-brand-main flex items-center justify-center shadow-[0_8px_18px_rgba(59,91,254,0.30)] dark:shadow-[0_8px_18px_rgba(37,44,191,0.45)]"
          aria-label="Next month"
        >
          <HiChevronRight className="text-white" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-4">
        {weekDays.map((d) => (
          <span key={d} className="text-center text-[11px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const isAvail = availableDays.has(day);
          const selected = isSelectedDay(day);
          return (
            <button
              key={day}
              onClick={() => onDayClick(day)}
              disabled={!isAvail}
              className={`aspect-square w-full max-w-[40px] mx-auto rounded-full text-xs font-bold flex items-center justify-center transition-all
                ${selected ? 'bg-brand-main text-white shadow-lg' :
                  isAvail ? 'bg-[#333CF514] dark:bg-[#1E293B] text-black-main-text dark:text-[#E2E8F0] cursor-pointer hover:bg-blue-100 dark:hover:bg-[#334155]' : 'text-gray-200 dark:text-gray-600 cursor-not-allowed'}`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default BookingCalendar;
