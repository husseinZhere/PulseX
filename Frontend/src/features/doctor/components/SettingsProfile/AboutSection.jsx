import { HiOutlineCheck } from 'react-icons/hi2';
import { LuFileText } from 'react-icons/lu';

const AboutSection = ({ value, onChange, onSave }) => {
  return (
    <section className="overflow-hidden rounded-[16px] border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-[#111827]" aria-labelledby="doctor-about-title">
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] dark:border-gray-700 bg-gradient-to-r from-[#faf5ff] to-[#fdf2f8] dark:from-[#0B1120] dark:to-[#111827] px-6 py-4">
        <LuFileText className="text-[20px] text-[#9333EA] dark:text-[#C084FC]" />
        <h2 id="doctor-about-title" className="text-[18px] font-bold text-[#101828] dark:text-[#E2E8F0]">About</h2>
      </div>

      <div className="p-4 sm:p-5">
        <p className="mb-4 text-[14px] text-[#4a5565]">
          Write a professional bio about yourself, your experience, and expertise. This will be visible to patients.
        </p>
        <textarea
          rows={6}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Dr. [Your Name] is a highly experienced cardiologist with over a decade of practice in cardiovascular medicine..."
          className="w-full rounded-[14px] border border-[#E5E7EB] dark:border-gray-700 bg-[#F9FAFB] dark:bg-[#0B1120] px-4 py-3 text-[16px] text-[rgba(10,10,10,0.5)] outline-none text-[#111827] dark:text-gray-100 resize-y focus:border-[#9333EA]"
        />
        <p className="mt-2 text-[12px] text-[#6a7282]">Recommended: 200-500 characters</p>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={onSave}
            className="cursor-pointer inline-flex h-12 w-full sm:w-[200px] items-center justify-center gap-2 rounded-[24px] bg-[#9333EA] text-[16px] font-bold text-white shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-colors hover:bg-[#7E22CE]"
          >
            <HiOutlineCheck className="text-[18px]" /> Save Changes
          </button>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
