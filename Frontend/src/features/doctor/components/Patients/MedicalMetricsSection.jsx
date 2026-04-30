import { LuActivity, LuHeartPulse, LuTestTube } from 'react-icons/lu';
import {
  BLOOD_COUNT_OPTIONS,
  BLOOD_PRESSURE_OPTIONS,
  HEART_RATE_OPTIONS,
} from '../../../../utils/healthMetrics';

const Input = ({ label, icon, value, onChange }) => (
  <label className="block">
    <span className="mb-1 block text-[12px] font-semibold text-[#374151] dark:text-gray-300">{label} <span className="text-[#DC2626]">*</span></span>
    <div className="flex items-center gap-2 rounded-xl border border-[#D1D5DB] bg-[#F9FAFB] dark:bg-[#0B1120] px-3">
      <span className="text-[#9CA3AF]">{icon}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full bg-transparent text-[14px] outline-none text-[#111827] dark:text-gray-100"
      />
    </div>
  </label>
);

const Select = ({ label, icon, value, onChange, options }) => (
  <label className="block">
    <span className="mb-1 block text-[12px] font-semibold text-[#374151] dark:text-gray-300">{label} <span className="text-[#DC2626]">*</span></span>
    <div className="flex items-center gap-2 rounded-xl border border-[#D1D5DB] bg-[#F9FAFB] dark:bg-[#0B1120] px-3">
      <span className="text-[#9CA3AF]">{icon}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full bg-transparent text-[14px] outline-none text-[#111827] dark:text-gray-100"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  </label>
);

const MedicalMetricsSection = ({ values, onChange }) => {
  return (
    <section className="rounded-2xl border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-[#111827] p-4" aria-labelledby="medical-input-title">
      <h2 id="medical-input-title" className="text-[24px] font-bold text-black-main-text dark:text-[#E2E8F0]">Medical Information</h2>
      <p className="text-[18px] text-[#6B7280] dark:text-gray-400">Enter or update the patient's medical details.</p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Select label="Heart Rate" icon={<LuHeartPulse />} value={values.heartRate} onChange={(value) => onChange('heartRate', value)} options={HEART_RATE_OPTIONS} />
        <Select label="Blood Pressure" icon={<LuActivity />} value={values.bloodPressure} onChange={(value) => onChange('bloodPressure', value)} options={BLOOD_PRESSURE_OPTIONS} />
        <Select label="Blood Count" icon={<LuTestTube />} value={values.bloodCount} onChange={(value) => onChange('bloodCount', value)} options={BLOOD_COUNT_OPTIONS} />
        <Input label="Cholesterol" icon={<LuActivity />} value={values.cholesterol} onChange={(value) => onChange('cholesterol', value)} />
      </div>
    </section>
  );
};

export default MedicalMetricsSection;
