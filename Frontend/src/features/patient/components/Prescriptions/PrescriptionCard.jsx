import React, { useState } from 'react';
import { HiOutlineCalendar } from 'react-icons/hi2';
import { LuDownload, LuEye } from 'react-icons/lu';
import { resolveFileUrl } from '../../../../utils/api';

const PrescriptionCard = ({ item, index, visible, onView, onDownload }) => {
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isActive = item.status === 'Active';
  const medsCount = item.medications?.length ?? 0;
  const testsCount = item.labs?.length ?? 0;
  const delay = 200 + index * 80;
  const doctorAvatar = resolveFileUrl(item.doctorAvatar || '') || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.doc || 'Doctor')}&background=EEF2FF&color=334155`;

  const handleDownload = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      await onDownload(item);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="bg-white dark:bg-[#111827] rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800"
      style={{
        opacity: visible ? 1 : 0,
        transform: hovered
          ? 'translateY(-6px) scale(1.015)'
          : visible
            ? 'translateY(0) scale(1)'
            : 'translateY(28px) scale(0.97)',
        transition: hovered
          ? `transform 0.28s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s ease, opacity 0.5s ease ${delay}ms`
          : `opacity 0.5s ease ${delay}ms, transform 0.35s cubic-bezier(0.4,0,0.2,1), box-shadow 0.28s ease`,
        boxShadow: hovered
          ? '0 20px 40px -8px rgba(51,60,245,0.18), 0 8px 16px -4px rgba(0,0,0,0.08)'
          : '0 10px 15px -3px rgba(0,0,0,0.05)',
      }}
    >
      <div
        className={`px-5 py-4 flex items-start justify-between transition-colors duration-300 ${isActive ? 'bg-[#F0FDF4] dark:bg-[#052E1F]' : 'bg-[#F9FAFB] dark:bg-[#1F2937]'}`}
        style={{
          transition: 'background-color 0.3s ease',
        }}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-full bg-brand-main text-white flex items-center justify-center text-[20px] shrink-0 transition-transform duration-300 overflow-hidden"
              style={{ transform: hovered ? 'scale(1.1) rotate(-4deg)' : 'scale(1) rotate(0deg)' }}
            >
              <img
                src={doctorAvatar}
                alt={item.doc}
                className="w-full h-full object-cover"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.doc || 'Doctor')}&background=EEF2FF&color=334155`;
                }}
              />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-black-main-text dark:text-[#E2E8F0] m-0 leading-tight">{item.doc}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[14px] text-gray-500 dark:text-gray-300 ml-1">
            <HiOutlineCalendar className="text-[14px] shrink-0 text-gray-500 dark:text-gray-300" aria-label="Issued date" />
            <span>Issued: <span className="text-gray-600 dark:text-gray-200">{item.date}</span></span>
          </div>
        </div>

        <span
          className={`px-3 py-[3px] rounded-full text-[12px] font-bold shrink-0 transition-transform duration-300 ${isActive ? 'bg-[#00C950] text-white' : 'bg-[#99A1AF] text-white'}`}
          style={{ transform: hovered ? 'scale(1.06)' : 'scale(1)' }}
        >
          {item.status}
        </span>
      </div>

      <div className="px-5 py-4">
        <div className="flex justify-between text-[14px] mb-2">
          <span className="text-gray-500 dark:text-gray-400">Medications</span>
          <strong className="text-black-main-text dark:text-[#E2E8F0]">{medsCount} item{medsCount !== 1 ? 's' : ''}</strong>
        </div>
        <div className="flex justify-between text-[13px] mb-3">
          <span className="text-gray-500 dark:text-gray-400">Tests Requested</span>
          <strong className="text-black-main-text dark:text-[#E2E8F0]">{testsCount} item{testsCount !== 1 ? 's' : ''}</strong>
        </div>
        <p className="text-[11px] text-gray-text-dim2 dark:text-gray-400 border-t border-[#f3f4f6] dark:border-gray-700 pt-3 m-0">ID: {item.refId || item.id}</p>

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <button
            onClick={onView}
            className="flex-1 flex items-center justify-center gap-2 bg-brand-main text-white font-semibold text-[13px] py-[10px] rounded-xl cursor-pointer border-none transition-all duration-300 hover:opacity-90 active:scale-95"
            style={{
              transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
              boxShadow: hovered ? '0 6px 16px rgba(51,60,245,0.35)' : 'none',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease, opacity 0.2s ease',
            }}
          >
            <LuEye className="text-[14px]" aria-label="View prescription" /> View
          </button>

          <button
            onClick={handleDownload}
            disabled={loading}
            aria-label="Download prescription"
            className="w-full sm:w-11 h-10 flex items-center justify-center bg-white dark:bg-[#0F172A] border border-[#e5e7eb] dark:border-gray-700 rounded-xl text-[#364153] dark:text-gray-300 text-[18px] cursor-pointer transition-all duration-300 hover:bg-[#f9fafb] dark:hover:bg-[#1F2937] hover:text-brand-main active:scale-90"
            style={{
              transform: hovered && !loading ? 'translateY(-1px)' : 'translateY(0)',
              transition: 'transform 0.25s ease, background 0.2s ease, color 0.2s ease',
            }}
          >
            {loading
              ? <div className="w-5 h-5 border-2 border-brand-main border-t-transparent rounded-full animate-spin" />
              : <LuDownload aria-label="Download icon" />
            }
          </button>
        </div>
      </div>
    </article>
  );
};

export default PrescriptionCard;
