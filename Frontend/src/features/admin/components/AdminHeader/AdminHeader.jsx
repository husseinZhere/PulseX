import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineBell,
  HiOutlineClock,
  HiOutlineXMark,
  HiOutlineCheckCircle,
  HiOutlineTrash,
  HiOutlineUserPlus,
  HiOutlinePencilSquare,
  HiOutlineShieldCheck,
  HiOutlineDocumentCheck,
  HiOutlineFlag,
} from 'react-icons/hi2';
import { FiCalendar } from 'react-icons/fi';
import { readProfilePhoto, subscribeProfilePhoto } from '../../../../utils/profilePhotoStorage';
import { getAllActivityLogs } from '../../../../services/adminService';

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return '';
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
};

/* ─── Icon per log type ─────────────────────────────────────── */
const NotifIcon = ({ type }) => {
  const base = 'w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-lg';
  if (type === 'create')
    return <div className={`${base} bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300`}><HiOutlineUserPlus /></div>;
  if (type === 'update')
    return <div className={`${base} bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300`}><HiOutlinePencilSquare /></div>;
  if (type === 'delete')
    return <div className={`${base} bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-300`}><HiOutlineTrash /></div>;
  if (type === 'approve')
    return <div className={`${base} bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300`}><HiOutlineDocumentCheck /></div>;
  if (type === 'report')
    return <div className={`${base} bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-300`}><HiOutlineFlag /></div>;
  return <div className={`${base} bg-gray-100 dark:bg-gray-700/40 text-gray-500 dark:text-gray-300`}><HiOutlineShieldCheck /></div>;
};

/* ─── Component ─────────────────────────────────────────────── */
const AdminHeader = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [adminData] = useState({ name: 'Tayem Zayed', role: 'Admin', image: '' });
  const [adminPhoto, setAdminPhoto] = useState(() => readProfilePhoto('admin'));
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef();

  /* clock tick every minute */
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  /* close panel when clicking outside */
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target))
        setIsNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => subscribeProfilePhoto('admin', setAdminPhoto), []);

  /* load real activity logs as admin notifications */
  useEffect(() => {
    getAllActivityLogs()
      .then((logs) => {
        const recent = (Array.isArray(logs) ? logs : [])
          .slice(0, 10)
          .map((log) => {
            const a = (log.action || '').toLowerCase();
            let type = 'other';
            if (a.includes('report')) type = 'report';
            else if (a.includes('creat') || a.includes('add') || a.includes('register')) type = 'create';
            else if (a.includes('delete') || a.includes('remov')) type = 'delete';
            else if (a.includes('approv') || a.includes('reject')) type = 'approve';
            else if (a.includes('update') || a.includes('status') || a.includes('edit')) type = 'update';
            return {
              id: log.id,
              type,
              title: log.action || 'System Activity',
              description: log.details || `${log.userName || ''} performed an action`.trim(),
              timeAgo: formatTimeAgo(log.timestamp),
              isRead: false,
            };
          });
        setNotifications(recent);
      })
      .catch(() => setNotifications([]));
  }, []);

  /* ── actions ── */
  const markRead = (id) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );

  const deleteNotif = (id) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div
      className="flex items-center justify-between w-full h-full relative gap-3 font-roboto"
      ref={notifRef}
    >
      {/* ── Left: Date + Time ── */}
      <div className="flex items-center gap-[10px] shrink-0 min-w-0">
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-[10px] min-w-0">
          <FiCalendar className="text-[15px] text-brand-main shrink-0" />
          <span className="text-[13px] font-bold text-black-main-text dark:text-[#E2E8F0] truncate whitespace-nowrap">
            {currentTime.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
        <div className="hidden min-[480px]:flex items-center gap-2 px-3.5 py-1.5 rounded-[10px]">
          <HiOutlineClock className="text-[15px] text-[#13D486] shrink-0" />
          <span className="text-[13px] font-bold text-black-main-text dark:text-[#E2E8F0] whitespace-nowrap">
            {currentTime.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>

      {/* ── Right: Bell + Profile ── */}
      <div className="flex items-center gap-2 md:gap-3 ml-auto">

        {/* Bell button */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`relative w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[#111827] border-[1.5px] border-gray-200 dark:border-gray-700 cursor-pointer transition-all shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:bg-[#EEF3FF] dark:hover:bg-[#1E293B] group
              ${isNotifOpen
                ? 'shadow-[0_4px_16px_rgba(21,93,252,0.3)]'
                : ''
              }`}
          >
            <HiOutlineBell className={`text-[18px] text-[#6b7280] transition-colors group-hover:text-brand-main ${isNotifOpen ? 'text-brand-main' : ''}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#FB2C36] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-[#111827]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* ── Notification Panel ── */}
          {isNotifOpen && (
            <div className="fixed top-[76px] left-1/2 -translate-x-1/2 sm:absolute sm:top-[calc(100%+10px)] sm:left-auto sm:translate-x-0 sm:right-0 w-[290px] sm:w-[360px] max-w-[calc(100vw-24px)] bg-white dark:bg-[#111827] rounded-[20px] border border-gray-200 dark:border-gray-700 shadow-[0_20px_50px_rgba(0,0,0,0.13)] overflow-hidden z-[300] animate-[fadeDown_0.18s_ease]">

              {/* Header (blue) */}
              <div className="flex items-center justify-between px-[18px] py-4 bg-brand-main">
                <div>
                  <h3 className="text-[15px] font-bold text-white font-roboto leading-6">
                    Notifications
                  </h3>
                  <span className="text-[11px] text-blue-100 mt-0.5 font-roboto block">
                    {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="cursor-pointer bg-transparent border-none text-white/90 text-[11px] font-semibold underline hover:text-blue-100 transition-colors"
                    >
                      <HiOutlineCheckCircle className="inline mr-1" /> Mark all
                    </button>
                  )}
                  <button
                    onClick={() => setIsNotifOpen(false)}
                    className="cursor-pointer w-7 h-7 flex items-center justify-center rounded-[10px] text-white bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-[#0B1220]/70 transition-colors"
                    aria-label="Close notifications"
                  >
                    <HiOutlineXMark className="text-lg" />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="max-h-[340px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => { markRead(n.id); if (n.type === 'report') navigate('/admin/reports'); }}
                      className={`px-4 pt-4 pb-3 flex gap-3 transition-colors hover:bg-gray-50 dark:hover:bg-[#1E293B] cursor-pointer
                        ${n.isRead ? 'bg-white dark:bg-[#111827]' : 'bg-blue-50/50 dark:bg-blue-900/20'}`}
                    >
                      <NotifIcon type={n.type} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-bold text-black-main-text dark:text-[#E2E8F0] font-roboto leading-5">
                            {n.title}
                          </h4>
                          {!n.isRead && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 font-roboto leading-5 mt-0.5 line-clamp-2">
                          {n.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400 font-roboto leading-4">
                            {n.timeAgo}
                          </span>
                          <div className="flex items-center justify-end gap-3">
                            {!n.isRead && (
                              <button
                                onClick={() => markRead(n.id)}
                                className="cursor-pointer text-xs text-blue-600 font-roboto font-medium hover:underline"
                              >
                                Mark read
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotif(n.id)}
                              className="cursor-pointer text-xs text-red-600 font-roboto font-medium hover:underline flex items-center gap-0.5"
                            >
                              <HiOutlineTrash className="text-sm" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <HiOutlineBell className="text-4xl text-gray-200 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 dark:text-gray-500 font-roboto">No notifications</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile — clicks → /admin/settings */}
        <div
          onClick={() => navigate('/admin/settings')}
          className="flex items-center gap-[10px] pl-3.5 cursor-pointer group"
        >
          {adminPhoto ? (
            <img
              src={adminPhoto}
              className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
              alt="Admin"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-brand-main flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {adminData.name.charAt(0)}
            </div>
          )}
          <div className="hidden md:flex flex-col">
            <p className="text-[13px] font-bold text-black-main-text dark:text-[#E2E8F0] font-roboto whitespace-nowrap">{adminData.name}</p>
            <p className="text-[10px] font-semibold text-gray-400 font-roboto uppercase tracking-wider">{adminData.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;