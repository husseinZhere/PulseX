import { HiCheckCircle } from 'react-icons/hi2';

const PrescriptionSuccessToast = ({ visible }) => {
  if (!visible) return null;

  return (
    <section className="fixed right-4 top-24 z-[1100] w-[340px] max-w-[calc(100vw-2rem)] rounded-[12px] border border-[#E5E7EB] dark:border-gray-700 bg-[#F3F5F6] dark:bg-[#1E293B] px-4 py-3 shadow-[0_8px_22px_rgba(17,24,39,0.18)]">
      <div className="flex items-start gap-2.5">
        <span className="mt-[1px] inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#CFFAE6] text-[#0A9E63]">
          <HiCheckCircle className="text-[17px]" />
        </span>
        <div>
          <p className="text-[15px] leading-tight font-semibold text-[#111827] dark:text-gray-200">Sent Successfully</p>
          <p className="mt-1 text-[12px] leading-tight text-[#9CA3AF]">Your Prescription have been Sent successfully</p>
        </div>
      </div>
    </section>
  );
};

export default PrescriptionSuccessToast;
