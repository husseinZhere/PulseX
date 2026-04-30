import { HiOutlineDocumentText } from 'react-icons/hi2';

const ClinicalNotesSection = ({ value, onChange }) => {
  return (
    <section className="rounded-2xl border border-[#E6EAF0] dark:border-gray-700 bg-white dark:bg-[#111827] overflow-hidden">
      <div className="bg-[#FEF6E9] dark:bg-[#1E293B] px-4 py-3">
        <h2 className="flex items-center gap-2 text-[16px] font-semibold text-black-main-text dark:text-[#E2E8F0]">
          <HiOutlineDocumentText className="text-[14px] text-[#EA580C]" />
          <span>Clinical Notes</span>
        </h2>
      </div>

      <div className="p-4 sm:p-5">
        <label htmlFor="clinical-notes" className="mb-2 block text-[14px] font-bold text-[#364153] dark:text-gray-200">
          Additional Instructions & Advice
        </label>
        <textarea
          id="clinical-notes"
          rows={4}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Enter clinical notes, special instructions, follow-up recommendations, lifestyle advice, or any other relevant information for the patient..."
          className="w-full resize-y rounded-xl border border-[#E5E7EB] dark:border-gray-700 bg-[#F9FAFB] dark:bg-[#0B1120] px-4 py-3 text-[14px]  dark:text-gray-100 outline-none  text-[#111827] dark:text-gray-100 transition-colors placeholder:text-[#9CA3AF] focus:border-[#F59E0B]"
        />
      </div>
    </section>
  );
};

export default ClinicalNotesSection;
