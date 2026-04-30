import { LuCalendarDays } from 'react-icons/lu';

const ScheduleSettingsHeader = () => {
  return (
    <header className="relative overflow-hidden rounded-[22px] border border-[#E6ECF5] dark:border-[#29354A] bg-gradient-to-br from-white via-[#F8FBFF] to-[#ECF3FF] dark:from-[#0F1A2E] dark:via-[#0E182B] dark:to-[#0C1524] px-4 py-5 sm:px-6 sm:py-6 shadow-[0_12px_32px_rgba(2,6,23,0.06)] dark:shadow-[0_14px_36px_rgba(2,6,23,0.42)]">
      <div className="pointer-events-none absolute -top-16 -right-12 h-36 w-36 rounded-full bg-brand-main/10 blur-3xl" />

      <div className="relative flex items-start gap-3">
        <span className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-main/20 bg-brand-main/10 text-brand-main dark:border-brand-main/25 dark:bg-brand-main/15 shrink-0">
          <LuCalendarDays className="text-[24px] stroke-[2.3px]" />
        </span>

        <div>
          <h1 className="text-[24px] leading-[30px] font-bold text-[#010218] dark:text-[#E2E8F0]">Availability Management</h1>
          <p className="mt-1.5 text-[14px] leading-snug text-[#4A5565] dark:text-[#A8B3C8]">Set your available hours and manage appointment slots with a clear weekly workflow.</p>
        </div>
      </div>
    </header>
  );
};

export default ScheduleSettingsHeader;
