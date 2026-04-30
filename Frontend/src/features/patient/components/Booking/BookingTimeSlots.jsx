const BookingTimeSlots = ({ dayLabel, timesForDay, selectedTime, onSelect }) => {
  return (
    <aside className="w-full xl:w-56 shrink-0 mt-6 xl:mt-0" aria-label="Time slots">
      <p className="text-[16px] font-normal text-black-main-text dark:text-[#E2E8F0] mb-5 text-center xl:text-left">{dayLabel}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:flex xl:flex-col gap-3">
        {timesForDay.map((t) => (
          <button
            key={t}
            onClick={() => onSelect(t)}
            className={`flex items-center cursor-pointer gap-2 sm:gap-3 border-2 rounded-[20px] px-3 sm:px-4 py-3 text-sm transition-all
              ${selectedTime === t
                ? 'border-brand-main bg-blue-50 dark:bg-blue-900/25 text-brand-main dark:text-blue-300 font-bold shadow-sm'
                : 'border-[#333CF54D] dark:border-gray-700 bg-gray-50 dark:bg-[#0F172A] text-gray-400 dark:text-gray-300 hover:border-gray-100 dark:hover:border-gray-600'}`}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
              ${selectedTime === t ? 'border-brand-main' : 'border-gray-300'}`}>
              {selectedTime === t && <div className="w-2 h-2 rounded-full bg-brand-main" />}
            </div>
            {t}
          </button>
        ))}
      </div>
    </aside>
  );
};

export default BookingTimeSlots;
