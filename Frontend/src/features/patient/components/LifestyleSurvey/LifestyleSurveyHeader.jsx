import { HiOutlineClipboardDocumentList } from 'react-icons/hi2';

const LifestyleSurveyHeader = () => {
  return (
    <header className="flex items-center gap-4 mb-2 rounded-full">
      <HiOutlineClipboardDocumentList className="text-[32px] text-black-main-text dark:text-[#E2E8F0] shrink-0" aria-label="Survey" />
      <h1 className="text-black-main-text dark:text-[#E2E8F0] text-[24px] font-roboto font-semibold tracking-[0.01em] break-words">
        Health Lifestyle Survey
      </h1>
    </header>
  );
};

export default LifestyleSurveyHeader;
