const PrescriptionConfirmModal = ({ isOpen, onCancel, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div
      className="cursor-pointer fixed inset-0 z-[1200] flex items-center justify-center bg-black/45 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Confirm send prescription"
      onClick={onCancel}
    >
      <div
        className="cursor-pointer w-full max-w-[420px] rounded-3xl bg-white dark:bg-[#111827] p-6 shadow-[0_24px_65px_rgba(0,0,0,0.2)]"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-[22px] font-bold text-black-main-text dark:text-[#E2E8F0]">Send Prescription?</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-[#6B7280]">
          Confirm sending this prescription now. The patient will receive medications, lab requests, and notes immediately.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer h-11 rounded-full border border-[#E5E7EB] dark:border-gray-700 px-5 text-[14px] font-semibold text-[#374151] transition-colors hover:bg-[#F3F4F6] dark:bg-[#1E293B]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="cursor-pointer h-11 rounded-full bg-[#333CF5] px-5 text-[14px] font-semibold text-white shadow-[0_10px_20px_rgba(51,60,245,0.3)] transition-colors hover:bg-[#2C34D8]"
          >
            Yes, Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionConfirmModal;
