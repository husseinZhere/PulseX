import { TbBook } from 'react-icons/tb';

const StoryDetailsHeader = () => {
  return (
    <header>
      <div className="flex items-center gap-2 mb-1">
        <TbBook className="text-xl text-black-main-text dark:text-[#E2E8F0]" />
        <h1 className="text-lg font-bold text-black-main-text dark:text-[#E2E8F0]">Story Details</h1>
      </div>
      <p className="text-sm text-[var(--story-muted)]">Read full journey details and shared experiences.</p>
    </header>
  );
};

export default StoryDetailsHeader;
