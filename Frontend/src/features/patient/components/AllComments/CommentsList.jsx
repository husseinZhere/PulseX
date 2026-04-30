import { HiOutlineReply, HiOutlineFlag } from 'react-icons/hi';
import { IoSendSharp } from 'react-icons/io5';
import { AiOutlineLike } from 'react-icons/ai';
import Avatar from './Avatar';

const CommentsList = ({
  comments,
  likedIds,
  replyingTo,
  replyText,
  onLike,
  onReplyToggle,
  onReplyTextChange,
  onReplyCancel,
  onPostReply,
  onReport,
  userAvatar,
  userInitials,
}) => {
  return (
    <section className="flex flex-col gap-4" aria-label="Comments list">
      {comments.map((c) => {
        const likeKey = `${c.id}`;
        const liked = !!likedIds[likeKey];
        return (
          <article key={c.id} className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-start gap-3">
              <Avatar img={c.avatar} initials={c.initials} size="w-11 h-11" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <p className="text-sm font-semibold text-black-main-text dark:text-[#E2E8F0]">{c.user}</p>
                  <p className="text-xs text-[#6A7282] dark:text-gray-400">{c.time}</p>
                </div>
                <p className="text-sm text-[#364153] dark:text-gray-300 mt-1 leading-relaxed">{c.text}</p>

                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  <button
                    onClick={() => onLike(c.id)}
                    className={`cursor-pointer flex items-center gap-1 text-xs font-medium transition
                      ${liked ? 'text-brand-main' : 'text-[#4A5565] dark:text-gray-400 hover:text-brand-main'}`}
                  >
                    <AiOutlineLike className="text-base" /> {c.likes}
                  </button>
                  <button
                    onClick={() => onReplyToggle(c.id)}
                    className="cursor-pointer flex items-center gap-1 text-xs font-medium text-[#4A5565] dark:text-gray-400 hover:text-brand-main transition"
                  >
                    <HiOutlineReply className="text-base" /> Reply
                  </button>
                  <button
                    onClick={() => onReport(c.id)}
                    className="cursor-pointer flex items-center gap-1 text-xs font-medium text-[#4A5565] dark:text-gray-400 hover:text-red-500 transition"
                  >
                    <HiOutlineFlag className="text-base" /> Report
                  </button>
                </div>

                {replyingTo === c.id && (
                  <div className="mt-3 flex items-start gap-2">
                    <Avatar img={userAvatar} initials={userInitials || 'U'} size="w-7 h-7" />
                    <div className="flex-1 flex flex-col gap-2">
                      <textarea
                        rows={2} value={replyText} onChange={onReplyTextChange}
                        placeholder={`Reply to ${c.user}...`}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-[#F6F7F8] dark:bg-[#0B1120] text-xs text-black-main-text dark:text-[#E2E8F0] placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none resize-none focus:border-brand-main"
                      />
                      <div className="flex flex-wrap justify-end gap-2">
                        <button onClick={onReplyCancel} className="cursor-pointer text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">Cancel</button>
                        <button onClick={() => onPostReply(c.id)}
                          className="cursor-pointer flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-main text-white text-xs font-semibold hover:bg-[#2730d4]">
                          <IoSendSharp /> Reply
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {c.replies.length > 0 && (
              <section className="mt-4 ml-14 flex flex-col gap-3 border-l-2 border-gray-100 dark:border-gray-800 pl-4" aria-label="Replies">
                {c.replies.map((r) => {
                  const rKey = `${c.id}-${r.id}`;
                  const rLiked = !!likedIds[rKey];
                  return (
                    <article key={r.id} className="flex items-start gap-3">
                      <Avatar img={r.avatar} initials={r.initials} size="w-7 h-7" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <p className="text-xs font-semibold text-black-main-text dark:text-[#E2E8F0]">{r.user}</p>
                          <p className="text-xs text-[#6A7282] dark:text-gray-400">{r.time}</p>
                        </div>
                        <p className="text-xs text-[#364153] dark:text-gray-300 mt-0.5 leading-relaxed">{r.text}</p>
                        <button
                          onClick={() => onLike(c.id, r.id)}
                          className={`cursor-pointer flex items-center gap-1 text-xs mt-2 transition
                            ${rLiked ? 'text-brand-main' : 'text-gray-500 dark:text-gray-400 hover:text-brand-main'}`}
                        >
                          <AiOutlineLike /> {r.likes}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </section>
            )}
          </article>
        );
      })}
    </section>
  );
};

export default CommentsList;
