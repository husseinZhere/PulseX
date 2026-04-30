import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import FullVideoScreen from './FullVideoScreen';
import MinimizeModal from './MinimizeModal';
import FloatingCallWindow from './FloatingCallWindow';
import EndCallModal from './EndCallModal';
import useVideoCall from '../../../../hooks/useVideoCall';

const VideoCallContainer = ({ isOpen, onClose, doctor, appointmentId, asInitiator = true, autoStart = false }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showMinimizeModal, setShowMinimizeModal] = useState(false);
  const [showEndCallModal, setShowEndCallModal] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [duration, setDuration] = useState(0);
  const startRequestedRef = useRef(false);

  const {
    state,
    localStream,
    remoteStream,
    mediaState,
    startCall,
    acceptIncoming,
    endCall,
    toggleVideo,
    toggleAudio,
  } = useVideoCall();

  const isMuted = !mediaState.audio;
  const isVideoOff = !mediaState.video;

  useEffect(() => {
    if (!isOpen || !appointmentId) {
      startRequestedRef.current = false;
      return;
    }

    if (startRequestedRef.current) {
      return;
    }

    if (state.status !== 'idle' && state.status !== 'ringing') {
      return;
    }

    startRequestedRef.current = true;

    if (autoStart) {
      acceptIncoming(appointmentId).catch(() => {
        startRequestedRef.current = false;
      });
      return;
    }

    startCall({ appointmentId, asInitiator }).catch(() => {
      startRequestedRef.current = false;
    });
  }, [isOpen, appointmentId, asInitiator, autoStart, state.status, startCall, acceptIncoming]);

  useEffect(() => {
    let interval;
    if (isOpen && state.status === 'connected') {
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

  const resetLocalCallState = () => {
    setIsMinimized(false);
    setShowMinimizeModal(false);
    setShowEndCallModal(false);
    setIsSpeakerOn(true);
  };

  const handleRequestEndCall = () => {
    setShowMinimizeModal(false);
    setShowEndCallModal(true);
  };

  const handleConfirmEndCall = async () => {
    await endCall();
    startRequestedRef.current = false;
    resetLocalCallState();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <FullVideoScreen
            doctor={doctor}
            isMuted={isMuted}
            setIsMuted={() => toggleAudio()}
            isVideoOff={isVideoOff}
            setIsVideoOff={() => toggleVideo()}
            isSpeakerOn={isSpeakerOn}
            setIsSpeakerOn={setIsSpeakerOn}
            onBack={() => setShowMinimizeModal(true)}
            onEndCall={handleRequestEndCall}
            duration={formatTime(duration)}
            localStream={localStream}
            remoteStream={remoteStream}
            callStatus={state.status}
            connectionQuality={state.connectionQuality}
            errorMessage={state.error}
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
        doctorName={doctor?.name || 'your doctor'}
      />

      <EndCallModal
        isOpen={showEndCallModal}
        onClose={() => setShowEndCallModal(false)}
        onConfirm={handleConfirmEndCall}
        duration={formatTime(duration)}
        doctorName={doctor?.name || 'your doctor'}
      />

      {isMinimized && (
        <FloatingCallWindow
          doctor={doctor}
          duration={formatTime(duration)}
          isMuted={isMuted}
          onToggleMute={() => toggleAudio()}
          isSpeakerOn={isSpeakerOn}
          onToggleSpeaker={() => setIsSpeakerOn((prev) => !prev)}
          onExpand={() => setIsMinimized(false)}
          onEndCall={handleRequestEndCall}
        />
      )}
    </>
  );
};

export default VideoCallContainer;