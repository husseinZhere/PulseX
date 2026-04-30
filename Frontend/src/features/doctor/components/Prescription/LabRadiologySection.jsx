import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi2';
import { LuTestTubeDiagonal } from 'react-icons/lu';

const LabRadiologySection = ({ requests, onAddRequest, onRemoveRequest, onRequestChange }) => {
  return (
    <section className="rounded-2xl border border-[#E6EAF0] dark:border-gray-700 bg-white dark:bg-[#111827] overflow-hidden">
      <div className="bg-[#EAF8EE] dark:bg-[#1E293B] px-4 py-3">
        <h2 className="flex items-center gap-2 text-[16px] font-semibold text-black-main-text dark:text-[#E2E8F0]">
          <LuTestTubeDiagonal className="text-[14px] text-[#16A34A]" />
          <span>Lab & Radiology Requests</span>
        </h2>
      </div>

      <div className="space-y-3 p-4 sm:p-5">
        {requests.map((request, index) => (
          <article key={request.id} className="rounded-xl border border-[#E5E7EB] dark:border-gray-700 bg-[#F9FAFB] dark:bg-[#0B1120] p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[14px] font-bold text-[#364153] dark:text-gray-200">Request #{index + 1}</h3>
              {requests.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveRequest(request.id)}
                  className="cursor-pointer inline-flex h-8 w-8 items-center justify-center rounded-full text-[#EF4444] transition-colors hover:bg-[#FEE2E2] dark:bg-[#1E293B]"
                  aria-label={`Remove request ${index + 1}`}
                >
                  <HiOutlineTrash className="text-[16px]" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-[12px] font-bold text-[#4A5565] dark:text-gray-300">
                  Test/Scan Name <span className="text-[#DC2626]">*</span>
                </span>
                <input
                  type="text"
                  value={request.testName}
                  onChange={(event) => onRequestChange(request.id, 'testName', event.target.value)}
                  placeholder="e.g., Complete Blood Count (CBC)"
                  className="h-11 w-full rounded-lg border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-[#111827] px-3 text-[14px]  dark:text-gray-100 outline-none  text-[#111827] dark:text-gray-100 transition-colors placeholder:text-[#9CA3AF] focus:border-[#10B981]"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-[12px] font-bold text-[#4A5565] dark:text-gray-300">Additional Notes <span className="text-[#99A1AF] font-medium">(Optional)</span></span>
                <input
                  type="text"
                  value={request.notes}
                  onChange={(event) => onRequestChange(request.id, 'notes', event.target.value)}
                  placeholder="e.g., Fasting required"
                  className="h-11 w-full rounded-lg border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-[#111827] px-3 text-[14px]  dark:text-gray-100 outline-none  text-[#111827] dark:text-gray-100 transition-colors placeholder:text-[#9CA3AF] focus:border-[#10B981]"
                />
              </label>
            </div>
          </article>
        ))}

        <button
          type="button"
          onClick={onAddRequest}
          className="cursor-pointer flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#86EFAC] bg-[#F0FDF4] dark:bg-[#1E293B] text-[16px] font-bold text-[#16A34A] transition-colors hover:bg-[#E8FBEF] dark:bg-[#1E293B]"
        >
          <HiOutlinePlus className="text-[18px]" />
          Add More Lab/Radiology Request
        </button>
      </div>
    </section>
  );
};

export default LabRadiologySection;
