import React from 'react';
import { motion } from 'framer-motion';
import { MdCallEnd } from 'react-icons/md';

const EndCallModal = ({ isOpen, onClose, onConfirm, duration, doctorName }) => {
  if (!isOpen) return null;

  return (
    <aside
      role="dialog"
      aria-modal="true"
      aria-labelledby="end-call-title"
      className="fixed inset-0 z-[110] grid place-items-center bg-black/65 p-3 backdrop-blur-sm sm:p-4"
    >
      <motion.section
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md rounded-3xl bg-white dark:bg-[#111827] p-5 text-center shadow-2xl sm:p-8"
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40 sm:mb-6 sm:h-20 sm:w-20">
          <MdCallEnd className="text-xl text-red-600 dark:text-red-400" />
        </div>

        <header className="mb-5 sm:mb-6">
          <h2 id="end-call-title" className="text-xl font-bold text-slate-950 dark:text-[#E2E8F0] sm:text-xl">
            End Video Call?
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300 sm:text-base">
            Are you sure you want to end this consultation with {doctorName}?
          </p>
        </header>

        <section className="mb-5 rounded-2xl bg-gray-50 dark:bg-[#1E293B] p-4 text-sm sm:mb-6">
          <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
            <span>Call duration:</span>
            <time className="font-bold text-gray-900 dark:text-gray-100" dateTime={duration}>
              {duration}
            </time>
          </div>
        </section>

        <footer className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onClose}
            className="h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 font-bold text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 sm:h-14"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-12 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 font-bold text-white shadow-[0px_4px_6px_-4px_rgba(251,44,54,0.30)] shadow-[0px_10px_15px_-3px_rgba(251,44,54,0.30)] transition-opacity hover:opacity-95 sm:h-14"
          >
            End Call
          </button>
        </footer>
      </motion.section>
    </aside>
  );
};

export default EndCallModal;
