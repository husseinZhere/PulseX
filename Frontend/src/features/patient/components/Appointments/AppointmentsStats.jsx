import { GiCheckMark } from 'react-icons/gi';
import { LuCalendarClock } from 'react-icons/lu';

const AppointmentsStats = ({ upcomingCount, completedCount }) => {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6" aria-label="Appointments stats">
      <article className="bg-white dark:bg-[#111827] rounded-[20px] border border-green-100 dark:border-green-900/40 shadow-sm p-5 sm:p-7 flex flex-col sm:flex-row items-center sm:items-start lg:items-center gap-4 text-center sm:text-left transition-all hover:shadow-md">
        <div
          className="w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(201deg, #D3FFE7 0%, #EFFFF6 100%)' }}
        >
          <LuCalendarClock className="text-[#00AC4F] text-[32px] sm:text-5xl" aria-label="Upcoming" />
        </div>
        <div className="flex flex-col gap-1 sm:gap-0 mt-2 sm:mt-0">
          <p className="text-[16px] text-gray-500 dark:text-gray-400">Upcoming Appointments</p>
          <h2 className="text-[32px] font-bold text-brand-main leading-none">{upcomingCount}</h2>
        </div>
      </article>

      <article className="bg-white dark:bg-[#111827] rounded-[20px] border border-indigo-100 dark:border-indigo-900/40 shadow-sm p-5 sm:p-7 flex flex-col sm:flex-row items-center sm:items-start lg:items-center gap-4 text-center sm:text-left transition-all hover:shadow-md">
        <div
          className="w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] rounded-full bg-indigo-50 flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(201deg, rgba(51, 60, 245, 0.65) 0%, rgba(51, 60, 245, 0.05) 100%)' }}
        >
          <GiCheckMark className="text-brand-main text-[21px] sm:text-[32px]" aria-label="Completed" />
        </div>
        <div className="flex flex-col gap-1 sm:gap-0 mt-2 sm:mt-0">
          <p className="text-[16px] text-gray-500 dark:text-gray-400">Completed Appointments</p>
          <h2 className="text-[32px] sm:text-[23px] font-bold text-brand-main leading-none">{completedCount}</h2>
        </div>
      </article>
    </section>
  );
};

export default AppointmentsStats;
