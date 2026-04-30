import { HiOutlineArrowLongRight } from 'react-icons/hi2';
import { HiOutlineCreditCard, HiOutlineCash } from 'react-icons/hi';
import { getRiskClass } from '../../data/patientsData';

const PaymentBadge = ({ visitType }) => {
  const isOnline = String(visitType || '').toLowerCase() === 'online';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold w-fit ${
      isOnline
        ? 'bg-[#EEF2FF] text-[#4F46E5] dark:bg-[#1e1b4b]/50 dark:text-[#a5b4fc]'
        : 'bg-[#F0FDF4] text-[#16a34a] dark:bg-[#052e16]/40 dark:text-[#4ade80]'
    }`}>
      {isOnline ? <HiOutlineCreditCard className="text-[13px]" /> : <HiOutlineCash className="text-[13px]" />}
      {isOnline ? 'Online' : 'Cash'}
    </span>
  );
};

const PatientListTable = ({ rows, onOpenProfile, onOpenChat }) => {
  return (
    <section className="mt-5 overflow-hidden rounded-2xl border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-[#111827]" aria-label="Patients table">
      <div className="hidden md:grid grid-cols-[1.6fr_0.7fr_0.9fr_0.9fr_1fr_0.9fr_0.9fr_1fr] bg-[#3B48F3] px-5 py-3 text-[14px] font-semibold text-white">
        <span>Patient Name</span>
        <span>Age</span>
        <span>Gender</span>
        <span>Payment</span>
        <span>Chat Expired</span>
        <span>Risk Level</span>
        <span>Last Visit</span>
        <span>Action</span>
      </div>

      <div>
        {rows.map((patient) => (
          <article key={patient.id} className="grid grid-cols-1 md:grid-cols-[1.6fr_0.7fr_0.9fr_0.9fr_1fr_0.9fr_0.9fr_1fr] items-center gap-2 border-t border-[#F1F5F9] dark:border-gray-700 px-5 py-4 text-[14px] text-black-main-text dark:text-[#E2E8F0]">
            <div className="flex items-center gap-3 font-semibold">
              {patient.avatar ? (
                <img
                  src={patient.avatar}
                  alt={patient.name}
                  className="h-10 w-10 rounded-full object-cover shrink-0"
                  onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
                />
              ) : null}
              <div
                className="h-10 w-10 rounded-full bg-gradient-to-br from-[#333CF5] to-[#9810fa] flex items-center justify-center text-white text-[14px] font-bold shrink-0"
                style={{ display: patient.avatar ? 'none' : 'flex' }}
              >
                {(patient.name || 'P')[0].toUpperCase()}
              </div>
              {patient.name}
            </div>
            <span>{patient.age}</span>
            <span>{patient.gender}</span>
            <PaymentBadge visitType={patient.visitType} />
            {patient.chatExpired === 'Open Chat' ? (
              <button
                type="button"
                onClick={() => onOpenChat(patient)}
                className="cursor-pointer h-8 w-fit rounded-xl bg-[#22C55E] px-3 text-[13px] font-semibold text-white"
              >
                Open Chat
              </button>
            ) : (
              <span className="text-[#6B7280]">{patient.chatExpired}</span>
            )}
            <span className={`w-fit rounded-full px-3 py-1 text-[12px] font-semibold ${getRiskClass(patient.riskLevel)}`}>
              {patient.riskLevel}
            </span>
            <span>{patient.lastVisit}</span>
            <button
              type="button"
              onClick={() => onOpenProfile(patient.id)}
              className="cursor-pointer inline-flex items-center gap-1 text-[14px] font-semibold text-[#333CF5]"
            >
              View Record <HiOutlineArrowLongRight className="text-[16px]" />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
};

export default PatientListTable;
