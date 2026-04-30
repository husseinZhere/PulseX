import { HiOutlineClock, HiOutlinePlus } from 'react-icons/hi2';

const TodaySlotsPanel = ({ selectedDateLabel, slots, draftSlot, onDraftChange, onAddSlot }) => {
  return (
    <aside
      className="relative overflow-hidden bg-white dark:bg-[#0E172A] border border-[#E6ECF5] dark:border-[#29354A] rounded-[22px] p-4 sm:p-[18px] h-fit xl:sticky xl:top-6 shadow-[0_12px_30px_rgba(2,6,23,0.05)] dark:shadow-[0_14px_36px_rgba(2,6,23,0.4)]"
      aria-label="Selected day slots"
    >
      <div className="pointer-events-none absolute -top-14 -right-12 h-32 w-32 rounded-full bg-brand-main/10 blur-3xl" />

      <h2 className="relative text-[24px] leading-[1.15] font-semibold text-black-main-text dark:text-[#E2E8F0]">
        Day's Slots
      </h2>
      <p className="relative text-[12px] text-[#9CA3AF] mt-1.5 mb-3">{selectedDateLabel}</p>

      <section className="space-y-2.5 mb-6 relative" aria-label="Slots list">
        {slots.length === 0 ? (
          <p className="text-[12px] text-[#9CA3AF] text-center py-3">No slots for this day.</p>
        ) : (
          slots.map((slot) => (
            <div
              key={slot}
              className="w-full h-9 px-3 rounded-full bg-[#F3F7FF] dark:bg-[#13213A] border border-[#D9E3F2] dark:border-[#30405D] text-[#1E293B] dark:text-[#E2E8F0] text-[13px] font-medium flex items-center gap-2"
            >
              <span className="w-4 h-4 rounded-full border border-[#C9D8F0] dark:border-[#44557A] flex items-center justify-center shrink-0">
                <HiOutlineClock className="text-brand-main dark:text-[#60A5FA] text-[10px]" />
              </span>
              {slot}
            </div>
          ))
        )}
      </section>

      <section className="border-t border-[#E8EEF7] dark:border-[#263247] pt-4 relative" aria-label="Add single slot">
        <h3 className="text-[14px] font-semibold text-black-main-text dark:text-[#E2E8F0] mb-3">
          Add Single Slot
        </h3>

        <div className="space-y-2.5">
          <label className="block">
            <span className="text-[12px] text-[#9CA3AF]">Date</span>
            <input
              type="date"
              value={draftSlot.date}
              onChange={(e) => onDraftChange('date', e.target.value)}
              className="mt-1 w-full h-10 rounded-full border border-[#E3E7EE] dark:border-[#32415E] bg-white dark:bg-[#0F1A30] px-3 text-[12px] outline-none text-[#111827] dark:text-gray-100 focus:border-brand-main focus:ring-2 focus:ring-brand-main/20"
            />
          </label>

          <label className="block">
            <span className="text-[12px] text-[#9CA3AF]">Start Time</span>
            <input
              type="time"
              value={draftSlot.startTime}
              onChange={(e) => onDraftChange('startTime', e.target.value)}
              className="mt-1 w-full h-10 rounded-full border border-[#E3E7EE] dark:border-[#32415E] bg-white dark:bg-[#0F1A30] px-3 text-[12px] outline-none text-[#111827] dark:text-gray-100 focus:border-brand-main focus:ring-2 focus:ring-brand-main/20"
            />
          </label>

          <label className="block">
            <span className="text-[12px] text-[#9CA3AF]">End Time</span>
            <input
              type="time"
              value={draftSlot.endTime}
              onChange={(e) => onDraftChange('endTime', e.target.value)}
              className="mt-1 w-full h-10 rounded-full border border-[#E3E7EE] dark:border-[#32415E] bg-white dark:bg-[#0F1A30] px-3 text-[12px] outline-none text-[#111827] dark:text-gray-100 focus:border-brand-main focus:ring-2 focus:ring-brand-main/20"
            />
          </label>

          <button
            type="button"
            onClick={onAddSlot}
            className="w-full h-11 rounded-full bg-gradient-to-r from-brand-main to-[#4151FF] text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer hover:brightness-110 transition-all shadow-[0_10px_20px_rgba(51,60,245,0.3)]"
          >
            <HiOutlinePlus className="text-[15px]" />
            Add Single Slot
          </button>
        </div>

        <div className="mt-5 pt-3 border-t border-[#E8EEF7] dark:border-[#263247] flex items-center justify-between rounded-2xl bg-[#F7FAFF] dark:bg-[#111D33] px-3 py-2">
          <span className="text-[12px] text-[#9CA3AF]">Total Slots This Day</span>
          <span className="text-[18px] font-bold text-brand-main">{slots.length}</span>
        </div>
      </section>
    </aside>
  );
};

export default TodaySlotsPanel;