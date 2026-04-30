import { HiOutlineArrowRight } from 'react-icons/hi2';

const SectionHeader = ({ title, onViewMore }) => (
  <div className="h-10 rounded-2xl relative overflow-visible sm:overflow-hidden shrink-0 mb-2">
    <div className="flex justify-between items-center sm:absolute sm:left-0 sm:right-0 sm:top-2.25">
      <h3 className="text-sm font-semibold font-['Roboto'] text-black-main-text dark:text-[#E2E8F0]">{title}</h3>
      <button
        onClick={onViewMore}
        className="cursor-pointer flex items-center gap-1 text-xs font-normal font-['Roboto'] text-black-main-text dark:text-gray-300 hover:opacity-90 transition-opacity"
      >
        View More <HiOutlineArrowRight size={10} />
      </button>
    </div>
  </div>
);

export default SectionHeader;
