import { FaExclamationCircle } from 'react-icons/fa';

const MedicationsSection = ({ data }) => {
  const medications = Array.isArray(data?.medications) ? data.medications : [];

  return (
    <section aria-labelledby="prescription-meds-title">
      <div className="flex items-center gap-2 text-black-main-text dark:text-[#EDE9FE] font-bold text-[16px] px-4 py-4 rounded-xl mb-5 bg-gradient-to-r from-[#FAF5FF] to-[#F3E8FF] dark:from-[#312E81]/35 dark:to-[#4C1D95]/35 border border-transparent dark:border-[#6D28D9]/35">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          role="img"
          aria-label="Medication icon"
        >
          <path
            d="M8.75082 17.0832L17.0841 8.74984C17.4735 8.36823 17.7834 7.91322 17.9959 7.41111C18.2083 6.90899 18.3191 6.36975 18.3219 5.82454C18.3246 5.27934 18.2193 4.739 18.0119 4.23477C17.8046 3.73054 17.4993 3.27242 17.1138 2.8869C16.7282 2.50137 16.2701 2.1961 15.7659 1.98873C15.2617 1.78136 14.7213 1.67601 14.1761 1.67876C13.6309 1.68152 13.0917 1.79232 12.5895 2.00478C12.0874 2.21723 11.6324 2.52711 11.2508 2.91651L2.91748 11.2498C2.52809 11.6314 2.21821 12.0865 2.00575 12.5886C1.7933 13.0907 1.68249 13.6299 1.67974 14.1751C1.67699 14.7203 1.78234 15.2607 1.98971 15.7649C2.19708 16.2691 2.50235 16.7273 2.88787 17.1128C3.27339 17.4983 3.73151 17.8036 4.23575 18.0109C4.73998 18.2183 5.28032 18.3237 5.82552 18.3209C6.37072 18.3182 6.90997 18.2074 7.41208 17.9949C7.91419 17.7824 8.36921 17.4726 8.75082 17.0832Z"
            stroke="#9810FA"
            strokeWidth="1.66667"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7.07812 7.0835L12.9115 12.9168"
            stroke="#9810FA"
            strokeWidth="1.66667"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h2 id="prescription-meds-title" className="m-0 text-[16px] font-bold">
          Prescribed Medications
        </h2>
      </div>

      <div className="flex flex-col gap-4">
        {medications.length > 0 ? medications.map((med, i) => (
          <article
            key={i}
            className="border border-[#f3f4f6] dark:border-gray-700 border-l-4 border-l-[#AD46FF] rounded-2xl p-5 flex gap-4 bg-white dark:bg-[#111827]"
          >
            <div className="w-8 h-8 bg-[#AD46FF] text-white rounded-lg flex items-center justify-center font-bold text-[16px] shrink-0">
              {i + 1}
            </div>
            <div className="flex-1">
              <h3 className="text-[18px] font-bold text-black-main-text dark:text-[#E2E8F0] m-0 mb-1">{med.name}</h3>
              <p className="text-[14px] text-gray-600 dark:text-gray-300 m-0 mb-4">Dosage: {med.dose}</p>
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[120px] bg-[#fafafa] dark:bg-[#0F172A] border border-[#f3f4f6] dark:border-gray-700 rounded-xl p-3">
                  <span className="text-[12px] text-gray-500 dark:text-gray-400 block mb-1">Frequency</span>
                  <strong className="text-[14px] text-black-main-text dark:text-[#E2E8F0] font-semibold">{med.freq}</strong>
                </div>
                <div className="flex-1 min-w-[100px] bg-[#fafafa] dark:bg-[#0F172A] border border-[#f3f4f6] dark:border-gray-700 rounded-xl p-3">
                  <span className="text-[12px] text-gray-500 dark:text-gray-400 block mb-1">Duration</span>
                  <strong className="text-[16px] text-black-main-text dark:text-[#E2E8F0] font-semibold">{med.dur}</strong>
                </div>
              </div>
            </div>
          </article>
        )) : (
          <article className="border border-[#f3f4f6] dark:border-gray-700 rounded-2xl p-5 bg-white dark:bg-[#111827] text-[14px] text-gray-600 dark:text-gray-300">
            No medications listed in this prescription.
          </article>
        )}
      </div>

      <aside className="flex items-start gap-3 bg-[#FFFBEB] dark:bg-[#3F2A05] border border-[#FEE685] dark:border-[#B88A1D] rounded-xl p-4 mt-5">
        <FaExclamationCircle className="text-[#E17100] text-[18px] shrink-0 mt-[2px]" aria-label="Important" />
        <div>
          <h3 className="text-[16px] font-bold text-[#7B3306] dark:text-[#FCD34D] m-0 mb-1">Important Instructions</h3>
          <p className="text-[14px] text-[#973C00] dark:text-[#FDE68A] m-0 leading-relaxed">{data.instructions || 'Follow your doctor instructions exactly as prescribed.'}</p>
        </div>
      </aside>
    </section>
  );
};

export default MedicationsSection;
