import { FaExclamationTriangle } from 'react-icons/fa';
import { LuTrash2 } from 'react-icons/lu';

const ConfirmDeleteModal = ({ open, ids, label, onClose, onConfirm }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(1,2,24,0.45)' }}
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#111827] rounded-[22px] shadow-xl p-6 max-w-sm w-full flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
          <FaExclamationTriangle className="text-red-600 text-xl" />
        </div>
        <h3 className="text-[16px] font-bold text-black-main-text dark:text-[#E2E8F0]">
          Delete {ids.length > 1 ? `${ids.length} Files` : 'File'}?
        </h3>
        <p className="text-[13px] text-neutral-500 text-center leading-relaxed">
          {ids.length > 1
            ? `Are you sure you want to delete ${ids.length} selected files? This action cannot be undone.`
            : `Are you sure you want to delete "${label}"? This action cannot be undone.`}
        </p>
        <div className="flex gap-3 w-full">
          <button
            className="flex-1 border cursor-pointer border-gray-200 dark:border-gray-700 rounded-xl py-2.5 text-[13px] font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="flex-1 cursor-pointer text-white rounded-xl py-2.5 text-[13px] font-bold flex items-center justify-center gap-2 transition-colors"
            style={{ background: '#E7000B' }}
            onClick={onConfirm}
          >
            <LuTrash2 /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
