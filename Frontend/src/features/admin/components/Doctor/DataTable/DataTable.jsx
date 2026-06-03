import React from 'react';
import { FiEdit3, FiTrash2 } from "react-icons/fi";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6";
import UserAvatar from "../../shared/UserAvatar";

export default function DataTable({
  data,
  selectedItems,
  onToggle,
  onEdit,
  onDeleteIndividual,
  onBulkDelete,
  onClearSelection
}) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const allSelected = currentItems.length > 0 && currentItems.every(i => selectedItems.includes(i.id));

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      currentItems.forEach(item => { if (!selectedItems.includes(item.id)) onToggle(item.id); });
    } else {
      onClearSelection();
    }
  };

  return (
    /* الـ relative هنا ضروري عشان الـ Absolute بار يتسنتر عليه */
    <div className="relative flex flex-col gap-4">

      {/* Floating Bulk Bar - Absolute Position */}
      {selectedItems.length > 0 && (
        <div className="absolute top-[70px] left-1/2 -translate-x-1/2 z-20 flex w-max max-w-[95vw] flex-wrap justify-center items-center gap-3 px-3 py-2 bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.15)] animate-in fade-in slide-in-from-top-4 duration-300">
          {/* Badge: Number Selected */}
          <div className="px-3 py-2 bg-[#333CF5] text-white text-[12px] font-bold rounded-lg whitespace-nowrap">
            {selectedItems.length} Users Selected
          </div>

          {/* Action: Delete */}
          <button
            onClick={onBulkDelete}
            className="px-4 py-2 cursor-pointer text-[12px] font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all active:scale-95"
          >
            Delete Selected
          </button>

          {/* Action: Cancel */}
          <button
            onClick={onClearSelection}
            className="px-4 py-2 cursor-pointer text-[12px] font-bold text-neutral-500 dark:text-gray-300 bg-zinc-100 dark:bg-[#0B1120] border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-[#1F2937] transition-all active:scale-95"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-visible sm:overflow-x-auto rounded-2xl sm:rounded-xl border-0 sm:border sm:border-gray-200 dark:border-gray-700/70 bg-white dark:bg-[#111827] my-3">
        <table className="w-full min-w-full sm:min-w-[560px] border-collapse">
          <thead className="hidden sm:table-header-group">
            <tr className="bg-[#333CF5] text-white text-center">
              <th className="w-10 px-4 py-4">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded accent-white cursor-pointer border-2 border-white/30"
                />
              </th>
              <th className="px-4 py-4 text-[14px] font-normal whitespace-nowrap">Full Name</th>
              <th className="px-4 py-4 text-[14px] font-normal whitespace-nowrap">Email</th>
              <th className="px-4 py-4 text-[14px] font-normal whitespace-nowrap">Age</th>
              <th className="px-4 py-4 text-[14px] font-normal whitespace-nowrap">Location</th>
              <th className="px-4 py-4 text-[14px] font-normal whitespace-nowrap">Price</th>
              <th className="px-4 py-4 text-[14px] font-normal whitespace-nowrap">Joined Date</th>
              <th className="px-4 py-4 text-[14px] font-normal text-center whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, idx) => {
              const isSelected = selectedItems.includes(item.id);
              return (
                <tr
                  key={item.id}
                  className={`block sm:table-row rounded-2xl sm:rounded-none overflow-hidden border border-slate-200/80 dark:border-gray-700/70 sm:border-b sm:border-gray-100 sm:dark:border-gray-800 shadow-[0_6px_18px_rgba(15,23,42,0.08)] sm:shadow-none mb-4 sm:mb-0 transition-colors text-center ${isSelected
                    ? 'bg-[#EFF6FF] dark:bg-[#1E3A8A]/35'
                    : idx % 2 === 0
                      ? 'sm:bg-white sm:dark:bg-[#111827] bg-white dark:bg-[#111827]'
                      : 'sm:bg-[#F9FAFB] sm:dark:bg-[#0F172A] bg-white dark:bg-[#111827]'
                    } hover:bg-[#EFF6FF]/60 dark:hover:bg-[#1E3A8A]/25`}
                >
                  <td className="hidden sm:table-cell px-4 pt-3 pb-1 text-right sm:text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggle(item.id)}
                      className="w-4 h-4 rounded accent-[#155dfc] cursor-pointer ml-auto sm:ml-0"
                    />
                  </td>
                  <td className="block sm:table-cell px-4 py-3 text-center sm:text-left">
                    <div className="flex flex-row items-center justify-center sm:justify-start gap-3 rounded-xl bg-[#F7F7FA] dark:bg-[#0F172A] px-3 py-2 sm:bg-transparent sm:dark:bg-transparent sm:px-0 sm:py-0">
                      <UserAvatar src={item.image} name={item.fullName} size={36} />
                      <span className="text-[16px] font-semibold text-black-main-text dark:text-[#E2E8F0] truncate max-w-[170px]">
                        {item.fullName}
                      </span>
                    </div>
                  </td>
                  <td className="block sm:table-cell px-4 py-3 text-center">
                    <span className="text-[16px] text-gray-text-dim2 dark:text-gray-400 truncate block max-w-[220px] mx-auto">
                      {item.email}
                    </span>
                  </td>
                  <td className="block sm:table-cell px-4 py-3 text-center">
                    <span className="text-[16px] text-[#757575] dark:text-gray-400">
                      {item.age || '-'}
                    </span>
                  </td>
                  <td className="block sm:table-cell px-4 py-3 text-center">
                    <span className="text-[16px] text-gray-text-dim2 dark:text-gray-400 truncate block max-w-[160px] mx-auto">
                      {item.location || '-'}
                    </span>
                  </td>
                  <td className="block sm:table-cell px-4 py-3 text-center">
                    <span className="text-[16px] font-bold text-black-main-text dark:text-[#E2E8F0]">
                      ${item.price}
                    </span>
                  </td>
                  <td className="block sm:table-cell px-4 py-3 text-center">
                    <span className="text-[16px] text-gray-text-dim2 dark:text-gray-400 whitespace-nowrap">
                      {item.joinedDate}
                    </span>
                  </td>
                  <td className="block sm:table-cell px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => onEdit(item)}
                        className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-lg text-black-main-text dark:text-[#E2E8F0] hover:bg-[#EEF2FF] dark:hover:bg-[#1E293B] transition-all"
                        title="Edit"
                      >
                        <FiEdit3 size={15} />
                      </button>
                      <button
                        onClick={() => onDeleteIndividual(item)}
                        className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-lg text-[#DC3545] hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                        title="Delete"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            className=" w-10 h-10 flex cursor-pointer items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1E293B] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <FaAngleLeft size={14} />
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-10 h-10 flex   cursor-pointer items-center justify-center rounded-full text-[16px] font-bold transition-all ${currentPage === i + 1 ? 'bg-[#333CF5] text-white' : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1E293B]'
                }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            className="w-10 h-10 flex cursor-pointer items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1E293B] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <FaAngleRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}