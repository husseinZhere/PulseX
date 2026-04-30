import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import DoctorSidebar from '../DoctorSidebar/DoctorSidebar';
import DoctorHeader from '../DoctorHeader/DoctorHeader';
import { HiBars3, HiXMark } from 'react-icons/hi2';
import { useAuth } from '../../../../context/AuthContext';
import IncomingCallOverlay from '../../../../components/VideoCall/IncomingCallOverlay';

const DoctorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#0B1120] font-roboto p-5 flex gap-5 relative box-border items-stretch transition-colors duration-300">
      {sidebarOpen && (
        <div
          className="cursor-pointer fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`
          fixed lg:relative top-0 left-0 z-50 transition-transform duration-300 ease-in-out shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          h-screen lg:h-auto
        `}
      >
        <aside
          aria-label="Doctor navigation"
          className="w-[280px] bg-white dark:bg-[#111827] shadow-[0px_10px_30px_rgba(0,0,0,0.03)] rounded-[32px] border border-gray-100 dark:border-gray-800 flex flex-col lg:sticky lg:top-5 lg:h-[calc(100vh-40px)] overflow-hidden"
        >
          <button
            className="cursor-pointer lg:hidden absolute top-5 right-5 z-50 p-2 rounded-xl bg-gray-50 dark:bg-[#111827] text-gray-600 hover:bg-red-50 hover:text-red-500 transition-all"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <HiXMark className="w-5 h-5" />
          </button>

          <DoctorSidebar
            onClose={() => setSidebarOpen(false)}
            onLogout={() => setIsLogoutModalOpen(true)}
          />
        </aside>
      </div>

      <div className="flex-1 flex flex-col gap-5 min-w-0">
        <header className="h-[80px] bg-white dark:bg-[#111827] shadow-sm dark:shadow-none rounded-[24px] px-8 flex items-center border border-gray-100 dark:border-gray-800 z-40 shrink-0 transition-all">
          <button
            className="cursor-pointer lg:hidden p-2.5 rounded-xl bg-gray-50 dark:bg-[#111827] text-gray-600 mr-4 hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <HiBars3 className="w-6 h-6" />
          </button>

          <div className="flex-1 min-w-0">
            <DoctorHeader />
          </div>
        </header>

        <main
          aria-label="Doctor page content"
          className="bg-white dark:bg-[#111827] shadow-sm dark:shadow-none rounded-[32px] border border-gray-100 dark:border-gray-800 flex-1 relative overflow-hidden flex flex-col lg:min-h-[calc(100vh-145px)]"
        >
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            <Outlet />
          </div>
        </main>
      </div>

      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-6 w-full max-w-[380px] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-[18px] font-bold text-center text-black-main-text dark:text-[#E2E8F0]">Log Out?</h2>
            <p className="text-[16px] text-[#757575] leading-relaxed text-center">
              Are you sure you want to log out of your account?
            </p>
            <div className="flex items-center justify-center gap-3 pt-2 w-full">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 max-w-[150px] py-2.5 text-[14px] cursor-pointer font-semibold text-gray-600 bg-[#ECEEF2] dark:bg-[#1E293B] rounded-full hover:bg-gray-200 transition-colors"
              >
                No, Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 max-w-[150px] py-2.5 text-[14px] cursor-pointer font-semibold text-white bg-[#333CF5] rounded-full hover:bg-[#155DFC] transition-colors shadow-md dark:shadow-none shadow-blue dark:shadow-none-100"
              >
                Yes, Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <IncomingCallOverlay currentRole="Doctor" />
    </div>
  );
};

export default DoctorLayout;
