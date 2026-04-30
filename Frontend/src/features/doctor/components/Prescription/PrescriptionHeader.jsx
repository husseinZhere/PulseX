import { LuFileText } from 'react-icons/lu';

const PrescriptionHeader = () => {
  return (
    <header className="flex items-start gap-[12px]">
      <span className="flex h-[30px] w-8 items-center justify-center text-[#364153] dark:text-gray-200 shrink-0">
        <LuFileText className="text-[24px] stroke-[2.5px]" />
      </span>
      <div>
        <h1 className="text-[24px] leading-[30px] font-bold text-[#010218] dark:text-[#E2E8F0]">New E-Prescription</h1>
        <p className="mt-1 text-[14px] leading-snug text-[#4A5565] dark:text-gray-300">Create and send digital prescription to patient</p>
      </div>
    </header>
  );
};

export default PrescriptionHeader;
