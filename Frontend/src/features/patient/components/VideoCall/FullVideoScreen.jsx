import React, { useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineMicrophone, HiOutlineVideoCamera, HiOutlineSpeakerWave } from 'react-icons/hi2';
import { MdCallEnd, MdArrowBackIosNew, MdMicOff, MdVolumeOff } from 'react-icons/md';

const STATUS_LABELS = {
  joining: 'Preparing devices',
  ringing: 'Ringing...',
  connecting: 'Connecting...',
  reconnecting: 'Reconnecting...',
  connected: 'Connected',
  error: 'Call unavailable',
  ended: 'Call ended',
};

const getStatusLabel = (callStatus, errorMessage) => {
  if (callStatus !== 'error') return STATUS_LABELS[callStatus] || 'In call';

  const normalizedError = String(errorMessage || '').toLowerCase();
  if (
    normalizedError.includes('camera') ||
    normalizedError.includes('microphone') ||
    normalizedError.includes('browser') ||
    normalizedError.includes('permissions') ||
    normalizedError.includes('https')
  ) {
    return 'Camera unavailable';
  }

  return STATUS_LABELS.error;
};

const FullVideoScreen = ({
  doctor,
  isMuted,
  setIsMuted,
  isVideoOff,
  setIsVideoOff,
  isSpeakerOn,
  setIsSpeakerOn,
  onBack,
  onEndCall,
  duration,
  localStream,
  remoteStream,
  callStatus,
  connectionQuality,
  errorMessage,
}) => {
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);

  useEffect(() => {
    if (!remoteVideoRef.current) return;
    remoteVideoRef.current.srcObject = remoteStream || null;
  }, [remoteStream]);

  useEffect(() => {
    if (!localVideoRef.current) return;
    localVideoRef.current.srcObject = localStream || null;
  }, [localStream]);

  const statusLabel = getStatusLabel(callStatus, errorMessage);

  const networkLabel = useMemo(() => {
    const local = connectionQuality?.local || 'Unknown';
    const latency = connectionQuality?.latencyMs;
    if (latency == null) return local;
    return `${local} (${latency} ms)`;
  }, [connectionQuality]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-60 flex flex-col bg-[#0f172a]"
    >
      <div className="absolute inset-0 bg-black">
        {remoteStream ? (
          <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="text-center text-white">
              <img
                src={doctor?.img}
                alt={doctor?.name || 'Participant'}
                className="mx-auto mb-3 h-28 w-28 rounded-full object-cover ring-4 ring-white/20"
              />
              <p className="text-lg font-semibold">{doctor?.name || 'Participant'}</p>
              <p className="mt-1 text-sm text-white/70">{statusLabel}</p>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/45" />
      </div>

      <div className="relative flex items-start justify-between p-4 sm:p-5">
        <div className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 backdrop-blur-md">
          <h3 className="text-sm font-semibold text-white">{doctor?.name || 'Participant'}</h3>
          <p className="mt-0.5 text-xs text-white/80">
            {statusLabel}
            {callStatus === 'connected' && <span className="ml-1">• {duration}</span>}
          </p>
          {callStatus === 'error' && errorMessage ? (
            <p className="mt-1 max-w-[280px] text-[11px] text-red-200">{errorMessage}</p>
          ) : null}
        </div>

        <div className="relative h-44 w-32 overflow-hidden rounded-xl border border-white/20 bg-slate-900 shadow-2xl">
          {localStream && !isVideoOff ? (
            <video ref={localVideoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-white/70">Camera Off</div>
          )}
          <div className="absolute bottom-1 left-1 right-1 rounded-md bg-black/50 px-2 py-1 text-[10px] text-white/95">
            You
          </div>
        </div>
      </div>

      <div className="relative mt-auto flex flex-col items-center gap-3 px-4 pb-6">
        <div className="w-full max-w-[410px] rounded-2xl border border-white/10 bg-white/95 px-3 py-3 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`h-10 w-10 shrink-0 rounded-xl border transition-colors ${
                isMuted ? 'border-red-500 bg-red-500 text-white' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {isMuted ? <MdMicOff size={18} /> : <HiOutlineMicrophone size={18} />}
            </button>

            <button
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`h-10 w-10 shrink-0 rounded-xl border transition-colors ${
                isVideoOff ? 'border-red-500 bg-red-500 text-white' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <HiOutlineVideoCamera size={18} />
            </button>

            <button
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`h-10 w-10 shrink-0 rounded-xl border transition-colors ${
                isSpeakerOn ? 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50' : 'border-red-500 bg-red-500 text-white'
              }`}
            >
              {isSpeakerOn ? <HiOutlineSpeakerWave size={18} /> : <MdVolumeOff size={18} />}
            </button>

            <button
              onClick={onEndCall}
              className="flex min-w-[120px] shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#f0152d] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#d90f25]"
            >
              <MdCallEnd size={16} /> End Call
            </button>
          </div>
        </div>

        {callStatus !== 'error' && (
          <div className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[11px] text-white/90 backdrop-blur-sm">
            Network: {networkLabel}
          </div>
        )}

        <button
          onClick={onBack}
          className="absolute bottom-6 left-4 flex items-center gap-1.5 rounded-xl border border-white/10 bg-black/35 px-3.5 py-2 text-[12px] text-white transition-colors hover:bg-black/50"
        >
          <MdArrowBackIosNew size={12} /> Minimize
        </button>
      </div>
    </motion.div>
  );
};

export default FullVideoScreen;
