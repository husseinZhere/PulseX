import { HiOutlineReply, HiOutlineFlag, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { IoSendSharp } from 'react-icons/io5';
import { AiOutlineLike } from 'react-icons/ai';
import Avatar from './Avatar';

const CommentsList = ({
  comments,
  likedIds,
  replyingTo,
  replyText,
  editingId,
  editText,
  currentUserId,
  onLike,
  onReplyToggle,
  onReplyTextChange,
  onReplyCancel,
  onPostReply,
  onReport,
  onDelete,
  onEditStart,
  onEditTextChange,
  onEditCancel,
  onEditSave,
  userAvatar,
  userInitials,
}) => {
  return (
    <section className="flex flex-col gap-4" aria-label="Comments list">
      {comments.map((c) => {
        const likeKey = `${c.id}`;
        const liked = !!likedIds[likeKey];
        const isOwner = currentUserId != null && c.userId === currentUserId;
        const isEditing = editingId === c.id;

        return (
          <article key={c.id} className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm dark:shadow-none">
            <div className="flex items-start gap-3">
              <Avatar img={c.avatar} initials={c.initials} size="w-11 h-11" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <p className="text-sm font-semibold text-black-main-text dark:text-[#E2E8F0]">{c.user}</p>
                  <p className="text-xs text-[#6A7282]">{c.time}</p>
                </div>

                {isEditing ? (
                  <div className="mt-2 flex flex-col gap-2">
                    <textarea
                      rows={3} value={editText} onChange={onEditTextChange} autoFocus
                      className="w-full px-3 py-2 rounded-xl border border-brand-main bg-[#F6F7F8] dark:bg-[#1E293B] text-sm outline-none text-[#111827] dark:text-gray-100 resize-none"
                    />
                    <div className="flex flex-wrap justify-end gap-2">
                      <button onClick={onEditCancel} className="cursor-pointer text-xs text-gray-400 hover:text-gray-600">Cancel</button>
                      <button onClick={() => onEditSave(c.id)}
                        className="cursor-pointer flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-main text-white text-xs font-semibold hover:bg-[#2730d4]">
                        <IoSendSharp /> Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[#364153] dark:text-gray-200 mt-1 leading-relaxed">{c.text}</p>
                )}

                {!isEditing && (
                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    <button
                      onClick={() => onLike(c.id)}
                      className={`cursor-pointer flex items-center gap-1 text-xs font-medium transition
                        ${liked ? 'text-brand-main' : 'text-[#4A5565] dark:text-gray-300 hover:text-brand-main'}`}
                    >
                      <AiOutlineLike className="text-base" /> {c.likes}
                    </button>
                    <button
                      onClick={() => onReplyToggle(c.id)}
                      className="cursor-pointer flex items-center gap-1 text-xs font-medium text-[#4A5565] dark:text-gray-300 hover:text-brand-main transition"
                    >
                      <HiOutlineReply className="text-base" /> Reply
                    </button>
                    {isOwner && (
                      <>
                        <button
                          onClick={() => onEditStart(c)}
                          className="cursor-pointer flex items-center gap-1 text-xs font-medium text-[#4A5565] dark:text-gray-300 hover:text-brand-main transition"
                        >
                          <HiOutlinePencil className="text-base" /> Edit
                        </button>
                        <button
                          onClick={() => onDelete(c.id)}
                          className="cursor-pointer flex items-center gap-1 text-xs font-medium text-[#4A5565] dark:text-gray-300 hover:text-red-500 transition"
                        >
                          <HiOutlineTrash className="text-base" /> Delete
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => onReport(c.id)}
                      className="cursor-pointer flex items-center gap-1 text-xs font-medium text-[#4A5565] dark:text-gray-300 hover:text-red-500 transition"
                    >
                      <HiOutlineFlag className="text-base" /> Report
                    </button>
                  </div>
                )}

                {replyingTo === c.id && (
                  <div className="mt-3 flex items-start gap-2">
                    <Avatar img={userAvatar} initials={userInitials || 'U'} size="w-7 h-7" />
                    <div className="flex-1 flex flex-col gap-2">
                      <textarea
                        rows={2} value={replyText} onChange={onReplyTextChange}
                        placeholder={`Reply to ${c.user}...`}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-[#F6F7F8] dark:bg-[#1E293B] text-xs outline-none text-[#111827] dark:text-gray-100 resize-none focus:border-brand-main"
                      />
                      <div className="flex flex-wrap justify-end gap-2">
                        <button onClick={onReplyCancel} className="cursor-pointer text-xs text-gray-400 hover:text-gray-600">Cancel</button>
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
                  const rIsOwner = currentUserId != null && r.userId === currentUserId;
                  const rIsEditing = editingId === r.id;

                  return (
                    <article key={r.id} className="flex items-start gap-3">
                      <Avatar img={r.avatar} initials={r.initials} size="w-7 h-7" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <p className="text-xs font-semibold text-black-main-text dark:text-[#E2E8F0]">{r.user}</p>
                          <p className="text-xs text-[#6A7282]">{r.time}</p>
                        </div>

                        {rIsEditing ? (
                          <div className="mt-2 flex flex-col gap-2">
                            <textarea
                              rows={2} value={editText} onChange={onEditTextChange} autoFocus
                              className="w-full px-3 py-2 rounded-xl border border-brand-main bg-[#F6F7F8] dark:bg-[#1E293B] text-xs outline-none text-[#111827] dark:text-gray-100 resize-none"
                            />
                            <div className="flex flex-wrap justify-end gap-2">
                              <button onClick={onEditCancel} className="cursor-pointer text-xs text-gray-400 hover:text-gray-600">Cancel</button>
                              <button onClick={() => onEditSave(r.id)}
                                className="cursor-pointer flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-main text-white text-xs font-semibold hover:bg-[#2730d4]">
                                <IoSendSharp /> Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-[#364153] dark:text-gray-200 mt-0.5 leading-relaxed">{r.text}</p>
                        )}

                        {!rIsEditing && (
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <button
                              onClick={() => onLike(c.id, r.id)}
                              className={`cursor-pointer flex items-center gap-1 text-xs transition
                                ${rLiked ? 'text-brand-main' : 'text-gray-400 hover:text-brand-main'}`}
                            >
                              <AiOutlineLike /> {r.likes}
                            </button>
                            {rIsOwner && (
                              <>
                                <button
                                  onClick={() => onEditStart(r)}
                                  className="cursor-pointer flex items-center gap-1 text-xs text-gray-400 hover:text-brand-main transition"
                                >
                                  <HiOutlinePencil /> Edit
                                </button>
                                <button
                                  onClick={() => onDelete(r.id)}
                                  className="cursor-pointer flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition"
                                >
                                  <HiOutlineTrash /> Delete
                                </button>
                              </>
                            )}
                          </div>
                        )}
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
