import React, { useState, useEffect } from 'react';
import AgoraRTC, {
  AgoraRTCProvider,
  useJoin,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  usePublish,
  useRemoteUsers,
  RemoteUser,
  LocalVideoTrack,
} from 'agora-rtc-react';
import { motion } from 'framer-motion';
import {
  MdCallEnd,
  MdMic,
  MdMicOff,
  MdVideocam,
  MdVideocamOff,
  MdArrowBackIosNew,
  MdCall,
} from 'react-icons/md';

const agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

// ── Inner component — only mounted when appId + channelName are valid ──
const VideoRoom = ({ appId, channelName, token, uid, onEndCall, onBack, duration }) => {
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);

  // Create the tracks ONCE (ready = true). Toggling mute/camera is done via
  // setEnabled below — NOT by destroying/recreating the track, which caused the
  // on/off state to desync from what the remote party actually received.
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(true);
  const { localCameraTrack } = useLocalCameraTrack(true);
  const remoteUsers = useRemoteUsers();

  useJoin({ appid: appId, channel: channelName, token: token || null, uid: uid || 0 });
  usePublish([localMicrophoneTrack, localCameraTrack]);

  // Actually mute/unmute the published mic track for the remote party.
  useEffect(() => {
    localMicrophoneTrack?.setEnabled(micOn).catch(() => {});
  }, [micOn, localMicrophoneTrack]);

  // Actually turn the published camera on/off for the remote party.
  useEffect(() => {
    localCameraTrack?.setEnabled(cameraOn).catch(() => {});
  }, [cameraOn, localCameraTrack]);

  const isWaiting = remoteUsers.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex flex-col bg-[#0f172a]"
    >
      {/* Top bar */}
      <div className="relative z-10 flex shrink-0 items-center justify-between bg-black/70 px-4 py-2">
        {!isWaiting ? (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white hover:bg-black/60"
          >
            <MdArrowBackIosNew size={11} /> Minimize
          </button>
        ) : (
          <div />
        )}

        {!isWaiting && duration && duration !== '00:00' && (
          <span className="text-sm text-white/70">{duration}</span>
        )}

        <button
          onClick={onEndCall}
          className="flex items-center gap-1.5 rounded-xl bg-[#f0152d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d90f25]"
        >
          <MdCallEnd size={16} /> {isWaiting ? 'Cancel' : 'End Call'}
        </button>
      </div>

      {/* Video area */}
      <div className="relative flex-1 overflow-hidden">
        {isWaiting ? (
          <div className="flex h-full flex-col items-center justify-center gap-6 text-center px-4">
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
                Waiting for the other party to join.
              </p>
            </div>
          </div>
        ) : (
          remoteUsers.map((user) => (
            <RemoteUser
              key={user.uid}
              user={user}
              playVideo
              playAudio
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ))
        )}

        {/* Local video PiP */}
        {!isWaiting && (
          <div className="absolute bottom-20 right-4 h-44 w-32 overflow-hidden rounded-2xl border-2 border-white/20 shadow-xl bg-slate-800">
            {cameraOn && localCameraTrack ? (
              <LocalVideoTrack
                track={localCameraTrack}
                play
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-white/40">
                Camera Off
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls — only when connected */}
      {!isWaiting && (
        <div className="flex shrink-0 items-center justify-center gap-5 bg-black/60 py-5">
          <button
            onClick={() => setMicOn((v) => !v)}
            className={`flex h-14 w-14 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95 ${
              micOn ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {micOn ? <MdMic size={26} /> : <MdMicOff size={26} />}
          </button>

          <button
            onClick={onEndCall}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-all hover:scale-105 hover:bg-red-600 active:scale-95"
          >
            <MdCallEnd size={30} />
          </button>

          <button
            onClick={() => setCameraOn((v) => !v)}
            className={`flex h-14 w-14 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95 ${
              cameraOn ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {cameraOn ? <MdVideocam size={26} /> : <MdVideocamOff size={26} />}
          </button>
        </div>
      )}
    </motion.div>
  );
};

// ── Connecting screen — shown before credentials arrive ──
const ConnectingScreen = ({ onEndCall }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[60] flex flex-col bg-[#0f172a]"
  >
    <div className="flex shrink-0 items-center justify-end bg-black/70 px-4 py-2">
      <button
        onClick={onEndCall}
        className="flex items-center gap-1.5 rounded-xl bg-[#f0152d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d90f25]"
      >
        <MdCallEnd size={16} /> Cancel
      </button>
    </div>
    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <div className="relative flex h-28 w-28 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-blue-500/30" />
        <span className="absolute inset-0 animate-ping rounded-full bg-blue-500/15 [animation-delay:0.4s]" />
        <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-2xl">
          <MdCall size={44} className="text-white" />
        </div>
      </div>
      <p className="text-xl font-bold text-white">Connecting...</p>
    </div>
  </motion.div>
);

// ── Error screen ──
const ErrorScreen = ({ errorMessage, onEndCall }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
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

// ── Main export — mounts VideoRoom only when credentials are ready ──
const AgoraVideoScreen = ({ appId, channelName, token, uid, callStatus, errorMessage, onEndCall, onBack, duration }) => {
  if (callStatus === 'error') {
    return <ErrorScreen errorMessage={errorMessage} onEndCall={onEndCall} />;
  }

  // Don't mount Agora hooks until we have real credentials from the server
  if (!appId || !channelName) {
    return <ConnectingScreen onEndCall={onEndCall} />;
  }

  return (
    <AgoraRTCProvider client={agoraClient}>
      <VideoRoom
        appId={appId}
        channelName={channelName}
        token={token}
        uid={uid}
        onEndCall={onEndCall}
        onBack={onBack}
        duration={duration}
      />
    </AgoraRTCProvider>
  );
};

export default AgoraVideoScreen;
