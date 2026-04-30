import { HiOutlineHeart, HiHeart, HiOutlineChatAlt2, HiOutlineShare, HiOutlineFlag } from 'react-icons/hi';

const EngagementBar = ({
  isLiked,
  likesCount,
  commentsCount,
  shares,
  showCommentBox,
  onLike,
  onToggleComments,
  onShare,
  onReport,
}) => {
  return (
    <section className="bg-white dark:bg-[#111827] rounded-2xl px-5 py-4 border border-gray-100 dark:border-gray-800 shadow-sm dark:shadow-none flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-8" aria-label="Engagement">
      <button
        onClick={onLike}
        className={`cursor-pointer flex items-center gap-1.5 text-sm rounded-full p-1 font-medium transition shrink-0 ${isLiked ? 'text-[#E7000B] bg-[#FEF2F2] dark:bg-[#1E293B] rounded-full p-1' : 'text-[#4B5563]  hover:text-[#E7000B]'}`}
      >
        {isLiked ? <HiHeart className="text-lg" /> : <HiOutlineHeart className="text-lg" />}
        {likesCount}
      </button>

      <button
        onClick={onToggleComments}
        className={`cursor-pointer flex items-center gap-1.5 text-sm font-medium transition shrink-0 ${showCommentBox ? 'text-brand-main bg-[#EFF6FF] dark:bg-[#1E293B] rounded-full p-1 ' : 'text-[#4B5563] hover:text-brand-main'}`}
      >
        <HiOutlineChatAlt2 className="text-lg" /> {commentsCount}
      </button>

      <button onClick={onShare} className="cursor-pointer flex items-center gap-1.5 text-sm font-medium text-[#4B5563] hover:text-brand-main transition shrink-0">
        <HiOutlineShare className="text-lg" /> {shares}
      </button>

      <button onClick={onReport} className="cursor-pointer flex items-center gap-1.5 text-sm font-medium text-[#4B5563] hover:text-red-500 transition shrink-0">
        <HiOutlineFlag className="text-lg" /> Report
      </button>
    </section>
  );
};

export default EngagementBar;
