import { LuFileText, LuTrash2 } from 'react-icons/lu';

const DocumentsCardsMobile = ({ documents, selected, toggleSelect, openConfirm, brand }) => {
  return (
    <div className="sm:hidden flex flex-col gap-2 px-3 pb-3">
      {documents.length === 0 && (
        <div className="text-center py-10 text-[14px] text-neutral-400 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-[#FAFBFF]">
          No documents yet. Upload your first file above.
        </div>
      )}

      {documents.map((doc) => {
        const isChecked = selected.includes(doc.id);
        return (
          <div
            key={doc.id}
            className={`rounded-2xl border p-3 transition-colors ${isChecked ? 'border-[#BFC4FF] bg-[#EEF0FF] dark:border-[#334155] dark:bg-[#1E293B]/50' : 'border-[#E5E7EB] dark:border-gray-700 bg-[#FAFBFF] dark:bg-[#0F172A]'}`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <label className="flex items-center gap-2 min-w-0">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleSelect(doc.id)}
                  className="rounded-[5px] border-2 border-gray-300 accent-[#333CF5] cursor-pointer"
                  style={{ width: '18px', height: '18px' }}
                />
                <div className="flex items-center gap-2 min-w-0">
                  <LuFileText className="text-[15px] shrink-0" style={{ color: brand.main }} />
                  <p className="font-semibold text-[13px] truncate text-black-main-text dark:text-[#E2E8F0]">{doc.name}</p>
                </div>
              </label>

              <button
                className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                onClick={() => openConfirm([doc.id], doc.name)}
                title="Delete"
              >
                <LuTrash2 className="text-[18px]" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[13px]">
              <div className="rounded-xl px-3 py-2 bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800">
                <p className="text-gray-400 dark:text-gray-500">Type</p>
                <p className="font-bold text-black-main-text dark:text-[#E2E8F0]">{doc.type}</p>
              </div>
              <div className="rounded-xl px-3 py-2 bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800">
                <p className="text-gray-400 dark:text-gray-500">Size</p>
                <p className="font-semibold text-gray-500 dark:text-gray-300">{doc.size}</p>
              </div>
              <div className="rounded-xl px-3 py-2 bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800">
                <p className="text-gray-400 dark:text-gray-500">Uploaded Date</p>
                <p className="font-semibold text-gray-500 dark:text-gray-300">{doc.date}</p>
              </div>
              <div className="rounded-xl px-3 py-2 bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800">
                <p className="text-gray-400 dark:text-gray-500">Record Type</p>
                <p className="font-semibold text-gray-500 dark:text-gray-300 truncate">{doc.category}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DocumentsCardsMobile;
