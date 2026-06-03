import { HiOutlinePencilAlt } from 'react-icons/hi';

const WriteStoryHeader = ({ isEditing }) => {
  return (
    <header>
      <div className="flex items-center gap-1 mb-1">
        <HiOutlinePencilAlt className="text-black-main-text dark:text-[#E2E8F0] text-xl" />
        <h1 className="text-2xl font-bold text-black-main-text dark:text-[#E2E8F0]">{isEditing ? 'Edit Story' : 'Write Story'}</h1>
      </div>
      <p className="text-lg text-[var(--ws-muted)]">
        {isEditing ? 'Update your story and save your changes.' : 'Share your personal health journey to inspire others.'}
      </p>
    </header>
  );
};

export default WriteStoryHeader;
