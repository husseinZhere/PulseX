import { HiCheck } from 'react-icons/hi2';

// dayOfWeek: 0=Sunday, 1=Monday … 6=Saturday
const WEEK_ROWS = [
  { label: 'Monday',    num: 1 },
  { label: 'Tuesday',   num: 2 },
  { label: 'Wednesday', num: 3 },
  { label: 'Thursday',  num: 4 },
  { label: 'Friday',    num: 5 },
  { label: 'Saturday',  num: 6 },
  { label: 'Sunday',    num: 0 },
];

const calcHours = (start, end) => {
  if (!start || !end) return '';
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins <= 0) return '';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};

const WeeklyRecurringSchedule = ({ weeklySchedule, onScheduleChange, onSave }) => {
  return (
    <section
      className="relative overflow-hidden rounded-[22px] border border-[#E6ECF5] dark:border-[#29354A] bg-white dark:bg-[#0E172A] p-4 sm:p-5 shadow-[0_12px_30px_rgba(2,6,23,0.05)] dark:shadow-[0_14px_36px_rgba(2,6,23,0.4)]"
      aria-label="Weekly recurring schedule"
    >
      <div className="pointer-events-none absolute -bottom-20 -right-12 h-36 w-36 rounded-full bg-brand-main/10 blur-3xl" />

      <h2 className="relative text-[24px] font-semibold text-black-main-text dark:text-[#E2E8F0] mb-1">
        Weekly Recurring Schedule
      </h2>
      <p className="relative text-[13px] text-[#667085] dark:text-[#95A2B8] mb-4">
        Set your standard work hours for each day of the week.
      </p>

      <div className="space-y-2.5 relative">
        {WEEK_ROWS.map(({ label, num }) => {
          const row = weeklySchedule[num] || { startTime: '', endTime: '' };
          const isWeekend = num === 0 || num === 6; // Sunday or Saturday
          const hours = calcHours(row.startTime, row.endTime);

          return (
            <div
              key={label}
              className={`rounded-[16px] border px-3 sm:px-4 py-3 grid grid-cols-1 md:grid-cols-[122px_1fr_1fr_56px] gap-2 md:gap-3 items-center transition-colors ${
                isWeekend
                  ? 'bg-[#F5F8FC] dark:bg-[#101B2E] border-[#E3EAF5] dark:border-[#25324A]'
                  : 'bg-[#F8FBFF] dark:bg-[#132036] border-[#E3EAF5] dark:border-[#2A3650] hover:border-brand-main/35'
              }`}
            >
              <span
                className={`inline-flex h-9 items-center justify-center rounded-xl border px-2 text-[13px] font-semibold md:text-center ${
                  isWeekend
                    ? 'border-[#D9E3F1] dark:border-[#2A3650] bg-[#EEF3FA] dark:bg-[#152138] text-[#6B7280] dark:text-[#8E9CB3]'
                    : 'border-[#D7E3F4] dark:border-[#33435F] bg-white dark:bg-[#0F1A30] text-black-main-text dark:text-[#E2E8F0]'
                }`}
              >
                {label}
              </span>

              <label className="block">
                <span className="text-[10px] text-[#9CA3AF]">Start Time</span>
                <input
                  type="time"
                  value={row.startTime}
                  onChange={(e) => onScheduleChange(num, 'startTime', e.target.value)}
                  disabled={isWeekend}
                  className={`mt-1 w-full h-10 ${isWeekend ? 'rounded-md' : 'rounded-full'} border px-3 text-[12px] outline-none ${
                    isWeekend
                      ? 'border-[#DCE3EB] dark:border-[#2B3850] bg-[#EEF2F6] dark:bg-[#152136] text-[#9CA3AF] cursor-not-allowed'
                      : 'border-[#DCE3EB] dark:border-[#32415E] bg-white dark:bg-[#0F1A30] text-black-main-text dark:text-gray-100 focus:border-brand-main focus:ring-2 focus:ring-brand-main/20'
                  }`}
                />
              </label>

              <label className="block">
                <span className="text-[10px] text-[#9CA3AF]">End Time</span>
                <input
                  type="time"
                  value={row.endTime}
                  onChange={(e) => onScheduleChange(num, 'endTime', e.target.value)}
                  disabled={isWeekend}
                  className={`mt-1 w-full h-10 ${isWeekend ? 'rounded-md' : 'rounded-full'} border px-3 text-[12px] outline-none ${
                    isWeekend
                      ? 'border-[#DCE3EB] dark:border-[#2B3850] bg-[#EEF2F6] dark:bg-[#152136] text-[#9CA3AF] cursor-not-allowed'
                      : 'border-[#DCE3EB] dark:border-[#32415E] bg-white dark:bg-[#0F1A30] text-black-main-text dark:text-gray-100 focus:border-brand-main focus:ring-2 focus:ring-brand-main/20'
                  }`}
                />
              </label>

              <span className="text-[12px] text-[#9CA3AF] text-right md:text-center md:pt-4 font-semibold">
                {hours}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end mt-5 relative">
        <button
          type="button"
          onClick={onSave}
          className="h-11 px-6 rounded-full bg-gradient-to-r from-brand-main to-[#4151FF] text-white text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer hover:brightness-110 shadow-[0_10px_20px_rgba(51,60,245,0.32)] transition-all"
        >
          <HiCheck className="text-[15px]" />
          Save Recurring Schedule
        </button>
      </div>
    </section>
  );
};

export default WeeklyRecurringSchedule;