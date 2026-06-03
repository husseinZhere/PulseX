
import React, { useState, useRef, useEffect } from 'react';
import {
  HiOutlineXMark,
} from 'react-icons/hi2';
import { chatViaAiDirect } from '../../../../services/chatbotService';
import { useAuth } from '../../../../context/AuthContext';

const chatbotIcon = '/image/chatpot.svg';

/* ── Simple inline markdown renderer (bold, italic) ── */
const renderInline = (text) => {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*'))
      return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
};

const renderMessageText = (text) => {
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    if (line.trim() === '---')
      return <hr key={idx} className="border-white/20 dark:border-gray-600 my-2" />;
    if (line.startsWith('# '))
      return <p key={idx} className="font-bold text-[15px] mt-1 mb-0.5">{renderInline(line.slice(2))}</p>;
    if (line.startsWith('## '))
      return <p key={idx} className="font-semibold text-[14px] mt-2 mb-0.5">{renderInline(line.slice(3))}</p>;
    if (line.startsWith('- ') || line.startsWith('• '))
      return (
        <p key={idx} className="flex gap-1.5 items-start text-[13px] leading-5">
          <span className="mt-0.5 shrink-0">•</span>
          <span>{renderInline(line.slice(2))}</span>
        </p>
      );
    if (!line.trim()) return <div key={idx} className="h-1" />;
    return <p key={idx} className="text-[13px] leading-5">{renderInline(line)}</p>;
  });
};

const INITIAL_MESSAGES = [
  {
    id: 1,
    role: 'assistant',
    text: "Hey there! 👋 I'm EKO, your AI assistant. How can I help you today?",
  },
];

const PatientChatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    bottomRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
  }, [messages, isTyping, isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    const userMsg = { id: Date.now(), role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const resp = await chatViaAiDirect(text, {
        name: user?.firstName || user?.fullName || 'Patient',
      }, sessionId);
      if (resp?.session_id) setSessionId(resp.session_id);
      const reply = resp?.response || "I'm here to help with heart-health questions.";
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'assistant', text: reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: 'Sorry, the AI service is not available right now. Please try again later.',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Window */}
      <div
        className={`fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 z-50 w-screen sm:w-96 sm:max-w-[24rem] h-screen sm:h-[600px] sm:max-h-[calc(100vh-8rem)] bg-white dark:bg-[#0F172A] rounded-none sm:rounded-3xl overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.25)] outline-0 sm:outline-2 sm:-outline-offset-2 sm:outline-sky-200/60 dark:sm:outline-sky-900 transition-all duration-300 transform flex flex-col ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}
      >
        {/* Header */}
        <div className="relative w-full h-20 bg-blue-600 dark:bg-blue-700 flex items-center px-6">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 dark:to-black/20" />

          <div className="relative flex items-center gap-3 w-full">
            {/* Avatar */}
            <div className="w-13 h-13 bg-white dark:bg-[#111827] rounded-full shadow-lg flex items-center justify-center overflow-hidden border border-transparent dark:border-gray-700">
              <img className="w-15 h-15 object-cover" src={chatbotIcon} alt="PulseX" />
            </div>

            {/* Info */}
            <div className="flex flex-col">
              <span className="text-white text-base font-medium font-roboto leading-6">EKO</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse" />
                <span className="text-white/90 text-sm font-roboto">Online</span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="ml-auto w-8 h-8 bg-white/20 dark:bg-black/25 rounded-full flex items-center justify-center text-white hover:bg-white/30 dark:hover:bg-black/35 transition-colors cursor-pointer"
            >
              <HiOutlineXMark size={20} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 bg-gradient-to-b from-white to-gray-50/30 dark:from-[#0F172A] dark:to-[#111827] flex flex-col gap-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 font-roboto shadow-sm ${msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-t-2xl rounded-bl-2xl rounded-br-md text-[13px] leading-5'
                    : 'bg-cyan-50 dark:bg-[#1E293B] text-black-main-text dark:text-[#E2E8F0] rounded-t-2xl rounded-br-2xl rounded-bl-md'
                  }`}
              >
                {msg.role === 'user' ? msg.text : renderMessageText(msg.text)}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="bg-cyan-50 dark:bg-[#1E293B] px-4 py-2 rounded-2xl rounded-bl-md w-16 flex justify-center gap-1">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="w-full h-24 bg-white dark:bg-[#111827] border-t border-gray-100 dark:border-gray-800 px-4 sm:px-6 flex items-center gap-3">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message…"
              className="w-full h-12 pl-4 pr-4 bg-white dark:bg-[#0F172A] rounded-2xl outline-[0.80px] outline-cyan-300/70 dark:outline-sky-900 shadow-[0px_0px_0px_2px_rgba(77,234,251,0.20)] dark:shadow-[0px_0px_0px_2px_rgba(15,23,42,0.8)] text-black-main-text dark:text-[#E2E8F0] placeholder:text-neutral-950/50 dark:placeholder:text-gray-400 focus:outline-blue-400 transition-all"
            />
          </div>

          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer ${input.trim()
                ? 'bg-blue-600 text-white opacity-100 scale-100'
                : 'bg-blue-600 text-white opacity-50 scale-95'
              }`}
          >

            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.1135 18.0716C12.1452 18.1505 12.2002 18.2179 12.2712 18.2646C12.3423 18.3113 12.4259 18.3352 12.5109 18.333C12.5959 18.3308 12.6781 18.3027 12.7467 18.2524C12.8152 18.2021 12.8668 18.1321 12.8943 18.0516L18.311 2.2183C18.3377 2.14446 18.3428 2.06455 18.3257 1.98793C18.3086 1.9113 18.27 1.84113 18.2145 1.78561C18.159 1.7301 18.0888 1.69154 18.0122 1.67446C17.9356 1.65737 17.8557 1.66246 17.7818 1.68913L1.9485 7.1058C1.86808 7.13338 1.79802 7.1849 1.74772 7.25344C1.69743 7.32199 1.66931 7.40428 1.66713 7.48926C1.66495 7.57425 1.68883 7.65787 1.73555 7.7289C1.78226 7.79993 1.84959 7.85497 1.9285 7.88663L8.53683 10.5366C8.74574 10.6203 8.93554 10.7453 9.0948 10.9043C9.25406 11.0633 9.37948 11.2529 9.4635 11.4616L12.1135 18.0716Z" stroke="white" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M18.2114 1.78906L9.09473 10.9049" stroke="white" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-3 sm:bottom-8 sm:right-6 w-16 h-16 sm:w-20 sm:h-24 bg-transparent sm:flex items-center justify-center hover:scale-110 transition-transform z-50 cursor-pointer ${isOpen ? 'hidden sm:flex' : 'flex'}`}
      >
        <div className="relative">
          <img src={chatbotIcon} className="shadow-5xl w-30 h-30 animate-bot-alive" alt="chat" />
          {/* Waving hand */}
          <span
            className="absolute -top-2 -right-2 text-2xl select-none animate-wave-hand"
            style={{ display: 'inline-block' }}
          >
            👋
          </span>
        </div>
      </button>
    </>
  );
};

export default PatientChatbot;