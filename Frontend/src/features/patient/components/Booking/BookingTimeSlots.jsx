const to12h = (t) => {
  const [hStr, mStr = '00'] = t.split(':');
  const h = parseInt(hStr, 10);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${mStr} ${period}`;
};

const BookingTimeSlots = ({ dayLabel, timesForDay, bookedTimes = [], selectedTime, onSelect, onBookedClick }) => {
  const bookedSet = new Set(bookedTimes);
  return (
    <aside className="w-full xl:w-56 shrink-0 mt-6 xl:mt-0" aria-label="Time slots">
      <p className="text-[16px] font-normal text-black-main-text dark:text-[#E2E8F0] mb-5 text-center xl:text-left">{dayLabel}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:flex xl:flex-col gap-3">
        {timesForDay.map((t) => {
          const isBooked = bookedSet.has(t);
          const isSelected = selectedTime === t;
          return (
            <button
              key={t}
              onClick={() => isBooked ? onBookedClick?.() : onSelect(t)}
              aria-disabled={isBooked}
              title={isBooked ? 'Already booked' : undefined}
              className={`flex items-center justify-between gap-2 sm:gap-3 border-2 rounded-[20px] px-3 sm:px-4 py-3 text-sm transition-all
                ${isBooked
                  ? 'border-gray-200 dark:border-gray-700/60 bg-gray-100 dark:bg-gray-800/30 text-gray-400 dark:text-gray-600 opacity-50 cursor-not-allowed line-through'
                  : isSelected
                    ? 'border-brand-main bg-blue-50 dark:bg-blue-900/25 text-brand-main dark:text-blue-300 font-bold shadow-sm'
                    : 'border-[#333CF54D] dark:border-gray-700 bg-gray-50 dark:bg-[#0F172A] text-gray-400 dark:text-gray-300 hover:border-gray-100 dark:hover:border-gray-600'
                }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
                  ${isBooked ? 'border-gray-300 dark:border-gray-600' : isSelected ? 'border-brand-main' : 'border-gray-300'}`}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-brand-main" />}
                </div>
                {to12h(t)}
              </div>
              {isBooked && (
                <span className="flex items-center gap-1 text-red-500 dark:text-red-400 text-[11px] font-bold shrink-0">
                  <span className="text-xs">✕</span> Booked
                </span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default BookingTimeSlots;
