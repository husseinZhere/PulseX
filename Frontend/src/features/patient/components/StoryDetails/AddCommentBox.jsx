import { IoSendSharp } from 'react-icons/io5';
import Avatar from './Avatar';

const AddCommentBox = ({
  storyAuthorImg,
  comment,
  onChange,
  onCancel,
  onPost,
}) => {
  return (
    <section className="bg-[#EFF6FF] dark:bg-[#1E3A8A]/20 rounded-2xl p-5 border border-[#BEDBFF] dark:border-[#1D4ED8]/35 shadow-sm transition-all animate-in fade-in slide-in-from-top-2" aria-label="Add comment">
      <div className="flex items-start gap-3">
        <Avatar img={storyAuthorImg} initials="Y" size="w-9 h-9" />
        <div className="flex-1 bg-[#FFFFFF] dark:bg-[#0F172A] rounded-xl px-4 py-3 min-h-[80px] border border-transparent dark:border-gray-700">
          <textarea
            rows={2} value={comment}
            autoFocus
            onChange={onChange}
            placeholder="Write your comment..."
            className="w-full bg-transparent text-sm outline-none resize-none text-black-main-text dark:text-[#E2E8F0] placeholder:text-gray-400"
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row flex-wrap justify-end gap-3 mt-3">
        <button onClick={onCancel} className="w-full sm:w-auto cursor-pointer text-sm text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 transition">Cancel</button>
        <button
          onClick={onPost}
          className="w-full sm:w-auto cursor-pointer flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-brand-main text-white text-sm font-semibold hover:bg-[#2730d4] transition"
        >
          <IoSendSharp /> Post Comment
        </button>
      </div>
    </section>
  );
};

export default AddCommentBox;
