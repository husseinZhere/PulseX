import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineBell, HiOutlineCheck, HiOutlineEnvelope, HiXMark } from 'react-icons/hi2';
import { MdOutlineReply } from 'react-icons/md';
import { LuCalendarDays, LuClock } from 'react-icons/lu';
import doctorProfile from '../../../../assets/Images/doctor-profile.png';
import { useAuth } from '../../../../context/AuthContext';
import { getDoctorSelfProfile } from '../../../../services/doctorService';
import {
  deleteDoctorNotification,
  getDoctorNotifications,
  markAllDoctorNotificationsRead,
  markDoctorNotificationRead,
} from '../../../../services/notificationService';
import { getUnreadInbox } from '../../../../services/messageService';
import { ensureChatConnection, onChatEvent } from '../../../../services/chatRealtimeService';
import { readProfilePhoto, subscribeProfilePhoto } from '../../../../utils/profilePhotoStorage';
import { resolveFileUrl } from '../../../../utils/api';
import { playMessageSound, playNotificationSound } from '../../../../utils/notificationSound';

const formatDate = (d) =>
  d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const formatTime = (d) =>
  d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

// Backend serializes DateTime.UtcNow without a 'Z' suffix, so the browser
// would otherwise interpret it as local time (Egypt UTC+2) and produce a
// 2-3 hour drift on every relative-time calculation. Force-tag as UTC if
// the string carries no timezone indicator.
const parseUtcDate = (value) => {
  if (!value) return null;
  const s = String(value);
  const normalized = s.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(s) ? s : `${s}Z`;
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d;
};

const formatRelativeTime = (value) => {
  const date = parseUtcDate(value);
  if (!date) return '';

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day ago`;
};

const resolveAvatar = (path, fallback = '') => {
  if (!path) return fallback;
  if (String(path).startsWith('data:')) return path;
  return resolveFileUrl(path);
};

const pickArray = (value, key) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.[key])) return value[key];
  const pascalKey = `${key.charAt(0).toUpperCase()}${key.slice(1)}`;
  if (Array.isArray(value?.[pascalKey])) return value[pascalKey];
  return [];
};

const mapInboxItem = (item) => ({
  id: item.appointmentId,
  appointmentId: item.appointmentId,
  patientId: item.otherUserId,
  name: item.otherUserName || 'Patient',
  role: item.otherUserRole || 'Patient',
  avatar: resolveAvatar(item.otherUserAvatar),
  text: item.lastMessage || '',
  time: formatRelativeTime(item.lastMessageAt),
  unread: Number(item.unreadCount) || 0,
});

const mapNotification = (notification) => {
  const priority = notification.priority ?? notification.Priority ?? 'Normal';

  return {
    id: notification.id ?? notification.Id,
    type: notification.type ?? notification.Type ?? '',
    unread: !(notification.isRead ?? notification.IsRead),
    title: notification.title ?? notification.Title ?? 'Notification',
    desc: (notification.message ?? notification.Message ?? '').replace(/\?{2,}/g, '').trim(),
    time: formatRelativeTime(notification.createdAt ?? notification.CreatedAt),
    level: priority,
    patientId: notification.relatedPatientId ?? notification.RelatedPatientId,
    appointmentId: notification.relatedAppointmentId ?? notification.RelatedAppointmentId,
  };
};

const extractRating = (desc) => {
  const m = desc.match(/rated you (\d)\/5/);
  return m ? parseInt(m[1], 10) : 0;
};

const StarRow = ({ count }) => (
  <span className="flex items-center gap-0.5 mt-1">
    {[1, 2, 3, 4, 5].map((i) => (
      <svg key={i} className={`w-3 h-3 ${i <= count ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </span>
);

const DoctorHeader = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [now, setNow] = useState(new Date());
  const [notifOpen, setNotifOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [headerPhoto, setHeaderPhoto] = useState(() => readProfilePhoto('doctor') || '');
  const [doctorName, setDoctorName] = useState(() => user?.fullName || 'Doctor');
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [messages, setMessages] = useState([]);

  const notifRef = useRef(null);
  const msgRef = useRef(null);
  const loadHeaderDataRef = useRef(null);
  const prevUnreadNotifRef = useRef(null);
  const prevUnreadMsgRef = useRef(null);

  const loadHeaderData = useCallback(async () => {
    const [profile, notificationResponse, inboxResponse] = await Promise.all([
      getDoctorSelfProfile().catch(() => null),
      getDoctorNotifications().catch(() => null),
      getUnreadInbox().catch(() => null),
    ]);

    const nextName = profile?.fullName || user?.fullName;
    if (nextName) setDoctorName(nextName);

    const nextPhoto = profile?.profilePicture;
    if (nextPhoto) setHeaderPhoto(resolveAvatar(nextPhoto));

    const messageItems = Array.isArray(inboxResponse?.conversations)
      ? inboxResponse.conversations
      : [];
    const totalUnreadMsg = messageItems.reduce(
      (sum, m) => sum + (Number(m.unreadCount ?? m.UnreadCount) || 0),
      0
    );
    if (prevUnreadMsgRef.current !== null && totalUnreadMsg > prevUnreadMsgRef.current) {
      playMessageSound();
    }
    prevUnreadMsgRef.current = totalUnreadMsg;
    setMessages(messageItems.map(mapInboxItem));

    const notificationItems = pickArray(notificationResponse, 'notifications').map(mapNotification);
    setNotifications(notificationItems);
    const nextUnread = notificationResponse?.unreadCount ??
      notificationItems.filter((n) => n.unread).length;
    if (prevUnreadNotifRef.current !== null && nextUnread > prevUnreadNotifRef.current) {
      playNotificationSound();
    }
    prevUnreadNotifRef.current = nextUnread;
    setUnreadNotifCount(nextUnread);
  }, [user?.fullName]);

  // Keep ref in sync so SignalR handler always calls the latest version.
  loadHeaderDataRef.current = loadHeaderData;

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    loadHeaderData();
    const interval = window.setInterval(loadHeaderData, 15000);
    return () => window.clearInterval(interval);
  }, [loadHeaderData]);

  // SignalR: refresh inbox instantly when a new message arrives.
  useEffect(() => {
    let cleanupFn = () => {};

    ensureChatConnection()
      .then(() => {
        cleanupFn = onChatEvent('ReceiveMessage', (msg) => {
          const senderId = Number(msg?.senderId ?? msg?.SenderId);
          const currentUserId = Number(user?.userId);
          if (senderId && currentUserId && senderId !== currentUserId) {
            playMessageSound();
            loadHeaderDataRef.current?.();
          }
        });
      })
      .catch(() => {});

    return () => cleanupFn();
  }, [user?.userId]);

  useEffect(() => {
    const onClickAway = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (msgRef.current && !msgRef.current.contains(e.target)) setMsgOpen(false);
    };
    document.addEventListener('mousedown', onClickAway);
    return () => document.removeEventListener('mousedown', onClickAway);
  }, []);

  useEffect(() => subscribeProfilePhoto('doctor', (photo) => setHeaderPhoto(resolveAvatar(photo))), []);

  const unreadMsg = messages.reduce((total, m) => total + Number(m.unread || 0), 0);

  const openChat = (msg) => {
    setMsgOpen(false);
    navigate('/doctor/messages', {
      state: {
        patientId: msg.patientId,
        appointmentId: msg.appointmentId,
      },
    });
  };

  const markAllMessagesRead = () => setMessages([]);

  const handleMarkNotificationRead = async (notificationId) => {
    await markDoctorNotificationRead(notificationId).catch(() => null);
    setNotifications((prev) =>
      prev.map((item) => item.id === notificationId ? { ...item, unread: false } : item)
    );
    setUnreadNotifCount((count) => Math.max(0, count - 1));
  };

  const handleMarkAllNotificationsRead = async () => {
    await markAllDoctorNotificationsRead().catch(() => null);
    setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));
    setUnreadNotifCount(0);
  };

  const handleDeleteNotification = async (notificationId) => {
    await deleteDoctorNotification(notificationId).catch(() => null);
    setNotifications((prev) => {
      const target = prev.find((item) => item.id === notificationId);
      if (target?.unread) setUnreadNotifCount((count) => Math.max(0, count - 1));
      return prev.filter((item) => item.id !== notificationId);
    });
  };

  return (
    <header className="flex items-center justify-between w-full h-full gap-3">
      <div className="flex items-center gap-[10px] shrink-0">
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-[10px]">
          <LuCalendarDays className="text-[16px] text-[#155DFC] shrink-0" />
          <span className="text-[14px] font-bold text-[#101828] dark:text-[#E2E8F0] whitespace-nowrap font-roboto tracking-wide">
            {formatDate(now)}
          </span>
        </div>
        <div className="hidden min-[480px]:flex items-center gap-2 px-3.5 py-1.5 rounded-[10px] bg-white dark:bg-[#111827]">
          <LuClock className="text-[16px] text-[#05A24E] shrink-0" />
          <span className="text-[14px] font-bold text-[#101828] dark:text-[#E2E8F0] whitespace-nowrap font-roboto tracking-wide">
            {formatTime(now)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">

        {/* ── Messages Button ── */}
        <div className="relative" ref={msgRef}>
          <button
            className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[#111827] border-[1.5px] border-gray-200 dark:border-gray-700 cursor-pointer transition-all shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:bg-[#EEF3FF] dark:hover:bg-[#1E293B] hover:border-[#155DFC]"
            onClick={() => {
              setMsgOpen((p) => !p);
              setNotifOpen(false);
            }}
            aria-label="Toggle doctor messages"
          >
            <HiOutlineEnvelope className="text-[18px] text-[#6b7280]" />
            {unreadMsg > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#00C950] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white font-roboto">
                {unreadMsg > 9 ? '9+' : unreadMsg}
              </span>
            )}
          </button>

          {msgOpen && (
            <div className="fixed top-[76px] left-1/2 -translate-x-1/2 sm:absolute sm:top-[calc(100%+10px)] sm:left-auto sm:translate-x-0 sm:right-0 w-[320px] sm:w-[430px] max-w-[calc(100vw-24px)] bg-white dark:bg-[#111827] rounded-[14px] border border-[#D1D5DB] dark:border-gray-700 shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden z-[300] animate-[fadeDown_0.18s_ease]">
              {/* Header */}
              <div className="flex items-center justify-between px-[18px] py-3 bg-[#05A24E]">
                <div>
                  <div className="text-[20px] font-bold text-white font-roboto">Messages</div>
                  <div className="text-[12px] text-white/80 mt-0.5 font-roboto">{unreadMsg} unread messages</div>
                </div>
                <div className="flex items-center gap-2">
                  {messages.length > 0 && (
                    <button
                      className="flex items-center gap-1 text-[11px] font-semibold text-white/90 hover:text-white cursor-pointer font-roboto"
                      onClick={markAllMessagesRead}
                      aria-label="Mark all messages as read"
                    >
                      <HiOutlineCheck className="text-[13px]" /> Mark all read
                    </button>
                  )}
                  <button
                    className="rounded-lg w-7 h-7 flex items-center justify-center text-white cursor-pointer bg-white/20 hover:bg-white/30 transition-colors"
                    onClick={() => setMsgOpen(false)}
                    aria-label="Close messages"
                  >
                    <HiXMark />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="max-h-[420px] overflow-y-auto bg-white dark:bg-[#111827]">
                {messages.length ? messages.map((msg) => (
                  <article
                    key={`${msg.appointmentId}-${msg.id}`}
                    className="border-b border-[#E5E7EB] dark:border-gray-700 px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#1E293B]/55 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar with online dot */}
                      <div className="relative shrink-0">
                        <img
                          src={msg.avatar}
                          alt={msg.name}
                          className="w-[42px] h-[42px] rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                        />
                        <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-[#22c55e] border-2 border-white dark:border-[#111827] rounded-full" />
                      </div>

                      <div className="min-w-0 flex-1">
                        {/* Name + time + badge */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[13px] font-bold text-[#101828] dark:text-[#E2E8F0] truncate font-roboto">
                            {msg.name}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] text-[#9ca3af] font-roboto">{msg.time}</span>
                            {msg.unread > 0 && (
                              <span className="min-w-[18px] h-[18px] px-1 bg-[#16A34A] text-white text-[9px] font-bold rounded-full flex items-center justify-center font-roboto">
                                {msg.unread}
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-[11px] text-[#9ca3af] dark:text-gray-400 font-roboto">{msg.role}</p>
                        <p className="text-[12px] text-[#374151] dark:text-gray-300 leading-[1.4] font-roboto line-clamp-2 mt-0.5">
                          {msg.text}
                        </p>

                        {/* Action buttons */}
                        <div className="mt-1.5 flex items-center gap-3 text-[11px] font-semibold">
                          <button
                            onClick={() => openChat(msg)}
                            className="flex items-center gap-1 text-[#16A34A] hover:underline cursor-pointer font-roboto"
                            aria-label={`Reply to ${msg.name}`}
                          >
                            <MdOutlineReply className="text-[13px]" /> Reply
                          </button>
                          <button
                            onClick={() => openChat(msg)}
                            className="text-[#2563EB] hover:underline cursor-pointer font-roboto"
                            aria-label={`Open chat with ${msg.name}`}
                          >
                            Open Chat
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                )) : (
                  <div className="px-5 py-8 text-center">
                    <p className="text-[14px] font-semibold text-[#101828] dark:text-[#E2E8F0] font-roboto">No unread messages</p>
                    <button
                      onClick={() => { setMsgOpen(false); navigate('/doctor/messages'); }}
                      className="mt-3 text-[12px] font-semibold text-[#16A34A] cursor-pointer font-roboto hover:underline"
                    >
                      Open Messages
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Notifications Button ── */}
        <div className="relative" ref={notifRef}>
          <button
            className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[#111827] border-[1.5px] border-gray-200 dark:border-gray-700 cursor-pointer transition-all shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:bg-[#EEF3FF] dark:hover:bg-[#1E293B] hover:border-[#155DFC]"
            onClick={() => {
              setNotifOpen((p) => !p);
              setMsgOpen(false);
            }}
            aria-label="Toggle notifications"
          >
            <HiOutlineBell className="text-[18px] text-[#6b7280]" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#ef4444] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white font-roboto">
                {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="fixed top-[76px] left-1/2 -translate-x-1/2 sm:absolute sm:top-[calc(100%+10px)] sm:left-auto sm:translate-x-0 sm:right-0 w-[320px] sm:w-[430px] max-w-[calc(100vw-24px)] bg-white dark:bg-[#111827] rounded-[14px] border border-[#D1D5DB] dark:border-gray-700 shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden z-[300] animate-[fadeDown_0.18s_ease]">
              <div className="flex items-center justify-between px-[16px] py-3 bg-[#3340EE]">
                <div>
                  <div className="text-[20px] font-bold text-white font-roboto">Notifications</div>
                  <div className="text-[12px] text-white/80">{unreadNotifCount} unread notifications</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="text-[11px] font-semibold text-white/90 hover:text-white cursor-pointer font-roboto"
                    onClick={handleMarkAllNotificationsRead}
                  >
                    Mark all as read
                  </button>
                  <button
                    className="rounded-lg w-7 h-7 flex items-center justify-center text-white cursor-pointer bg-white/20 hover:bg-white/30 transition-colors"
                    onClick={() => setNotifOpen(false)}
                    aria-label="Close notifications"
                  >
                    <HiXMark />
                  </button>
                </div>
              </div>

              <div className="max-h-[420px] overflow-y-auto bg-white dark:bg-[#111827]">
                {notifications.length ? notifications.map((n) => (
                  <article key={n.id} className="px-3 py-2.5 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[13px] font-semibold text-[#101828] dark:text-[#E2E8F0] font-roboto">{n.title}</p>
                      {n.unread ? <span className="h-2.5 w-2.5 rounded-full bg-[#2563EB]" /> : null}
                    </div>
                    <p className="text-[11px] text-[#374151] dark:text-gray-300 mt-1 leading-4 font-roboto">{n.desc}</p>
                    {n.type === 'NewRating' && <StarRow count={extractRating(n.desc)} />}
                    <div className="mt-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {['Urgent', 'High'].includes(n.level) ? (
                          <span className="rounded-full bg-[#FEE2E2] dark:bg-[#1E293B] px-1.5 py-0.5 text-[9px] font-semibold text-[#B91C1C] font-roboto">
                            {n.level}
                          </span>
                        ) : null}
                        <span className="text-[10px] text-[#9ca3af] font-roboto">{n.time}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-[10px] font-semibold">
                        {n.unread ? (
                          <button
                            className="text-[#2563EB] cursor-pointer font-roboto hover:underline"
                            onClick={() => handleMarkNotificationRead(n.id)}
                          >
                            Mark read
                          </button>
                        ) : null}
                        <button
                          className="text-[#DC2626] cursor-pointer font-roboto hover:underline"
                          onClick={() => handleDeleteNotification(n.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                )) : (
                  <div className="px-5 py-8 text-center">
                    <p className="text-[14px] font-semibold text-[#101828] dark:text-[#E2E8F0] font-roboto">No notifications yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Doctor Profile ── */}
        <div
          className="flex items-center gap-[10px] pl-2 cursor-pointer group"
          onClick={() => navigate('/doctor/settings')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') navigate('/doctor/settings');
          }}
          aria-label="Open doctor profile settings"
        >
          {headerPhoto ? (
            <img
              src={headerPhoto}
              alt="Doctor avatar"
              className="w-10 h-10 rounded-full object-cover border-2 border-[#e0eaff] shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#333CF5] to-[#9810fa] flex items-center justify-center text-white text-[14px] font-bold border-2 border-[#e0eaff] shrink-0">
              {(doctorName || 'D')[0].toUpperCase()}
            </div>
          )}
          <div className="hidden md:flex flex-col">
            <span className="text-[13px] font-bold text-[#101828] dark:text-[#E2E8F0] whitespace-nowrap font-roboto">
              {doctorName}
            </span>
            <span className="text-[10px] text-[#6b7280] uppercase tracking-wider font-roboto">
              Doctor
            </span>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  );
};

export default DoctorHeader;
