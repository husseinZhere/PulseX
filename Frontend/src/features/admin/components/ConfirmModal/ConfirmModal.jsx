import React from 'react';

export default function ConfirmModal({ isOpen, title, desc, onConfirm, onCancel }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#111827] rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-6 w-full max-w-[380px] flex flex-col gap-4">
        <h2 className="text-[18px] font-bold text-center text-black-main-text dark:text-[#E2E8F0]">{title}</h2>
        <p className="text-[16px] text-gray-text-dim2 leading-relaxed text-center">{desc}</p>
        <div className="flex items-center justify-center gap-3 pt-2 w-full">
          <button
            onClick={onCancel}
            className="flex-1 max-w-[150px] py-2.5 text-[14px] cursor-pointer font-semibold text-gray-600 dark:text-gray-300 bg-[#EFEFEF] dark:bg-[#1E293B] rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            No, Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 max-w-[150px] py-2.5 text-[14px] cursor-pointer font-semibold text-white bg-[#DC2626] rounded-full hover:bg-[#B91C1C] transition-colors"
          >
            Yes, Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
