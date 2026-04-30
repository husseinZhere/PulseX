import { LuActivity, LuDroplets, LuHeartPulse, LuShieldPlus, LuTestTube } from 'react-icons/lu';
import { HiOutlinePlus } from 'react-icons/hi2';

const VITAL_CARDS = [
  { key: 'heartRate', label: 'Heart Rate', unit: 'bpm', icon: <LuHeartPulse className="text-[#EF4444]" /> },
  { key: 'bloodPressure', label: 'Blood Pressure', unit: 'mmHg', icon: <LuActivity className="text-[#3B82F6]" /> },
  { key: 'bloodSugar', label: 'Blood Sugar', unit: 'mg/dL', icon: <LuDroplets className="text-[#EAB308]" /> },
  { key: 'cholesterol', label: 'Cholesterol', unit: 'mg/dL', icon: <LuShieldPlus className="text-[#A855F7]" /> },
  { key: 'bloodCount', label: 'Blood Count', unit: 'CBC', icon: <LuTestTube className="text-[#22C55E]" /> },
];

const PatientVitalsSection = ({ patient, onAddVitals }) => {
  if (!patient.vitals) {
    return (
      <section className="mt-2" aria-labelledby="vitals-title-empty">
        <h2 id="vitals-title-empty" className="mb-4 text-[20px] font-semibold text-[#010218] dark:text-[#E2E8F0]">Vital Signs</h2>
        <article className="relative overflow-hidden rounded-[20px] border border-[#F59E0B]/20 bg-gradient-to-r from-[#FFFBEB] via-[#FFFFFF] to-[#FFF7ED] p-6 shadow-[0_8px_28px_rgba(249,115,22,0.12)] sm:p-8">
          <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-[#FED7AA]/35 blur-[50px]" />

          <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex shrink-0 h-16 w-16 items-center justify-center rounded-[16px] bg-[#F97316]/10 border border-[#F97316]/20">
              <span className="text-[28px] font-black text-[#F97316]">!</span>
            </div>
            
            <div className="flex flex-col flex-1">
              <h3 className="text-[20px] font-bold text-[#7C2D12]">No Vital Signs Recorded Yet</h3>
              <p className="mt-2 text-[15px] text-[#9A3412]">Patient vital signs data is currently empty. Adding vital signs will:</p>
              
              <ul className="mt-4 flex flex-col gap-2 list-disc pl-5 text-[14px] text-[#9A3412]">
                <li>Display comprehensive health metrics on patient dashboard</li>
                <li>Help track patient's health progress over time</li>
                <li>Enable better medical decision making</li>
                <li>Provide quick health status overview for emergency situations</li>
              </ul>
              
              <button
                type="button"
                onClick={onAddVitals}
                className="cursor-pointer mt-6 inline-flex w-fit items-center gap-2 rounded-[12px] bg-gradient-to-r from-[#F97316] to-[#EA580C] h-[44px] px-6 text-[14px] font-bold text-white shadow-[0_4px_16px_rgba(249,115,22,0.35)] transition-all hover:shadow-[0_6px_20px_rgba(249,115,22,0.45)] hover:scale-[1.02]"
              >
                <HiOutlinePlus className="text-[18px]" /> Add Vital Signs
              </button>
            </div>
          </div>
        </article>
      </section>
    );
  }

  return (
    <section className="mt-6" aria-labelledby="vitals-title">
      <h2 id="vitals-title" className="text-[24px] font-bold text-black-main-text dark:text-[#E2E8F0]">Vital Signs</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {VITAL_CARDS.map((card) => (
          <article key={card.key} className="rounded-2xl border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-[#111827] p-3 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">{card.icon} {card.label}</div>
            <p className={`mt-2 text-[30px] font-bold ${card.key === 'bloodCount' ? 'text-[#16A34A]' : 'text-black-main-text dark:text-[#E2E8F0]'}`}>
              {patient.vitals[card.key]}
            </p>
            <p className="text-[12px] text-[#9CA3AF]">{card.unit}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default PatientVitalsSection;
