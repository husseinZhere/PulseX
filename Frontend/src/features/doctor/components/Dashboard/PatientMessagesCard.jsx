import React from 'react';
import { useNavigate } from 'react-router-dom';

const ArrowUpRightIcon = ({ className }) => (
  <svg
    className={className}
    width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
  >
    <line x1="7" y1="17" x2="17" y2="7"></line>
    <polyline points="7 7 17 7 17 17"></polyline>
  </svg>
);

const ArrowRightIcon = ({ className }) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

const getBubbleColor = (index) => {
  const colors = [
    'bg-[#EEF7EF] dark:bg-[rgba(22,101,52,0.2)]', // subtle green for first
    'bg-[#DFEFF8] dark:bg-[rgba(37,99,235,0.2)]', // subtle blue for second
    'bg-[#FAF0ED] dark:bg-[rgba(157,23,77,0.2)]', // subtle pink for third
  ];
  return colors[index % colors.length];
};

const PatientMessagesCard = ({ messages, onViewAll }) => {
  const navigate = useNavigate();

  const handleMessageClick = (message) => {
    navigate('/doctor/messages', {
      state: {
        patientId: message.patientId,
        appointmentId: message.appointmentId,
      },
    });
  };

  if (!messages.length) {
    return (
      <section className="rounded-[24px] border-[0.5px] border-[#D7D8DC] dark:border-gray-700 bg-white dark:bg-[#111827] p-6 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] h-full" aria-labelledby="messages-title-empty">
        <div className="flex items-center justify-between mb-6">
          <h2 id="messages-title-empty" className="text-[20px] font-bold text-[#010218] dark:text-[#E2E8F0]">Patient Messages</h2>
          <span className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#F1F5F9] dark:bg-[#1E293B] text-[13px] font-bold text-[#94A3B8] dark:text-gray-500">0</span>
        </div>
        <div className="flex flex-col items-center justify-center py-5 gap-3">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] dark:from-[#1e1b4b]/60 dark:to-[#1e293b] flex items-center justify-center shadow-sm">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="#C7D2FE" stroke="#818CF8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="9" cy="10" r="1" fill="#6366F1" />
                <circle cx="12" cy="10" r="1" fill="#6366F1" />
                <circle cx="15" cy="10" r="1" fill="#6366F1" />
              </svg>
            </div>
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#E5E7EB] dark:bg-[#374151] border-2 border-white dark:border-[#111827]" />
          </div>
          <div className="text-center">
            <p className="text-[17px] font-bold text-[#010218] dark:text-[#E2E8F0]">No Messages Yet</p>
            <p className="mt-1 text-[12.5px] text-[#9CA3AF] leading-relaxed max-w-[180px] mx-auto">Patient messages will appear here once conversations start</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col h-fit rounded-[24px] border-[0.5px] border-[#D7D8DC] dark:border-gray-700 bg-white dark:bg-[#111827] p-5 lg:p-6 shadow-[0px_4px_16px_rgba(0,0,0,0.06)]" aria-labelledby="messages-title">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 id="messages-title" className="text-[19px] font-bold text-[#010218] dark:text-[#E2E8F0]">Patient Messages</h2>
        <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#EF4444] dark:bg-[#1E293B] text-[12px] font-bold text-white shadow-sm dark:shadow-none">
          {messages.length}
        </span>
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {messages.slice(0, 3).map((message, index) => {
          // Mock online status logic for visual replica: 
          // First item is green (online), others are light gray (offline)
          const isOnline = index === 0;

          return (
            <article
              key={message.id}
              onClick={() => handleMessageClick(message)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleMessageClick(message); }}
              className="group cursor-pointer flex items-start gap-3 transition-transform hover:-translate-y-0.5"
            >
              {/* Avatar with Status Dot */}
              <div className="relative mt-1.5 shrink-0">
                {message.avatar ? (
                  <img
                    src={message.avatar}
                    alt={message.name}
                    className="h-[42px] w-[42px] rounded-full object-cover shadow-sm dark:shadow-none"
                  />
                ) : (
                  <div className="h-[42px] w-[42px] rounded-full bg-white text-[#333CF5] flex items-center justify-center text-[14px] font-bold shadow-sm dark:shadow-none">
                    {message.name?.charAt(0)?.toUpperCase() || 'P'}
                  </div>
                )}
                <span
                  className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-[2.5px] border-white dark:border-[#111827] ${isOnline ? 'bg-[#4ADE80]' : 'bg-[#D1D5DB]'}`}
                />
              </div>

              {/* Chat Bubble */}
              <div className={`relative flex-1 rounded-[20px] p-3.5 ${getBubbleColor(index)}`}>
                <div className="flex items-start justify-between">
                  <h3 className="text-[14.5px] font-bold text-[#010218] dark:text-[#E2E8F0] tracking-tight">{message.name}</h3>
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#010218] text-white transition-transform group-hover:scale-110">
                    <ArrowUpRightIcon />
                  </div>
                </div>

                <p className="mt-1 text-[13.5px] text-[#757575] line-clamp-1 leading-snug">
                  {message.text}
                </p>

                <p className="mt-1.5 text-[11.5px] font-medium text-[#A1A1AA]">
                  {message.time}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      {/* Footer Button */}
      <div className="mt-auto pt-4">
        <button
          type="button"
          onClick={onViewAll}
          className="cursor-pointer group flex w-full items-center justify-center gap-2 rounded-full bg-[#333CF5] py-3 text-[14px] font-bold text-white shadow-md dark:shadow-none transition-all hover:bg-[#2028C6] hover:shadow-lg dark:shadow-none active:scale-[0.98]"
          aria-label="View all messages"
        >
          View All Messages
          <ArrowRightIcon className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </section>
  );
};

export default PatientMessagesCard;
