import { IoSendSharp } from 'react-icons/io5';
import Avatar from './Avatar';

const AddCommentSection = ({ newComment, onChange, onPost, userAvatar, userInitials }) => {
  return (
    <section className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm" aria-label="Add a comment">
      <h2 className="text-sm font-bold text-black-main-text dark:text-[#E2E8F0] mb-3">Add a Comment</h2>
      <div className="flex items-start gap-3">
        <Avatar img={userAvatar} initials={userInitials || 'U'} size="w-10 h-10" />
        <textarea
          rows={3} value={newComment} onChange={onChange}
          placeholder="Share your thoughts..."
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-[#F9FAFB] dark:bg-[#0F172A] text-sm text-black-main-text dark:text-[#E2E8F0] placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none resize-none focus:border-brand-main transition"
        />
      </div>
      <div className="flex justify-end mt-3">
        <button onClick={onPost}
          className="cursor-pointer flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-brand-main text-white text-sm font-semibold hover:bg-[#2730d4] transition">
          <IoSendSharp /> Post Comment
        </button>
      </div>
    </section>
  );
};

export default AddCommentSection;
