import { TbFileText } from 'react-icons/tb';

const ClinicalNotesSection = ({ data }) => {
  return (
    <section aria-labelledby="prescription-notes-title">
      <div className="flex items-center gap-2 text-black-main-text dark:text-[#FED7AA] font-bold text-[16px] px-4 py-3 rounded-xl mb-5 bg-gradient-to-r from-[#FFF7ED] to-[#FFEDD4] dark:from-[#431407] dark:to-[#7C2D12] border border-transparent dark:border-[#EA580C]/30">
        <TbFileText className="text-[16px] text-[#F54900]" aria-label="Clinical notes" />
        <h2 id="prescription-notes-title" className="m-0 text-[16px] font-bold">
          Clinical Notes &amp; Instructions
        </h2>
      </div>
      <div className="bg-[#f9fafb] dark:bg-[#0F172A] border border-[#f3f4f6] dark:border-gray-700 rounded-xl p-5 text-[16px] text-gray-700 dark:text-gray-200 leading-relaxed">
        {data.clinicalNotes || 'No additional clinical notes.'}
      </div>
    </section>
  );
};

export default ClinicalNotesSection;
