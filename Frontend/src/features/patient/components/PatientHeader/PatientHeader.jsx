import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineBell, HiOutlineCheck, HiOutlineEnvelope, HiXMark } from 'react-icons/hi2';
import { LuCalendarDays, LuClock } from 'react-icons/lu';
import { MdOutlineReply, MdOutlineSend } from 'react-icons/md';
import { readProfilePhoto, subscribeProfilePhoto, writeProfilePhoto } from '../../../../utils/profilePhotoStorage';
import { useAuth } from '../../../../context/AuthContext';
import { resolveFileUrl } from '../../../../utils/api';
import { getUserProfile } from '../../../../services/patientService';
import { getUnreadInbox, sendMessage } from '../../../../services/messageService';
import {
  deletePatientNotification,
  getPatientNotifications,
  markAllPatientNotificationsRead,
  markPatientNotificationRead,
} from '../../../../services/notificationService';
import { ensureChatConnection, onChatEvent } from '../../../../services/chatRealtimeService';

const PHOTO_UID_KEY = 'pulsex-profile-photo-patient-uid';

/* ── Mock Data ─────────────────────────────────────── */
const MOCK_NOTIFICATIONS = [];
const MOCK_MESSAGES = [];

/* ── Helpers ───────────────────────────────────────── */
function formatDate(d) {
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
function formatTime(d) {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

const timeAgo = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

const notificationIcon = (type, iconType) => {
  const normalized = String(iconType || type || '').toLowerCase();
  if (normalized.includes('prescription')) return 'RX';
  if (normalized.includes('calendar') || normalized.includes('appointment')) return '📅';
  if (normalized.includes('alert') || normalized.includes('warning')) return '!';
  if (normalized.includes('success')) return '✓';
  if (normalized.includes('story')) return '♥';
  return 'i';
};

const notificationBg = (priority, statusColor) => {
  const value = String(statusColor || priority || '').toLowerCase();
  if (value.includes('red') || value.includes('urgent') || value.includes('high')) return '#FEE2E2';
  if (value.includes('orange') || value.includes('warning') || value.includes('normal')) return '#FEF3C7';
  if (value.includes('green') || value.includes('low')) return '#DCFCE7';
  return '#DBEAFE';
};

const mapNotification = (notification) => ({
  id: notification.id,
  type: notification.type,
  title: notification.title || 'Notification',
  desc: notification.message || '',
  tag: notification.riskLevel || notification.priority,
  tagColor: notification.statusColor === 'red'
    ? '#DC2626'
    : notification.statusColor === 'orange'
      ? '#D97706'
      : notification.statusColor === 'green'
        ? '#16A34A'
        : '#155DFC',
  time: timeAgo(notification.createdAt),
  unread: !notification.isRead,
  icon: notificationIcon(notification.type, notification.iconType),
  bg: notificationBg(notification.priority, notification.statusColor),
  actionUrl: notification.actionUrl,
});

const mapInboxItem = (item) => ({
  id: item.appointmentId,
  appointmentId: item.appointmentId,
  receiverId: item.otherUserId,
  name: item.otherUserName || 'Doctor',
  role: item.otherUserRole || 'Doctor',
  avatar: resolveFileUrl(item.otherUserAvatar || '') || DEFAULT_PATIENT_AVATAR,
  text: item.lastMessage || 'Attachment',
  time: timeAgo(item.lastMessageAt),
  unread: Number(item.unreadCount) || 0,
});

/* ══════════════════════════════════════════════════════
   Reply Modal
══════════════════════════════════════════════════════ */
const ReplyModal = ({ target, onClose, onSend }) => {
  const [text, setText] = useState('');
  if (!target) return null;
  return (
    <div className="fixed inset-0 bg-black-main-text/45 flex items-center justify-center z-[1000] p-4 animate-[fadeIn_0.15s_ease]" onClick={onClose}>
      <div className="bg-white dark:bg-[#111827] rounded-[20px] w-full max-w-[440px] shadow-[0_25px_60px_rgba(0,0,0,0.18)] overflow-hidden animate-[slideUp_0.2s_ease]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-br from-[#155DFC] to-[#4A7FFF]">
          <span className="text-[14px] font-bold text-white font-roboto">Reply to {target.name || target.title}</span>
          <button
            className="bg-white/20 rounded-lg w-7 h-7 flex items-center justify-center text-white cursor-pointer hover:bg-white dark:bg-[#111827]/35 transition-colors"
            onClick={onClose}
            aria-label="Close reply modal"
          >
            <HiXMark />
          </button>
        </div>

        {target.avatar && (
          <div className="flex items-center gap-[10px] px-5 pt-4">
            <img src={target.avatar} alt="" className="w-[38px] h-[38px] rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 shrink-0" />
            <div>
              <div className="text-[13px] font-bold text-black-main-text dark:text-[#E2E8F0] font-roboto">{target.name}</div>
              <div className="text-[11px] text-[#9ca3af] font-roboto">{target.role}</div>
            </div>
          </div>
        )}

        <div className="mx-5 mt-3 p-3 bg-[#f8fafc] border-l-[3px] border-[#155DFC] rounded-r-lg">
          <span className="block text-[10px] font-bold text-[#9ca3af] uppercase mb-1 font-roboto">Original:</span>
          <span className="text-[12px] text-[#4b5563] leading-relaxed font-roboto">{target.text || target.desc}</span>
        </div>

        <textarea
          className="block w-full mt-3 px-5 py-3 border-none border-t border-gray-100 dark:border-gray-800 resize-none text-[13px] font-roboto text-black-main-text dark:text-[#E2E8F0] outline-none placeholder:text-[#9ca3af]"
          placeholder="Write your reply..."
          value={text}
          onChange={e => setText(e.target.value)}
          rows={3}
          autoFocus
        />

        <div className="flex items-center justify-end gap-[10px] px-5 py-4 border-t border-gray-100 dark:border-gray-800">
          <button
            className="bg-none border-[1.5px] border-gray-200 dark:border-gray-700 rounded-[20px] px-[18px] py-[7px] text-[12px] font-semibold text-[#6b7280] cursor-pointer hover:border-gray-400 font-roboto transition-colors"
            onClick={onClose}
            aria-label="Cancel reply"
          >
            Cancel
          </button>
          <button
            className="flex items-center gap-1.5 bg-[#333CF5] border-none rounded-[20px] px-5 py-[7px] text-[12px] font-bold text-white cursor-pointer shadow-[0_4px_12px_rgba(51,60,245,0.25)] hover:bg-[#2430e0] hover:-translate-y-px transition-all disabled:opacity-45 disabled:cursor-not-allowed font-roboto"
            onClick={() => { if (text.trim()) { onSend(text); onClose(); } }}
            disabled={!text.trim()}
            aria-label="Send reply"
          >
            <MdOutlineSend /> Send
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   PatientHeader Component
══════════════════════════════════════════════════════ */
const PatientHeader = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [now, setNow] = useState(new Date());
  const [notifOpen, setNotifOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [headerPhoto, setHeaderPhoto] = useState(() => {
    const stored = readProfilePhoto('patient');
    if (!stored) return '';
    const storedUid = localStorage.getItem(PHOTO_UID_KEY);
    if (storedUid && String(storedUid) === String(user?.userId)) return stored;
    return '';
  });
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [replyTarget, setReplyTarget] = useState(null);

  const displayName = user?.fullName || user?.firstName || 'Patient';
  const displayRole = String(user?.role || 'Patient').toUpperCase();

  const notifRef = useRef(null);
  const msgRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (msgRef.current && !msgRef.current.contains(e.target)) setMsgOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => subscribeProfilePhoto('patient', setHeaderPhoto), []);

  // If no photo in storage (fresh login), fetch profile once to populate it
  useEffect(() => {
    if (!user?.userId || headerPhoto) return;
    let cancelled = false;
    getUserProfile()
      .then((profile) => {
        if (cancelled || !profile?.profilePicture) return;
        const url = resolveFileUrl(profile.profilePicture);
        if (!url) return;
        writeProfilePhoto('patient', url);
        localStorage.setItem(PHOTO_UID_KEY, String(user.userId));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user?.userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep ref in sync so SignalR handler always calls the latest loadHeaderData.
  const loadHeaderDataFn = useRef(null);

  useEffect(() => {
    let ignore = false;

    const loadHeaderData = async () => {
      try {
        const [notificationResponse, inboxResponse] = await Promise.all([
          getPatientNotifications().catch(() => ({ notifications: [] })),
          getUnreadInbox().catch(() => ({ conversations: [] })),
        ]);

        if (ignore) return;

        const notificationItems = Array.isArray(notificationResponse?.notifications)
          ? notificationResponse.notifications
          : Array.isArray(notificationResponse)
            ? notificationResponse
            : [];
        const messageItems = Array.isArray(inboxResponse?.conversations)
          ? inboxResponse.conversations
          : [];

        setNotifications(notificationItems.map(mapNotification));
        setMessages(messageItems.map(mapInboxItem));
      } catch (err) {
        console.error('Loading patient header data failed', err);
      }
    };

    loadHeaderDataFn.current = loadHeaderData;
    loadHeaderData();
    const interval = setInterval(loadHeaderData, 30000);

    // SignalR: refresh inbox instantly when a new message arrives.
    let cleanupSignalR = () => {};
    ensureChatConnection()
      .then(() => {
        cleanupSignalR = onChatEvent('ReceiveMessage', (msg) => {
          const senderId = Number(msg?.senderId ?? msg?.SenderId);
          const currentUserId = Number(user?.userId);
          if (senderId && currentUserId && senderId !== currentUserId) {
            loadHeaderDataFn.current?.();
          }
        });
      })
      .catch(() => {});

    return () => {
      ignore = true;
      clearInterval(interval);
      cleanupSignalR();
    };
  }, [user?.userId]);

  const unreadNotif = notifications.filter(n => n.unread).length;
  const unreadMsg = messages.reduce((sum, m) => sum + (Number(m.unread) || 0), 0);

  const markOneRead = async (id) => {
    setNotifications(p => p.map(n => n.id === id ? { ...n, unread: false } : n));
    try {
      await markPatientNotificationRead(id);
    } catch (err) {
      console.error('Mark notification read failed', err);
    }
  };

  const deleteNotif = async (id) => {
    setNotifications(p => p.filter(n => n.id !== id));
    try {
      await deletePatientNotification(id);
    } catch (err) {
      console.error('Delete notification failed', err);
    }
  };

  const markAllRead = async () => {
    setNotifications(p => p.map(n => ({ ...n, unread: false })));
    try {
      await markAllPatientNotificationsRead();
    } catch (err) {
      console.error('Mark all notifications read failed', err);
    }
  };

  const handleSendReply = async (text) => {
    if (!replyTarget?.appointmentId) return;
    try {
      await sendMessage({
        appointmentId: replyTarget.appointmentId,
        receiverId: replyTarget.receiverId,
        content: text,
      });
    } catch (err) {
      console.error('Reply send failed', err);
    }
  };

  return (
    <>
      <header className="flex items-center justify-between w-full h-full relative gap-3">

        {/* ── Left: Date & Time ── */}
        <div className="flex items-center gap-[10px] shrink-0">
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-[10px]  ">
            <LuCalendarDays className="text-[15px] text-[#155dfc] shrink-0" />
            <span className="text-[13px] font-bold text-black-main-text dark:text-[#E2E8F0] whitespace-nowrap font-roboto">{formatDate(now)}</span>
          </div>
          <div className="hidden min-[480px]:flex items-center gap-2 px-3.5 py-1.5 rounded-[10px] bg-white dark:bg-[#111827] ">
            <LuClock className="text-[15px] text-[#00a63e] shrink-0" />
            <span className="text-[13px] font-bold text-black-main-text dark:text-[#E2E8F0] whitespace-nowrap font-roboto">{formatTime(now)}</span>
          </div>
        </div>

        {/* ── Right: Icons + Avatar ── */}
        <div className="flex items-center gap-2 md:gap-3">

          {/* ── Messages Button ── */}
          <div className="relative" ref={msgRef}>
            <button
              className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[#111827] border-[1.5px] border-gray-200 dark:border-gray-700 cursor-pointer transition-all shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:bg-[#EEF3FF] dark:hover:bg-[#1E293B] hover:border-[#155DFC]"
              onClick={() => { setMsgOpen(p => !p); setNotifOpen(false); }}
              aria-label="Toggle messages"
            >
              <HiOutlineEnvelope className="text-[18px] text-[#6b7280]" />
              {unreadMsg > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#00C950] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white font-roboto">
                  {unreadMsg}
                </span>
              )}
            </button>

            {msgOpen && (
              <div className="fixed top-[76px] left-1/2 -translate-x-1/2 sm:absolute sm:top-[calc(100%+10px)] sm:left-auto sm:translate-x-0 sm:right-0 w-[320px] sm:w-[430px] max-w-[calc(100vw-24px)] bg-white dark:bg-[#111827] rounded-[14px] border border-gray-200 dark:border-gray-700 shadow-[0_20px_50px_rgba(0,0,0,0.13)] overflow-hidden z-[300] animate-[fadeDown_0.18s_ease]">
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
                        onClick={() => setMessages([])}
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
                <div className="max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                  {messages.length > 0 ? messages.map(msg => (
                    <div key={msg.id} className="flex items-start gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800 transition-colors hover:bg-gray-50 dark:hover:bg-[#1E293B]/55">
                      {/* Avatar with online dot */}
                      <div className="relative shrink-0">
                        <img src={msg.avatar} alt={msg.name} className="w-[42px] h-[42px] rounded-full object-cover border-2 border-gray-200 dark:border-gray-700" />
                        <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-[#22c55e] border-2 border-white dark:border-[#111827] rounded-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {/* Name + time + badge */}
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[13px] font-bold text-black-main-text dark:text-[#E2E8F0] font-roboto truncate">{msg.name}</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] text-[#9ca3af] font-roboto">{msg.time}</span>
                            {msg.unread > 0 && (
                              <span className="min-w-[18px] h-[18px] px-1 bg-[#22c55e] text-white text-[9px] font-bold rounded-full flex items-center justify-center font-roboto">
                                {msg.unread}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="block text-[11px] text-[#9ca3af] dark:text-gray-400 mb-1 font-roboto">{msg.role}</span>
                        <p className="text-[12px] text-[#6b7280] dark:text-gray-300 leading-[1.4] font-roboto line-clamp-2">{msg.text}</p>
                        {/* Action buttons */}
                        <div className="flex gap-3 mt-1.5 text-[11px] font-semibold">
                          <button
                            className="flex items-center gap-1 text-[#16A34A] cursor-pointer hover:underline font-roboto"
                            onClick={() => { setMsgOpen(false); navigate('/patient/messages', { state: { appointmentId: msg.appointmentId, receiverId: msg.receiverId } }); }}
                            aria-label={`Reply to ${msg.name}`}
                          >
                            <MdOutlineReply className="text-[13px]" /> Reply
                          </button>
                          <button
                            className="text-[#2563EB] cursor-pointer hover:underline font-roboto"
                            onClick={() => { setMsgOpen(false); navigate('/patient/messages', { state: { appointmentId: msg.appointmentId, receiverId: msg.receiverId } }); }}
                            aria-label={`Open chat with ${msg.name}`}
                          >
                            Open Chat
                          </button>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="px-4 py-6 text-center">
                      <p className="text-[13px] font-semibold text-black-main-text dark:text-gray-300 font-roboto">
                        No unread messages
                      </p>
                      <button
                        onClick={() => { setMsgOpen(false); navigate('/patient/messages'); }}
                        className="mt-2 text-[12px] font-semibold text-[#16A34A] hover:underline cursor-pointer font-roboto"
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
              onClick={() => { setNotifOpen(p => !p); setMsgOpen(false); }}
              aria-label="Toggle notifications"
            >
              <HiOutlineBell className="text-[18px] text-[#6b7280]" />
              {unreadNotif > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#FB2C36] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white font-roboto">
                  {unreadNotif}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="fixed top-[76px] left-1/2 -translate-x-1/2 sm:absolute sm:top-[calc(100%+10px)] sm:left-auto sm:translate-x-0 sm:right-0 w-[290px] sm:w-[360px] max-w-[calc(100vw-24px)] bg-white dark:bg-[#111827] rounded-[20px] border border-gray-200 dark:border-gray-700 shadow-[0_20px_50px_rgba(0,0,0,0.13)] overflow-hidden z-[300] animate-[fadeDown_0.18s_ease]">
                <div className="flex items-center justify-between px-[18px] py-4 bg-gradient-to-br from-[#155dfc] to-[#4a7fff]">
                  <div>
                    <div className="text-[15px] font-bold text-white font-roboto">Notifications</div>
                    <div className="text-[11px] text-white/75 mt-0.5 font-roboto">{unreadNotif} unread notifications</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="bg-transparent border-none text-white/90 text-[11px] font-semibold cursor-pointer underline font-roboto"
                      onClick={markAllRead}
                      aria-label="Mark all notifications as read"
                    >
                      <HiOutlineCheck className="inline mr-1" /> Mark all
                    </button>
                    <button
                      className="rounded-lg w-7 h-7 flex items-center justify-center text-white cursor-pointer bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-[#0B1220]/70 transition-colors"
                      onClick={() => setNotifOpen(false)}
                      aria-label="Close notifications"
                    >
                      <HiXMark />
                    </button>
                  </div>
                </div>

                <div className="max-h-[340px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-50 dark:scrollbar-track-[#0B1220]">
                  {notifications.length > 0 ? notifications.map(n => (
                    <div key={n.id} className={`flex items-start gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-none transition-colors hover:bg-gray-50 dark:hover:bg-[#1E293B]/55 ${n.unread ? 'bg-[#FAFCFF] dark:bg-[#1A2236]' : 'bg-white dark:bg-[#111827]'}`}>
                      <div className="w-[38px] h-[38px] rounded-full flex items-center justify-center shrink-0 shadow-sm" style={{ background: n.bg }}>
                        <span className="text-[15px]">{n.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-bold text-black-main-text dark:text-[#E2E8F0] mb-0.5 font-roboto">{n.title}</div>
                        <div className="text-[12px] text-[#6b7280] dark:text-gray-300 leading-[1.4] font-roboto">{n.desc}</div>
                        {n.tag && (
                          <span className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border-[1.5px] bg-[#fef2f2] font-roboto" style={{ color: n.tagColor, borderColor: n.tagColor }}>
                            ⚠️ {n.tag}
                          </span>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] text-[#9ca3af] font-roboto">{n.time}</span>
                          <div className="flex gap-2">
                            {(n.type === 'message' || n.type === 'alert') && (
                              <button
                                className="text-[#155dfc] text-[11px] font-semibold cursor-pointer hover:underline font-roboto flex items-center gap-0.5"
                                onClick={() => { setReplyTarget({ name: n.title, desc: n.desc, avatar: null }); setNotifOpen(false); }}
                                aria-label={`Reply to notification: ${n.title}`}
                              >
                                <MdOutlineReply /> Reply
                              </button>
                            )}
                            {n.unread && (
                              <button
                                className="text-[#155dfc] text-[11px] font-semibold cursor-pointer hover:underline font-roboto"
                                onClick={() => markOneRead(n.id)}
                                aria-label={`Mark notification as read: ${n.title}`}
                              >
                                Mark read
                              </button>
                            )}
                            <button
                              className="text-[#ef4444] text-[11px] font-semibold cursor-pointer hover:underline font-roboto"
                              onClick={() => deleteNotif(n.id)}
                              aria-label={`Delete notification: ${n.title}`}
                            >
                              Delete
                            </button>
                            {n.actionUrl && (
                              <button
                                className="text-[#155dfc] text-[11px] font-semibold cursor-pointer hover:underline font-roboto"
                                onClick={() => { markOneRead(n.id); setNotifOpen(false); navigate(n.actionUrl); }}
                              >
                                Open
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      {n.unread && <span className="w-2 h-2 rounded-full shrink-0 mt-1.5 bg-[#3B82F6]" />}
                    </div>
                  )) : (
                    <div className="px-4 py-6 text-center">
                      <p className="text-[12px] text-[#6b7280] dark:text-gray-300 font-roboto">
                        No notifications yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Avatar ── */}
          <div
            className="flex items-center gap-[10px] pl-3.5 cursor-pointer group"
            onClick={() => navigate('/patient/settings')}
            role="button"
            tabIndex={0}
            aria-label="Open settings and profile"
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/patient/settings'); }}
          >
            {headerPhoto ? (
              <img src={headerPhoto} alt="Avatar" className="w-10 h-10 rounded-full object-cover border-2 border-[#e0eaff] shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#333CF5] to-[#9810fa] flex items-center justify-center text-white text-[14px] font-bold border-2 border-[#e0eaff] shrink-0">
                {(displayName || 'P')[0].toUpperCase()}
              </div>
            )}
            <div className="hidden md:flex flex-col">
              <span className="text-[13px] font-bold text-black-main-text dark:text-[#E2E8F0] whitespace-nowrap font-roboto ">{displayName}</span>
              <span className="text-[10px]  text-[#6b7280] uppercase tracking-wider font-roboto">{displayRole} </span>
            </div>
          </div>

        </div>
      </header>

      <ReplyModal target={replyTarget} onClose={() => setReplyTarget(null)} onSend={handleSendReply} />

      <style>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default PatientHeader;
