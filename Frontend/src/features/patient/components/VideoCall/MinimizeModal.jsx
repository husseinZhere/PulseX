import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlineArrowsPointingIn } from 'react-icons/hi2';

const MinimizeModal = ({ isOpen, onClose, onConfirm, duration }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-[#111827] rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl dark:shadow-none p-8 text-center"
      >
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
          <HiOutlineArrowsPointingIn className="text-[#333CF5] dark:text-[#60A5FA] text-3xl" />
        </div>
        
        <h2 className="text-[24px] font-bold text-[#010218] dark:text-[#E2E8F0] mb-2">Minimize Video Call?</h2>
        <p className="text-gray-500 text-[14px] leading-relaxed mb-8">
          Continue your consultation with Dr. Jehan Osama in the background while you browse other pages.
        </p>

        <div className="bg-blue-50/50 dark:bg-[#1E293B] rounded-2xl p-4 mb-8 text-left">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[14px] text-gray-500 dark:text-gray-400">Call duration:</span>
            <span className="text-[14px] font-bold text-black dark:text-gray-100">{duration}</span>
          </div>
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-[14px] font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full" /> Call will continue in background
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={onClose}
            className="cursor-pointer flex-1 py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="cursor-pointer flex-1 py-4 rounded-2xl bg-[#333CF5] text-white font-bold shadow-lg dark:shadow-none shadow-blue dark:shadow-none-200 hover:bg-blue-700 transition-colors"
          >
            Minimize Call
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default MinimizeModal;