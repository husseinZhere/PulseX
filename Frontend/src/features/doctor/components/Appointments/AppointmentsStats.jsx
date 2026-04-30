import { GiCheckMark } from 'react-icons/gi';
import { LuCalendarClock } from 'react-icons/lu';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import { useState } from 'react';
import { motion } from 'framer-motion';

const CALENDAR_DAYS = [
  ['MON', '', ''],
  ['TUE', '', ''],
  ['WED', '', ''],
  ['THU', '', ''],
  ['FRI', '', ''],
  ['SAT', '', ''],
  ['SUN', '', ''],
];

const CALENDAR_NUMBERS = [
  ['', '', 1, 2, 3, 4, 5],
  [6, 7, 8, 9, 10, 11, 12],
  [13, 14, 15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24, 25, 26],
  [27, 28, 29, 30, 31, '', ''],
];

const AppointmentsStats = ({ upcomingCount, completedCount }) => {
  const [selectedDate, setSelectedDate] = useState(8);

  return (
    <section className="grid grid-cols-1 xl:grid-cols-[1fr_1fr_auto] gap-4 lg:gap-6 mb-4 mt-2 items-start" aria-label="Appointments overview">
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0 }}
        whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(0,172,79,0.12)' }}
        className="bg-white dark:bg-[#111827] rounded-[24px] border-[0.7px] border-[rgba(117,117,117,0.15)] dark:border-gray-700 shadow-[0px_2px_3px_rgba(0,0,0,0.1)] p-6 sm:p-8 flex items-start flex-col gap-6 w-full transition-shadow cursor-default"
      >
        <div className="flex items-start gap-4 sm:gap-6 w-full">
          <motion.div
            whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.45 } }}
            className="w-[64px] h-[64px] sm:w-[84px] sm:h-[84px] rounded-[32px] flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(201deg, #D3FFE7 0%, #EFFFF6 100%)' }}
          >
            <LuCalendarClock className="text-[#00AC4F] text-[36px]" aria-label="Upcoming" />
          </motion.div>
          <div className="flex flex-col gap-2 pt-1 sm:pt-2">
            <p className="text-[15px] sm:text-[16px] font-medium text-[#757575] leading-tight">Upcoming Appointments</p>
            <motion.h2
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.15 }}
              className="text-[32px] sm:text-[40px] font-semibold text-[#333CF5] leading-none"
            >{upcomingCount}</motion.h2>
          </div>
        </div>
      </motion.article>

      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(97,46,204,0.12)' }}
        className="bg-white dark:bg-[#111827] rounded-[24px] border-[0.7px] border-[rgba(117,117,117,0.15)] dark:border-gray-700 shadow-[0px_2px_3px_rgba(0,0,0,0.1)] p-6 sm:p-8 flex items-start flex-col gap-6 w-full transition-shadow cursor-default"
      >
        <div className="flex items-start gap-4 sm:gap-6 w-full">
          <motion.div
            whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.45 } }}
            className="w-[64px] h-[64px] sm:w-[84px] sm:h-[84px] rounded-[32px] flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(201deg, rgba(51, 60, 245, 0.65) 0%, rgba(51, 60, 245, 0.05) 100%)' }}
          >
            <GiCheckMark className="text-[#612ECC] text-[36px]" aria-label="Completed" />
          </motion.div>
          <div className="flex flex-col gap-2 pt-1 sm:pt-2">
            <p className="text-[15px] sm:text-[16px] font-medium text-[#757575] leading-tight">Completed Appointments</p>
            <motion.h2
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.22 }}
              className="text-[32px] sm:text-[40px] font-semibold text-[#612ECC] leading-none"
            >{completedCount}</motion.h2>
          </div>
        </div>
      </motion.article>

      <article className="bg-white dark:bg-[#111827] rounded-[16px] border-[0.6px] border-[#D7D8DC] dark:border-gray-700 shadow-[0px_8px_22px_rgba(150,150,150,0.11)] p-6 w-full xl:w-[308px] shrink-0 self-start">
        <div className="flex items-center justify-between mb-4 border-b border-[#D7D8DC] dark:border-gray-700 pb-4">
          <h3 className="text-[14px] font-normal text-[#010218] dark:text-[#E2E8F0] uppercase tracking-wider mx-auto pl-8">January 2026</h3>
          <div className="flex items-center gap-1 text-[#010218] dark:text-[#E2E8F0]">
            <button type="button" className="cursor-pointer p-1 hover:bg-gray-100 dark:hover:bg-[#1E293B] rounded-full transition-colors" aria-label="Previous month">
              <HiChevronLeft className="text-[16px]" />
            </button>
            <button type="button" className="cursor-pointer p-1 hover:bg-gray-100 dark:hover:bg-[#1E293B] rounded-full transition-colors" aria-label="Next month">
              <HiChevronRight className="text-[16px]" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center">
          {CALENDAR_DAYS.map(([day], idx) => (
            <span key={`${day}-${idx}`} className="text-[10px] text-[#757575] uppercase mb-1 font-normal block w-[24px] mx-auto">
              {day}
            </span>
          ))}

          {CALENDAR_NUMBERS.flat().map((d, index) => {
            if (!d) return <span key={`empty-${index}`} className="w-[24px] h-[24px] mx-auto block" />;
            const isSelected = d === selectedDate;

            return (
              <button
                key={`d-${index}`}
                type="button"
                onClick={() => setSelectedDate(d)}
                className={`h-[24px] w-[24px] mx-auto rounded-full text-[14px] flex items-center justify-center cursor-pointer transition-colors ${isSelected
                    ? 'bg-[#333CF5] text-white font-medium'
                    : 'text-[#010218] dark:text-[#E2E8F0] hover:bg-gray-100'
                  }`}
                aria-pressed={isSelected}
              >
                {d}
              </button>
            );
          })}
        </div>
      </article>
    </section>
  );
};

export default AppointmentsStats;
