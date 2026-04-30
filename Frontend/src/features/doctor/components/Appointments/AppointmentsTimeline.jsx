import { HiOutlineArrowRight } from 'react-icons/hi2';
import { MdOutlineFreeBreakfast, MdOutlineCancel } from 'react-icons/md';
import { motion } from 'framer-motion';
import { HiOutlineVideoCamera, HiOutlineOfficeBuilding } from 'react-icons/hi';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.38, ease: 'easeOut' } }),
};

const TimelineTime = ({ time, isBreak = false, isLast = false }) => (
  <div className="flex flex-col items-center shrink-0 w-[48px]">
    {isBreak ? (
      <div className="flex items-center justify-center h-[48px] w-full bg-[#F1F2F5] dark:bg-[#1E293B] rounded-[16px]">
        <MdOutlineFreeBreakfast className="text-[20px] text-[#A1A1aa]" />
      </div>
    ) : (
      <div className="flex items-center justify-center h-[48px] w-full bg-gradient-to-b from-[#333CF5] to-[#070E92] rounded-[16px] shadow-[0px_4px_6px_rgba(59,130,246,0.3),0px_10px_15px_rgba(59,130,246,0.3)]">
        <span className="text-[12px] font-bold text-white leading-none">{time}</span>
      </div>
    )}
    {!isLast && (
      <div className="w-[2px] h-[70px] sm:h-[118px] bg-gradient-to-b from-[#BFDBFE] to-transparent shrink-0 mt-2 mb-2" />
    )}
  </div>
);

const PatientAvatar = ({ img, name, size = 48 }) => {
  if (img) {
    return (
      <img
        src={img}
        alt={name}
        className="rounded-full object-cover shrink-0 border border-gray-100 dark:border-gray-700"
        style={{ width: size, height: size }}
        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling?.style && (e.currentTarget.nextSibling.style.display = 'flex'); }}
      />
    );
  }
  return (
    <div
      className="rounded-full shrink-0 bg-gradient-to-br from-[#333CF5] to-[#9810fa] flex items-center justify-center text-white font-bold shadow-sm"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {(name || '?')[0].toUpperCase()}
    </div>
  );
};

const LocationBadge = ({ isOnline, room }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
    isOnline
      ? 'bg-[#EEF2FF] text-[#4F46E5] dark:bg-[#1e1b4b]/50 dark:text-[#a5b4fc]'
      : 'bg-[#F0FDF4] text-[#16a34a] dark:bg-[#052e16]/40 dark:text-[#4ade80]'
  }`}>
    {isOnline
      ? <HiOutlineVideoCamera className="text-[12px]" />
      : <HiOutlineOfficeBuilding className="text-[12px]" />
    }
    {isOnline ? 'Online' : `Clinic Room ${room}`}
  </span>
);

const UpcomingCard = ({ item, onCancel, onViewRecord, index }) => (
  <motion.article
    custom={index}
    variants={fadeUp}
    initial="hidden"
    animate="visible"
    whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(51,60,245,0.10)' }}
    className="relative bg-white dark:bg-[#111827] rounded-[24px] border-[0.6px] border-[#D7D8DC] dark:border-gray-700 shadow-[0px_2px_3px_rgba(0,0,0,0.08)] p-6 min-h-[135px] flex flex-col justify-center transition-shadow"
  >
    <button
      onClick={() => onCancel(item.id)}
      className="absolute top-4 right-5 sm:right-6 text-[#DC2626] text-[14px] font-medium flex items-center gap-1.5 cursor-pointer hover:opacity-75 transition-opacity"
    >
      <MdOutlineCancel className="text-[17px]" /> Cancel Appointment
    </button>

    <div className="flex items-center gap-4 mt-8 sm:mt-0">
      <PatientAvatar img={item.img} name={item.patient} />
      <div className="flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h3 className="text-[16px] font-semibold text-[#010218] dark:text-[#E2E8F0]">{item.patient}</h3>
          {item.tag && (
            <span className={`px-2.5 py-0.5 rounded-[8px] text-[11.5px] font-semibold tracking-wide ${item.tagClass}`}>
              {item.tag}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[13px] text-[#6B7280]">Today</span>
          <span className="text-[#D1D5DB]">·</span>
          <LocationBadge isOnline={item.isOnline} room={item.room} />
        </div>
      </div>
    </div>

    <button
      onClick={() => onViewRecord(item.patientId || item.id)}
      className="static sm:absolute bottom-5 right-5 sm:right-6 mt-4 sm:mt-0 text-[#333CF5] text-[14.5px] font-medium flex items-center justify-end gap-1.5 cursor-pointer hover:opacity-75 transition-opacity"
    >
      View Record <HiOutlineArrowRight className="text-[17px]" strokeWidth="2" />
    </button>
  </motion.article>
);

const BreakCard = ({ duration, index }) => (
  <motion.article
    custom={index}
    variants={fadeUp}
    initial="hidden"
    animate="visible"
    className="bg-[#F8FAFC] dark:bg-[#1E293B] rounded-[24px] border border-[#E5E7EB] dark:border-gray-700 h-[74px] px-6 flex items-center gap-4"
  >
    <MdOutlineFreeBreakfast className="text-[22px] text-[#94A3B8]" />
    <span className="text-[15px] font-medium text-[#64748B]">Break Time</span>
    {duration && <span className="text-[13px] text-[#94A3B8] ml-1">{duration}</span>}
  </motion.article>
);

const CompletedCard = ({ item, onViewRecord, index }) => (
  <motion.article
    custom={index}
    variants={fadeUp}
    initial="hidden"
    animate="visible"
    whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.07)' }}
    className="relative bg-white dark:bg-[#111827] rounded-[24px] border-[0.6px] border-[#D7D8DC] dark:border-gray-700 shadow-[0px_2px_3px_rgba(0,0,0,0.08)] p-6 min-h-[135px] flex flex-col justify-center transition-shadow"
  >
    <div className="absolute top-5 right-5 sm:right-6">
      <span className="px-3 py-1 rounded-[8px] text-[11.5px] font-semibold bg-[#D1FAE5] text-[#059669]">Completed</span>
    </div>

    <div className="flex items-center gap-4 mt-4 sm:mt-0">
      <PatientAvatar img={item.img} name={item.patient} />
      <div className="flex flex-col gap-1.5 min-w-0">
        <h3 className="text-[16px] font-semibold text-[#010218] dark:text-[#E2E8F0]">{item.patient}</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[13px] text-[#6B7280]">{item.when || item.time}</span>
          {item.room && item.room !== '—' && (
            <>
              <span className="text-[#D1D5DB]">·</span>
              <LocationBadge isOnline={item.isOnline} room={item.room} />
            </>
          )}
        </div>
      </div>
    </div>

    <button
      onClick={() => onViewRecord(item.patientId || item.id)}
      className="static sm:absolute bottom-5 right-5 sm:right-6 mt-4 sm:mt-0 text-[#333CF5] text-[14.5px] font-medium flex items-center justify-end gap-1.5 cursor-pointer hover:opacity-75 transition-opacity"
    >
      View Record <HiOutlineArrowRight className="text-[17px]" strokeWidth="2" />
    </button>
  </motion.article>
);

const AppointmentsTimeline = ({ activeTab, upcomingList, completedGroups, onCancel, onViewRecord }) => {
  if (activeTab === 'completed') {
    return (
      <section className="flex flex-col gap-6" aria-label="Completed appointments">
        {completedGroups.length === 0 && (
          <div className="py-16 text-center text-[14px] text-[#9CA3AF]">No completed appointments yet.</div>
        )}
        {completedGroups.map((group) => (
          <section key={group.dateLabel} className="flex flex-col gap-4">
            <h2 className="text-[11.5px] text-[#9CA3AF] font-semibold uppercase tracking-wider px-1">{group.dateLabel}</h2>
            <div className="flex flex-col gap-4 pl-0 sm:pl-4">
              {group.items.map((item, i) => (
                <CompletedCard key={item.id} item={item} onViewRecord={onViewRecord} index={i} />
              ))}
            </div>
          </section>
        ))}
      </section>
    );
  }

  if (upcomingList.length === 0) {
    return (
      <div className="py-16 text-center text-[14px] text-[#9CA3AF]">No upcoming appointments scheduled.</div>
    );
  }

  return (
    <section className="relative mt-2" aria-label="Upcoming appointments timeline">
      <div className="flex flex-col">
        {upcomingList.map((item, index) => {
          const isLast = index === upcomingList.length - 1;
          const isBreak = item.type === 'break';
          return (
            <div key={item.id} className="flex items-start gap-4 sm:gap-[32px]">
              <TimelineTime time={item.time} isBreak={isBreak} isLast={isLast} />
              <div className="flex-1 pb-4 sm:pb-0">
                {isBreak ? (
                  <BreakCard duration={item.duration} index={index} />
                ) : (
                  <UpcomingCard item={item} onCancel={onCancel} onViewRecord={onViewRecord} index={index} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default AppointmentsTimeline;
