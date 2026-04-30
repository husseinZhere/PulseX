import { RiChatAiFill } from 'react-icons/ri';

const StoriesHeader = () => {
  return (
    <header className="flex flex-col pb-4 mb-8">
      <div className="flex items-center gap-1">
        <div className="w-10 h-10 flex items-center justify-center rounded-full text-white text-[20px] shrink-0">
          <RiChatAiFill className="text-black-main-text dark:text-[#E2E8F0]" />
        </div>

        <h1 className="text-[24px] font-bold text-black-main-text dark:text-[#E2E8F0]">
          Stories
        </h1>
      </div>

      <p className="text-[18px] text-gray-500 dark:text-gray-400 max-w-2xl ml-2">
        Read and share inspiring patient journeys.
      </p>
    </header>
  );
};

export default StoriesHeader;
