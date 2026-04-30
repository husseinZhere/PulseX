/**
 * Toast — Global reusable success/error/info toast notification
 *
 * Figma spec: bg-gray-100 (#F3F4F5), dark icon circle (#303746),
 * green check (#01E17B), green bottom bar, green radial glow,
 * slide-in from right, auto-dismiss after `duration` ms.
 *
 * Props:
 *  visible   {boolean}  — show/hide the toast
 *  title     {string}   — bold main line  (e.g. "Doctor Created Successfully")
 *  message   {string}   — sub-line        (e.g. "Your changes have been saved successfully")
 *  type      {string}   — 'success' | 'error' | 'info'  (default: 'success')
 *  duration  {number}   — ms before auto-hide            (default: 4000)
 *  onClose   {fn}       — called when toast hides
 *
 * Usage:
 *   const [toast, setToast] = useState({ visible: false, title: '', message: '' });
 *
 *   // show:
 *   setToast({ visible: true, title: 'Doctor Created Successfully',
 *              message: 'Your changes have been saved successfully' });
 *
 *   // in JSX:
 *   <Toast {...toast} onClose={() => setToast(t => ({ ...t, visible: false }))} />
 */
import React, { useEffect, useRef, useState } from 'react';
import { IoCheckmarkCircleSharp, IoInformationCircleSharp, IoWarningSharp, IoCloseCircleSharp } from 'react-icons/io5';

const TOAST_THEME = {
  success: {
    glow: 'radial-gradient(circle at 30px 50%, rgba(0,237,81,0.15) 0%, rgba(0,237,123,0.05) 40%, transparent 70%)',
    circleBg: 'bg-[#303746]',
    iconClass: 'text-[#00DF80]',
    icon: IoCheckmarkCircleSharp,
  },
  warning: {
    glow: 'radial-gradient(circle at 30px 50%, rgba(245,158,11,0.20) 0%, rgba(245,158,11,0.08) 40%, transparent 70%)',
    circleBg: 'bg-[#4B3A12]',
    iconClass: 'text-amber-400',
    icon: IoWarningSharp,
  },
  error: {
    glow: 'radial-gradient(circle at 30px 50%, rgba(239,68,68,0.20) 0%, rgba(239,68,68,0.08) 40%, transparent 70%)',
    circleBg: 'bg-[#4A1D1D]',
    iconClass: 'text-red-400',
    icon: IoCloseCircleSharp,
  },
  info: {
    glow: 'radial-gradient(circle at 30px 50%, rgba(59,130,246,0.20) 0%, rgba(59,130,246,0.08) 40%, transparent 70%)',
    circleBg: 'bg-[#1E3A5F]',
    iconClass: 'text-blue-400',
    icon: IoInformationCircleSharp,
  },
};

export default function Toast({
  visible = false,
  title = 'Password Changed Successfully',
  message = 'Your changes have been saved successfully',
  type = 'success',
  duration = 4000,
  onClose,
}) {
  const timerRef = useRef(null);
  const [shouldRender, setShouldRender] = useState(false);

  // التحكم في وقت الاختفاء التلقائي
  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      if (duration > 0) {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          onClose?.();
        }, duration);
      }
    } else {
      setShouldRender(false);
    }
    return () => clearTimeout(timerRef.current);
  }, [visible, duration, onClose]);

  // لو مش visible مش هنعرض حاجة خالص
  if (!shouldRender) return null;

  const resolvedType = TOAST_THEME[type] ? type : 'success';
  const theme = TOAST_THEME[resolvedType];
  const Icon = theme.icon;

  return (
    <div className="fixed top-[130px] left-3 right-3 sm:left-auto sm:right-[22px] z-[99999] pointer-events-none flex justify-center sm:justify-end w-full sm:w-auto">
      <div className="relative w-full max-w-[92vw] sm:w-[403px] sm:max-w-[403px] min-h-[82px] bg-[#F3F5F6] dark:bg-[#1E293B] rounded-[8px] px-4 py-3 flex items-center gap-4 overflow-hidden pointer-events-auto shadow-[0px_8px_10px_rgba(0,0,0,0.20),0px_6px_30px_rgba(0,0,0,0.12),0px_16px_24px_rgba(0,0,0,0.14)] animate-[slideIn_0.4s_cubic-bezier(0.34,1.56,0.64,1)_both]">

        {/* Radial glow */}
        <div
          className="absolute inset-0 z-[1]"
          style={{ background: theme.glow }}
        />

        {/* Icon circle */}
        <div className={`relative z-[2] w-[35px] h-[35px] rounded-full flex items-center justify-center shrink-0 ${theme.circleBg}`}>
          <Icon className={`text-[24px] ${theme.iconClass}`} />
        </div>

        {/* Text */}
        <div className="flex-1 z-[2]">
          <h4 className="text-[16px] font-semibold text-black-main-text dark:text-[#E2E8F0] m-0">{title}</h4>
          <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5 m-0">{message}</p>
        </div>

      </div>
    </div>
  );
}