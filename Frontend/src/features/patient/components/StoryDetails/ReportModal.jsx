import React, { useState } from 'react';
import { HiX } from 'react-icons/hi';
import { IoSendSharp } from 'react-icons/io5';
import { HiOutlineFlag } from 'react-icons/hi';

const ReportModal = ({ onClose, onSubmit, categories }) => {
  const [cat, setCat] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = cat !== '' && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    await onSubmit({ category: cat, reason });
    setSubmitting(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#111827] rounded-2xl w-full max-w-md shadow-2xl dark:shadow-none overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-[#FEF2F2] dark:bg-[#1E1015]">
          <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
            <HiOutlineFlag className="text-red-500 text-lg" />
          </div>
          <div className="flex-1">
            <h3 className="text-[15px] font-bold text-[#111827] dark:text-[#E2E8F0]">Report Story</h3>
            <p className="text-[11px] text-[#6b7280] dark:text-gray-400 mt-0.5">Help us keep the community safe</p>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close report modal"
          >
            <HiX className="text-lg" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-[#374151] dark:text-[#E2E8F0] mb-1.5 block">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-[#F9FAFB] dark:bg-[#0B1120] text-sm outline-none text-[#111827] dark:text-gray-100 focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30 transition appearance-none cursor-pointer"
            >
              <option value="" disabled>Select a category...</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#374151] dark:text-[#E2E8F0] mb-1.5 block">
              Reason <span className="text-[#9ca3af]">(optional)</span>
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide details about why you're reporting this..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-[#F9FAFB] dark:bg-[#0B1120] text-sm outline-none text-[#111827] dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30 transition"
            />
          </div>

          {!cat && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <span>⚠</span> Please select a category to submit the report.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 pb-5">
          <button
            onClick={onClose}
            className="cursor-pointer flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-[#374151] dark:text-[#E2E8F0] hover:bg-gray-50 dark:hover:bg-[#1E293B] transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="cursor-pointer flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <IoSendSharp /> {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
