import {
  HiOutlineBanknotes,
  HiOutlineCalendarDays,
  HiOutlineMapPin,
  HiOutlineXCircle,
  HiOutlineVideoCamera,
} from 'react-icons/hi2';
import { HiOutlineOfficeBuilding } from 'react-icons/hi';
import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.38, ease: 'easeOut' },
  }),
};

const DoctorAvatar = ({ img, name }) => {
  if (img) {
    return (
      <img
        src={img}
        alt={`Dr. ${name}`}
        className="w-16 h-16 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm shrink-0"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'flex';
        }}
      />
    );
  }
  return (
    <div className="w-16 h-16 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#333CF5] to-[#9810fa] flex items-center justify-center text-white text-[22px] font-bold shadow-sm shrink-0 border-2 border-white dark:border-gray-700">
      {(name || 'D')[0].toUpperCase()}
    </div>
  );
};

const MethodBadge = ({ isOnline, label }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold ${
    isOnline
      ? 'bg-[#EEF2FF] text-[#4F46E5] dark:bg-[#1e1b4b]/50 dark:text-[#a5b4fc]'
      : 'bg-[#F0FDF4] text-[#16a34a] dark:bg-[#052e16]/40 dark:text-[#4ade80]'
  }`}>
    {isOnline
      ? <HiOutlineVideoCamera className="text-[13px]" />
      : <HiOutlineBanknotes className="text-[13px]" />
    }
    {label}
  </span>
);

const to12h = (t) => {
  if (!t) return t;
  const [hStr, mStr = '00'] = t.split(':');
  const h = parseInt(hStr, 10);
  if (Number.isNaN(h)) return t;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${mStr} ${period}`;
};

const AppointmentsList = ({ list, activeTab, onCancel }) => {
  return (
    <section className="flex flex-col gap-4" aria-label="Appointments list">
      {list.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-[15px] text-gray-400 dark:text-gray-500">No {activeTab} appointments.</p>
        </div>
      )}
      {list.map((app, i) => (
        <motion.article
          key={app.id}
          custom={i}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
          className="bg-white dark:bg-[#111827] rounded-[20px] border border-gray-100 dark:border-gray-800 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-shadow"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 w-full md:w-auto text-center sm:text-left">
            <DoctorAvatar img={app.img} name={app.doc} />

            <div className="flex flex-col gap-2 w-full">
              <h3 className="text-[20px] font-bold text-black-main-text dark:text-[#E2E8F0] leading-tight">{app.doc}</h3>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {/* Date & Time */}
                <span className="inline-flex items-center gap-1.5 text-[13px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#1E293B] px-3 py-1.5 rounded-lg shrink-0">
                  <HiOutlineCalendarDays className="text-[14px]" />
                  {app.date} &ndash; {to12h(app.time)}
                </span>

                {/* Payment method badge */}
                <MethodBadge isOnline={app.isOnline} label={app.method} />

                {/* Location */}
                {!app.isOnline && app.loc && (
                  <span className="inline-flex items-center gap-1.5 text-[13px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#1E293B] px-3 py-1.5 rounded-lg shrink-0">
                    <HiOutlineMapPin className="text-[13px]" />
                    {app.loc}
                  </span>
                )}
                {app.isOnline && (
                  <span className="inline-flex items-center gap-1.5 text-[13px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#1E293B] px-3 py-1.5 rounded-lg shrink-0">
                    <HiOutlineOfficeBuilding className="text-[13px]" />
                    Online Session
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto flex justify-center md:justify-end border-t border-gray-100 dark:border-gray-800 md:border-none pt-4 md:pt-0 shrink-0">
            {activeTab === 'upcoming' ? (
              <button
                className="flex flex-1 sm:flex-none items-center justify-center cursor-pointer gap-2 text-gray-600 dark:text-gray-300 bg-[#F3F4F6] dark:bg-[#1E293B] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-xl px-5 py-2.5 text-[14px] font-bold transition-all"
                onClick={() => onCancel(app.id)}
              >
                <HiOutlineXCircle className="text-[18px]" />
                Cancel Appointment
              </button>
            ) : (
              <span className="bg-[#D1FAE5] dark:bg-emerald-900/30 text-[#059669] dark:text-emerald-300 border border-[#059669]/20 dark:border-emerald-800 rounded-full px-6 flex items-center justify-center h-[40px] text-[13px] font-bold w-full sm:w-auto">
                Completed
              </span>
            )}
          </div>
        </motion.article>
      ))}
    </section>
  );
};

export default AppointmentsList;
