import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import PatientSidebar from '../PatientSidebar/PatientSidebar';
import PatientHeader from '../PatientHeader/PatientHeader';
import PatientChatbot from '../PatientChatbot/PatientChatbot';
import { HiBars3 } from 'react-icons/hi2';
import { useAuth } from '../../../../context/AuthContext';
import IncomingCallOverlay from '../../../../components/VideoCall/IncomingCallOverlay';

const PatientMainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const excludedRoutes = ['/patient/messages', '/patient/settings', '/chat-page'];
  const shouldShowChatbot = !excludedRoutes.includes(location.pathname);

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F6F7F8] dark:bg-[#0B1120] font-roboto p-[20px] flex gap-[20px] relative box-border items-stretch transition-colors duration-300">

      {/* ── Mobile Overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar Column ── */}
      <div className={`
        fixed lg:relative top-0 left-0 z-50 transition-transform duration-300 ease-in-out shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        h-screen lg:h-auto 
      `}>
        <aside
          className="w-[260px] bg-white dark:bg-[#111827] shadow-sm dark:shadow-[0px_10px_30px_rgba(0,0,0,0.03)] rounded-[24px] border border-gray-100 dark:border-gray-800/60 dark:border-gray-800 flex flex-col 
                     lg:sticky lg:top-[20px] lg:h-[calc(100vh-40px)]
                     overflow-y-auto scrollbar-none hover:scrollbar-thin"
        >
          <PatientSidebar
            onClose={() => setSidebarOpen(false)}
            onLogout={() => setIsLogoutModalOpen(true)}
          />
        </aside>
      </div>

      {/* ── Right Column ── */}
      <div className="flex-1 flex flex-col gap-[20px] min-w-0">

        {/* Header */}
        <div className="h-[70px] bg-white dark:bg-[#111827] shadow-sm dark:shadow-none rounded-[20px] px-6 flex items-center border border-gray-100 dark:border-gray-800/60 dark:border-gray-800 z-40 shrink-0 transition-all">
          <button
            className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 mr-3 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Open sidebar"
            onClick={() => setSidebarOpen(true)}
          >
            <HiBars3 className="w-6 h-6" />
          </button>
          <div className="flex-1 min-w-0">
            <PatientHeader onLogout={() => setIsLogoutModalOpen(true)} />
          </div>
        </div>

        {/* Main Content */}
        <main
          aria-label="Patient page content"
          className="bg-white dark:bg-[#111827] shadow-sm dark:shadow-none rounded-[24px] border border-gray-100 dark:border-gray-800/60 dark:border-gray-800 flex-1 lg:min-h-[calc(100vh-130px)] overflow-hidden"
        >
          <Outlet />
        </main>
      </div>

      {/* ── Chatbot ── */}
      {shouldShowChatbot && <PatientChatbot />}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-4">
          {/* Card */}
          <div className="bg-white dark:bg-[#111827] rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-6 w-full max-w-[380px] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">

            {/* Title */}
            <h2 className="text-[18px] font-bold text-center text-black-main-text dark:text-[#E2E8F0]">
              Log Out?
            </h2>

            {/* Description */}
            <p className="text-[16px] text-[#757575] dark:text-gray-400 leading-relaxed text-center">
              Are you sure you want to log out of your account?
            </p>

            {/* Buttons */}
            <div className="flex items-center justify-center gap-3 pt-2 w-full">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 max-w-[150px] py-2.5 text-[14px] cursor-pointer font-semibold text-gray-600 dark:text-gray-300 bg-[#EFEFEF] dark:bg-[#1E293B] rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                No, Cancel
              </button>

              <button
                onClick={handleConfirmLogout}
                className="flex-1 max-w-[150px] py-2.5 text-[14px] cursor-pointer font-semibold text-white bg-[#333CF5] rounded-full hover:bg-[#155dfc] transition-colors shadow-md dark:shadow-none shadow-blue-100"
              >
                Yes, Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <IncomingCallOverlay currentRole="Patient" />
    </div>
  );
};

export default PatientMainLayout;