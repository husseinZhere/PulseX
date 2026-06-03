import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import JitsiVideoScreen from '../../../../components/VideoCall/JitsiVideoScreen';
import MinimizeModal from './MinimizeModal';
import FloatingCallWindow from './FloatingCallWindow';
import useVideoCall from '../../../../hooks/useVideoCall';
import { useAuth } from '../../../../context/AuthContext';

const VideoCallContainer = ({ isOpen, onClose, doctor, appointmentId, asInitiator = true, autoStart = false }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showMinimizeModal, setShowMinimizeModal] = useState(false);
  const [duration, setDuration] = useState(0);
  const startRequestedRef = useRef(false);
  const { user } = useAuth();

  const { state, startCall, acceptIncoming, endCall } = useVideoCall();

  useEffect(() => {
    if (!isOpen || !appointmentId) {
      startRequestedRef.current = false;
      return;
    }
    if (startRequestedRef.current) return;
    if (state.status !== 'idle' && state.status !== 'ringing') return;

    startRequestedRef.current = true;

    if (autoStart) {
      acceptIncoming(appointmentId).catch(() => { startRequestedRef.current = false; });
      return;
    }
    startCall({ appointmentId, asInitiator }).catch(() => { startRequestedRef.current = false; });
  }, [isOpen, appointmentId, asInitiator, autoStart, state.status, startCall, acceptIncoming]);

  useEffect(() => {
    let interval;
    if (isOpen && (state.status === 'connected' || state.status === 'connecting')) {
      interval = setInterval(() => setDuration((prev) => prev + 1), 1000);
    } else if (!isOpen) {
      setDuration(0);
    }
    return () => clearInterval(interval);
  }, [isOpen, state.status]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEnd = async () => {
    await endCall();
    startRequestedRef.current = false;
    setIsMinimized(false);
    setShowMinimizeModal(false);
    onClose();
  };

  if (!isOpen) return null;

  const displayName = user?.fullName || 'Doctor';

  return (
    <>
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <JitsiVideoScreen
            appointmentId={appointmentId}
            displayName={displayName}
            callStatus={state.status}
            errorMessage={state.error}
            onBack={() => setShowMinimizeModal(true)}
            onEndCall={handleEnd}
            duration={formatTime(duration)}
          />
        )}
      </AnimatePresence>

      <MinimizeModal
        isOpen={showMinimizeModal}
        onClose={() => setShowMinimizeModal(false)}
        onConfirm={() => {
          setIsMinimized(true);
          setShowMinimizeModal(false);
        }}
        duration={formatTime(duration)}
      />

      {isMinimized && (
        <FloatingCallWindow
          doctor={doctor}
          duration={formatTime(duration)}
          isMuted={false}
          onToggleMute={() => {}}
          isSpeakerOn={true}
          onToggleSpeaker={() => {}}
          onExpand={() => setIsMinimized(false)}
          onEndCall={handleEnd}
        />
      )}
    </>
  );
};

export default VideoCallContainer;
