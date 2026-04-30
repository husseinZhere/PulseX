import { HiOutlineBriefcase, HiOutlineLocationMarker, HiOutlineUserGroup } from 'react-icons/hi';
import { MdOutlineAttachMoney } from 'react-icons/md';

const StatItem = ({ icon, bg, color, label, value }) => (
  <article className="flex flex-col sm:flex-row items-center sm:items-start lg:items-center gap-2 sm:gap-3 lg:border-r lg:border-gray-100 dark:border-gray-800 last:border-0 sm:pr-2 lg:pr-4 text-center sm:text-left justify-center sm:justify-start">
    <div className={`w-9 h-9 rounded-full ${bg} ${color} flex items-center justify-center text-2xl shrink-0`}>{icon}</div>
    <div>
      <p className="text-sm text-[var(--doc-muted)]">{label}</p>
      <p className="text-lg font-semibold text-black-main-text dark:text-[#E2E8F0]">{value}</p>
    </div>
  </article>
);

const DoctorStats = ({ doctor }) => {
  return (
    <section className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm px-4 sm:px-8 py-4 mb-5 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-0" aria-label="Doctor stats">
      <StatItem icon={<MdOutlineAttachMoney aria-label="Price" />} bg="bg-[#DCFCE7]"  color="text-[#00A63E]"  label="Price"      value={`$${doctor.price} / session`} />
      <StatItem icon={<HiOutlineLocationMarker aria-label="Location" />} bg="bg-[#DBEAFE]" color="text-brand-main"  label="Location"   value={doctor.loc} />
      <StatItem icon={<HiOutlineUserGroup aria-label="Patients" />}    bg="bg-[#F3E8FF]" color="text-[#9810FA]" label="Patients"   value={doctor.patients} />
      <StatItem icon={<HiOutlineBriefcase aria-label="Experience" />}    bg="bg-[#FFEDD4]" color="text-[#F54900]" label="Experience" value={doctor.exp} />
    </section>
  );
};

export default DoctorStats;
