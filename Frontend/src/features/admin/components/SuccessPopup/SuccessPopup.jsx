import React from 'react';
import { HiOutlineCheckCircle } from "react-icons/hi2";

const SuccessPopup = ({ isOpen, title, desc }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-end justify-center pb-8 z-50 pointer-events-none">
      <div className="relative pointer-events-auto flex items-center gap-3 px-5 py-4 bg-white dark:bg-[#111827] rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-gray-100 dark:border-gray-800 min-w-[280px] max-w-[360px] overflow-hidden">
        {/* Icon */}
        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#DCFCE7] shrink-0">
          <HiOutlineCheckCircle className="text-[20px] text-[#059669]" />
        </div>
        {/* Text */}
        <div className="flex flex-col min-w-0">
          <span className="text-[13px] font-semibold text-black-main-text dark:text-[#E2E8F0] leading-tight">{title}</span>
          <span className="text-[12px] text-gray-500 mt-0.5 leading-tight">{desc}</span>
        </div>
        {/* Bottom accent bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#059669] to-[#34d399] rounded-b-[16px]" />
      </div>
    </div>
  );
};

export default SuccessPopup;
