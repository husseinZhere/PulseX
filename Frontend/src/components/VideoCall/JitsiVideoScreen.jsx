import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MdCallEnd, MdArrowBackIosNew, MdOpenInNew, MdVideocam, MdCall } from 'react-icons/md';

// meet.jit.si & framatalk enforce server-side lobby/auth — use an open instance instead.
// jitsi.member.fsf.org is maintained by the Free Software Foundation, no lobby, no login required.
const JITSI_DOMAIN = 'jitsi.member.fsf.org';

const buildJitsiUrl = (appointmentId, displayName) => {
  const room = `PulseXAppt${appointmentId}`;
  const name = encodeURIComponent(displayName || 'User');
  const params = [
    'config.prejoinPageEnabled=false',
    'config.disableDeepLinking=true',
    'config.startWithAudioMuted=false',
    'config.startWithVideoMuted=false',
    'config.requireDisplayName=false',
    'config.enableLobbyChat=false',
    'config.disableInitialGUM=false',
    'config.p2p.enabled=true',
    `userInfo.displayName=${name}`,
  ].join('&');
  return `https://${JITSI_DOMAIN}/${room}#${params}`;
};

/**
 * Opens Jitsi Meet in a NEW TAB only after the call is connected (status === 'connected').
 * While connecting, shows a "Calling..." screen.
 * Our app shows a "call in progress" overlay and monitors the tab.
 */
const JitsiVideoScreen = ({
  appointmentId,
  displayName,
  callStatus,
  errorMessage,
  onEndCall,
  onBack,
  duration,
}) => {
  const popupRef = useRef(null);
  const monitorRef = useRef(null);
  const tabOpenedRef = useRef(false);
  const [popupBlocked, setPopupBlocked] = useState(false);

  const jitsiUrl = buildJitsiUrl(appointmentId, displayName);

  const openTab = () => {
    const tab = window.open(jitsiUrl, 'PulseXVideoCall');
    if (!tab || tab.closed || typeof tab.closed === 'undefined') {
      setPopupBlocked(true);
      return;
    }
    setPopupBlocked(false);
    popupRef.current = tab;

    // Monitor tab: if user closes it directly, end the call
    monitorRef.current = setInterval(() => {
      if (popupRef.current?.closed) {
        clearInterval(monitorRef.current);
        onEndCall();
      }
    }, 1000);
  };

  // Open Jitsi tab only when status becomes 'connected' (after ring is sent / call is accepted)
  useEffect(() => {
    if (callStatus !== 'connected' || tabOpenedRef.current) return;
    tabOpenedRef.current = true;
    openTab();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(monitorRef.current);
    };
  }, []);

  const handleEndCall = () => {
    clearInterval(monitorRef.current);
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }
    onEndCall();
  };

  if (callStatus === 'error') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-[#0f172a] text-white"
      >
        <p className="max-w-sm text-center text-red-400">{errorMessage || 'Unable to start call'}</p>
        <button
          onClick={onEndCall}
          className="flex items-center gap-2 rounded-xl bg-[#f0152d] px-6 py-3 font-semibold text-white hover:bg-[#d90f25]"
        >
          <MdCallEnd size={18} /> Close
        </button>
      </motion.div>
    );
  }

  const isRinging = callStatus === 'idle' || callStatus === 'joining' || callStatus === 'connecting';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex flex-col bg-[#0f172a]"
    >
      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-between bg-black/70 px-4 py-2">
        {!isRinging ? (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white hover:bg-black/60"
          >
            <MdArrowBackIosNew size={11} /> Minimize
          </button>
        ) : (
          <div />
        )}

        {!isRinging && duration && duration !== '00:00' && (
          <span className="text-sm text-white/70">{duration}</span>
        )}

        <button
          onClick={handleEndCall}
          className="flex items-center gap-1.5 rounded-xl bg-[#f0152d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d90f25]"
        >
          <MdCallEnd size={16} /> {isRinging ? 'Cancel' : 'End Call'}
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
        {isRinging ? (
          /* Calling / connecting state */
          <>
            <div className="relative flex h-28 w-28 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-blue-500/30" />
              <span className="absolute inset-0 animate-ping rounded-full bg-blue-500/15 [animation-delay:0.4s]" />
              <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-2xl">
                <MdCall size={44} className="text-white" />
              </div>
            </div>

            <div>
              <p className="text-xl font-bold text-white">Calling...</p>
              <p className="mt-2 max-w-xs text-sm text-white/60">
                Waiting for the other party to accept your call.
              </p>
            </div>
          </>
        ) : (
          /* Connected state */
          <>
            <div className="relative flex h-28 w-28 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-green-500/30" />
              <span className="absolute inset-0 animate-ping rounded-full bg-green-500/15 [animation-delay:0.4s]" />
              <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-teal-500 shadow-2xl">
                <MdVideocam size={44} className="text-white" />
              </div>
            </div>

            <div>
              <p className="text-xl font-bold text-white">Call in Progress</p>
              {duration && duration !== '00:00' && (
                <p className="mt-1 text-sm text-white/50">{duration}</p>
              )}
              <p className="mt-2 max-w-xs text-sm text-white/60">
                Your video call is running in a separate tab.
              </p>
            </div>

            {popupBlocked ? (
              <div className="flex flex-col items-center gap-3">
                <p className="max-w-xs rounded-xl bg-yellow-500/20 px-4 py-2 text-sm text-yellow-300">
                  Your browser blocked the video window. Click below to open it.
                </p>
                <button
                  onClick={openTab}
                  className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-gray-100"
                >
                  <MdOpenInNew size={18} /> Open Video Call
                </button>
              </div>
            ) : (
              <button
                onClick={() => popupRef.current?.focus()}
                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/20"
              >
                <MdOpenInNew size={16} /> Switch to call window
              </button>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default JitsiVideoScreen;
