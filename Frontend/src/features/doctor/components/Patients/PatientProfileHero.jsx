import { HiOutlineCalendarDays, HiOutlineChatBubbleLeftRight, HiOutlineDocumentPlus, HiOutlineDocumentText } from 'react-icons/hi2';
import { LuShieldCheck, LuClock } from 'react-icons/lu';

const riskConfig = {
  Low: { bg: 'bg-[#DCFCE7] border border-[#86EFAC]', text: 'text-[#166534]', dot: 'bg-[#22C55E]' },
  Medium: { bg: 'bg-[#FEF3C7] border border-[#FCD34D]', text: 'text-[#92400E]', dot: 'bg-[#F59E0B]' },
  High: { bg: 'bg-[#FEE2E2] border border-[#FCA5A5]', text: 'text-[#B91C1C]', dot: 'bg-[#EF4444]' },
  Unknown: { bg: 'bg-[#E5E7EB] border border-[#CBD5E1]', text: 'text-[#334155]', dot: 'bg-[#64748B]' },
};

const PatientProfileHero = ({ patient, onAddMedical, onAddPrescription, onMessage }) => {
  const riskLevel = String(patient.riskLevel || '').toLowerCase();
  const risk = riskLevel.includes('high')
    ? riskConfig.High
    : (riskLevel.includes('medium') || riskLevel.includes('moderate'))
      ? riskConfig.Medium
      : riskLevel.includes('low')
        ? riskConfig.Low
        : riskConfig.Unknown;

  return (
    <section
      className="relative overflow-hidden rounded-[24px] border border-[#DDE3F0] dark:border-gray-700 bg-gradient-to-r from-[#F8FAFF] via-[#FFFFFF] to-[#EEF4FF] dark:from-[#0F172A] dark:via-[#111827] dark:to-[#0F172A] p-6 shadow-[0_8px_24px_rgba(15,23,42,0.08)] dark:shadow-none sm:p-8"
      aria-label="Patient profile header"
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#DCE6FF] dark:bg-[#1E3A8A]/20 blur-[70px]" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#E8F7FF] dark:bg-[#1E3A5F]/20 blur-[75px]" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <div className="h-[84px] w-[84px] rounded-full border-2 border-[#C7D2FE] dark:border-indigo-700 p-[3px] shadow-[0_0_0_4px_rgba(99,102,241,0.15)]">
              <img
                src={patient.avatar}
                alt={patient.name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-[#111827] bg-emerald-500" />
          </div>

          <div className="flex flex-col gap-1.5">
            <h1 className="text-[28px] font-extrabold leading-tight text-[#0F172A] dark:text-[#E2E8F0]">{patient.name}</h1>
            <div className="flex items-center gap-2 text-[14px] text-[#475569] dark:text-gray-400">
              <span>{patient.age} years old</span>
              <span className="h-1 w-1 rounded-full bg-[#94A3B8]" />
              <span>{patient.gender}</span>
              {patient.visitType && (
                <>
                  <span className="h-1 w-1 rounded-full bg-[#94A3B8]" />
                  <span className="flex items-center gap-1">
                    <HiOutlineCalendarDays className="text-[13px]" />
                    {patient.visitType}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold ${risk.bg} ${risk.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${risk.dot}`} />
                {patient.riskLevel}
              </span>
              {typeof patient.riskScore === 'number' ? (
                <span className="inline-flex items-center rounded-full border border-[#D1D5DB] dark:border-gray-600 bg-[#F8FAFC] dark:bg-[#1E293B] px-3 py-1 text-[12px] text-[#475569] dark:text-gray-300">
                  Risk score: {Math.round(patient.riskScore)}%
                </span>
              ) : null}
              {patient.lastVisit && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D1D5DB] dark:border-gray-600 bg-[#F8FAFC] dark:bg-[#1E293B] px-3 py-1 text-[12px] text-[#475569] dark:text-gray-300">
                  <LuClock className="text-[11px]" />
                  Last visit: {patient.lastVisit}
                </span>
              )}
              {patient.chatExpired && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D1D5DB] dark:border-gray-600 bg-[#F8FAFC] dark:bg-[#1E293B] px-3 py-1 text-[12px] text-[#475569] dark:text-gray-300">
                  <LuShieldCheck className="text-[11px]" />
                  {patient.chatExpired}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col min-[480px]:flex-row flex-wrap items-stretch gap-3">
          <button
            type="button"
            onClick={onAddMedical}
            className="group flex h-12 cursor-pointer items-center justify-center gap-2 rounded-[12px] border border-[#CBD5E1] dark:border-gray-600 bg-white dark:bg-[#1E293B] px-5 text-[14px] font-medium text-[#1E293B] dark:text-[#E2E8F0] transition-all hover:border-[#94A3B8] dark:hover:border-gray-400 hover:shadow-sm"
          >
            <HiOutlineDocumentPlus className="text-[18px] text-[#60A5FA] group-hover:scale-110 transition-transform" />
            Add Medical Records
          </button>
          <button
            type="button"
            onClick={onAddPrescription}
            className="group flex h-12 cursor-pointer items-center justify-center gap-2 rounded-[12px] border border-[#CBD5E1] dark:border-gray-600 bg-white dark:bg-[#1E293B] px-5 text-[14px] font-medium text-[#1E293B] dark:text-[#E2E8F0] transition-all hover:border-[#94A3B8] dark:hover:border-gray-400 hover:shadow-sm"
          >
            <HiOutlineDocumentText className="text-[18px] text-[#A78BFA] group-hover:scale-110 transition-transform" />
            Add Prescription
          </button>
          <button
            type="button"
            onClick={onMessage}
            className="group flex h-12 cursor-pointer items-center justify-center gap-2 rounded-[12px] bg-gradient-to-r from-[#333CF5] to-[#4F46E5] px-6 text-[14px] font-bold text-white shadow-[0_6px_18px_rgba(51,60,245,0.28)] transition-all hover:from-[#2C34D8] hover:to-[#4338CA] hover:shadow-[0_8px_22px_rgba(51,60,245,0.34)]"
          >
            <HiOutlineChatBubbleLeftRight className="text-[18px] group-hover:scale-110 transition-transform" />
            Message
          </button>
        </div>
      </div>
    </section>
  );
};

export default PatientProfileHero;
