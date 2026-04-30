import React from 'react';
import { NavLink } from 'react-router-dom';
import { LuLayoutDashboard, LuClipboardList } from 'react-icons/lu';
import { FaHeartPulse, FaUserDoctor } from 'react-icons/fa6';
import {
  HiOutlineCalendarDays,
  HiOutlineChatBubbleLeftRight,
  HiOutlineCog6Tooth,
  HiOutlineArrowLeftOnRectangle,
  HiOutlineDocumentText,
  HiOutlineQrCode,
  HiOutlineBookOpen,
} from 'react-icons/hi2';
import { MdOutlineMedicalInformation } from 'react-icons/md';
import logo from '../../../../assets/logo/logo.svg';

const MENU_ITEMS = [
  { label: 'Dashboard', path: '/patient/dashboard', icon: <LuLayoutDashboard /> },
  { label: 'Health Survey', path: '/patient/survey', icon: <LuClipboardList /> },
  { label: 'Heart Risk Assessment', path: '/patient/heart-risk', icon: <FaHeartPulse /> },
  { label: 'Doctor List', path: '/patient/doctors', icon: <FaUserDoctor /> },
  { label: 'Appointments', path: '/patient/appointments', icon: <HiOutlineCalendarDays /> },
  { label: 'Messages', path: '/patient/messages', icon: <HiOutlineChatBubbleLeftRight /> },
  { label: 'Prescription', path: '/patient/prescription', icon: <HiOutlineDocumentText /> },
  { label: 'Medical Records', path: '/patient/records', icon: <MdOutlineMedicalInformation /> },
  { label: 'QR Code', path: '/patient/qr', icon: <HiOutlineQrCode /> },
  { label: 'Stories & community', path: '/patient/stories', icon: <HiOutlineBookOpen /> },
];

const linkBase = 'relative flex items-center gap-2 px-3 py-1 rounded-[8px] text-[11px] font-semibold transition-all duration-200 no-underline cursor-pointer text-indigo-600/80 hover:text-indigo-700 dark:text-indigo-200 dark:hover:text-indigo-50 border border-transparent hover:bg-indigo-500/5 dark:hover:bg-indigo-500/20';
const linkActiveClass = '!text-indigo-700 dark:!text-indigo-50 bg-indigo-500/10 dark:bg-indigo-500/25';

const PatientSidebar = ({ onClose, onLogout }) => {
  return (
    /* أضفنا group هنا لمراقبة الهوفر على السايدبار بالكامل */
    <div className="group flex flex-col w-full sm:w-[260px] md:w-[280px] max-w-full h-[100dvh] sm:h-full min-h-0 bg-white dark:bg-[#111827] rounded-[24px] overflow-hidden border border-gray-100 dark:border-gray-800/50 shadow-sm transition-all duration-300 ease-in-out">

      {/* ── Logo ── */}
      <div className="flex items-center gap-2 px-4 py-3 shrink-0">
        <img src={logo} alt="Logo" className="w-6 h-6 shrink-0" onError={e => e.target.style.display = 'none'} />
        <span className="text-[24px] font-bold text-black-main-text dark:text-[#E2E8F0] tracking-tight">
          Pulse<span className="text-[#333CF5]">X</span>
        </span>
      </div>

      {/* ── Navigation ── */}
      {/* السكرول دائم لتعمل بشكل صحيح على الشاشات اللمسية بدون hover */}
      <nav
        className="flex-1 min-h-0 py-2 overflow-y-auto overflow-x-hidden overscroll-contain [scrollbar-gutter:stable] custom-sidebar-scroll"
        aria-label="Patient menu"
      >

        <div className="px-2">
          <p className="text-[12px] font-normal text-gray-400 dark:text-gray-300 px-2 mb-[28px]">Menu</p>
          <ul className="space-y-4 list-none p-0 m-0">
            {MENU_ITEMS.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) => `${linkBase} ${isActive ? linkActiveClass : ''}`}
                  aria-label={item.label}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#333CF5] rounded-r-full" />
                      )}
                      <span className="text-[24px] shrink-0">{item.icon}</span>
                      <span className="text-[14px] truncate">{item.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="mt-[40px] m-2 border-t border-[#75757526] dark:border-gray-700/70 pt-4">
            <p className="text-[12px] font-normal text-gray-400 dark:text-gray-300 px-2 mb-1">General</p>
            <ul className="mt-[40px] space-y-4 list-none p-0 m-0">
              <li>
                <NavLink
                  to="/patient/settings"
                  onClick={onClose}
                  className={({ isActive }) => `${linkBase} ${isActive ? linkActiveClass : ''}`}
                  aria-label="Settings and profile"
                >
                  {({ isActive }) => (
                    <>
                      {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#333CF5] rounded-r-full" />}
                      <HiOutlineCog6Tooth className="text-[24px] shrink-0" />
                      <span className="text-[14px]">Settings & Profile</span>
                    </>
                  )}
                </NavLink>
              </li>
              <li>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-[11px] font-semibold text-indigo-600/80 dark:text-indigo-200 hover:text-red-500 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all border border-transparent bg-transparent cursor-pointer"
                  aria-label="Log out"
                >
                  <HiOutlineArrowLeftOnRectangle className="text-[24px] shrink-0" />
                  <span className="text-[14px]">Log out</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* ستيل إضافي لجعل السكرول بار أنيق ورفيع */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-sidebar-scroll {
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }
        .custom-sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .custom-sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-sidebar-scroll::-webkit-scrollbar-thumb {
          background: #333cf520;
          border-radius: 10px;
          cursor: pointer;
        }
        .custom-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: #333CF5;
        }
        @media (max-width: 640px) {
          .custom-sidebar-scroll::-webkit-scrollbar {
            width: 3px;
          }
        }
      `}} />
    </div>
  );
};

export default PatientSidebar;