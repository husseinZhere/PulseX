import { useEffect } from 'react';
import { HiOutlineFaceSmile, HiOutlinePaperClip } from 'react-icons/hi2';
import { MdSend } from 'react-icons/md';
import { AnimatePresence, motion } from 'framer-motion';

const EMOJIS = ['😊', '❤️', '👍', '🏥', '💊', '👨‍⚕️', '🙏', '💪', '😷', '🩺'];

const MessageInputBar = ({
  input,
  onChange,
  onSend,
  onPickFile,
  showEmoji,
  setShowEmoji,
  fileRef,
}) => {
  useEffect(() => {
    const close = (e) => { if (!e.target.closest('[data-emoji]')) setShowEmoji(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [setShowEmoji]);

  return (
    <footer className="sticky bottom-0 z-10 lg:static px-4 py-3 bg-white dark:bg-[#111827] border-t border-gray-200 dark:border-gray-700 shrink-0">
      <div className="flex items-center gap-2">
        <input type="file" ref={fileRef} className="hidden" onChange={onPickFile} accept="image/*" />
        <button
          aria-label="Attach file"
          className="cursor-pointer shrink-0 w-9 h-9 rounded-xl bg-gray-50 dark:bg-[#1E293B] hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          <HiOutlinePaperClip className="text-gray-500 dark:text-gray-300 text-lg" />
        </button>

        <div className="flex-1 flex min-w-0 items-center bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 gap-2 focus-within:border-[#333CF5] transition-colors">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSend(input)}
            className="bg-transparent outline-none flex-1 text-[13px] text-black-main-text dark:text-[#E2E8F0] placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          <div data-emoji className="relative flex items-center">
            <button
              type="button"
              data-emoji
              aria-label="Emoji"
              className={`w-7 h-7 cursor-pointer rounded-lg flex items-center justify-center transition-all duration-200 ${showEmoji ? 'bg-gray-200 dark:bg-gray-700 shadow-inner' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              onClick={(e) => { e.stopPropagation(); setShowEmoji((s) => !s); }}
            >
              <HiOutlineFaceSmile className={`text-lg pointer-events-none transition-transform ${showEmoji ? 'text-gray-700 dark:text-gray-200 scale-110' : 'text-gray-500 dark:text-gray-400'}`} />
            </button>
            <AnimatePresence>
              {showEmoji && (
                <motion.div
                  data-emoji
                  className="absolute bottom-12 right-0 mb-1 w-[240px] bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-[16px] shadow-xl p-3 flex flex-wrap justify-center gap-2 z-50 origin-bottom-right"
                  initial={{ opacity: 0, y: 15, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                >
                  {EMOJIS.map((em) => (
                    <button
                      type="button"
                      key={em}
                      data-emoji
                      className="w-9 h-9 cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-xl transition-all hover:scale-110 active:scale-95"
                      onClick={(e) => { e.stopPropagation(); onChange((v) => v + em); }}
                    >
                      {em}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <button
          aria-label="Send message"
          className={`shrink-0 w-9 h-9 cursor-pointer rounded-xl flex items-center justify-center transition-colors ${input.trim() ? 'bg-[#333CF5] hover:bg-[#2830d4]' : 'bg-gray-100 dark:bg-[#1E293B] cursor-not-allowed'}`}
          onClick={() => onSend(input)}
          disabled={!input.trim()}
        >
          <MdSend className={`text-lg ${input.trim() ? 'text-white' : 'text-gray-400'}`} />
        </button>
      </div>
    </footer>
  );
};

export default MessageInputBar;
