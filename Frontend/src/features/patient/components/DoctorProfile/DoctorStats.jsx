import { HiOutlineBriefcase, HiOutlineLocationMarker, HiOutlineUserGroup } from 'react-icons/hi';
import { MdOutlineAttachMoney } from 'react-icons/md';

const StatItem = ({ icon, bg, color, label, value }) => (
  <article className="flex items-start gap-3">
    <div className={`w-10 h-10 rounded-full ${bg} ${color} flex items-center justify-center text-2xl shrink-0`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-sm text-[var(--doc-muted)]">{label}</p>
      <p className="text-base font-semibold text-black-main-text dark:text-[#E2E8F0] break-words">{value}</p>
    </div>
  </article>
);

const DoctorStats = ({ doctor }) => {
  return (
    <section
      className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm px-6 py-5 mb-5 grid grid-cols-2 md:grid-cols-4 gap-5"
      aria-label="Doctor stats"
    >
      <StatItem
        icon={<MdOutlineAttachMoney aria-label="Price" />}
        bg="bg-[#DCFCE7]" color="text-[#00A63E]"
        label="Price"
        value={`$${doctor.price} / session`}
      />
      <StatItem
        icon={<HiOutlineLocationMarker aria-label="Location" />}
        bg="bg-[#DBEAFE]" color="text-brand-main"
        label="Location"
        value={doctor.loc}
      />
      <StatItem
        icon={<HiOutlineUserGroup aria-label="Patients" />}
        bg="bg-[#F3E8FF]" color="text-[#9810FA]"
        label="Patients"
        value={doctor.patients}
      />
      <StatItem
        icon={<HiOutlineBriefcase aria-label="Experience" />}
        bg="bg-[#FFEDD4]" color="text-[#F54900]"
        label="Experience"
        value={doctor.exp}
      />
    </section>
  );
};

export default DoctorStats;
