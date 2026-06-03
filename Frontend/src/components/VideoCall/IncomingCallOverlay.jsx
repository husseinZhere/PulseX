import React, { useEffect, useRef, useState } from 'react';
import { HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL, getToken } from '../../utils/api';
import { resolveFileUrl } from '../../utils/api';
import { MdCallEnd, MdCall } from 'react-icons/md';

const IncomingCallOverlay = ({ currentRole }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [incomingCall, setIncomingCall] = useState(null);

  const connectionRef = useRef(null);
  const handledSessionsRef = useRef(new Set());

  useEffect(() => {
    let disposed = false;

    const connection = new HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/hubs/videocall`, {
        accessTokenFactory: () => getToken() || '',
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connectionRef.current = connection;

    connection.on('IncomingCall', (payload) => {
      if (disposed || !payload?.sessionId) return;
      const sessionId = String(payload.sessionId);
      if (handledSessionsRef.current.has(sessionId)) return;
      setIncomingCall(payload);
    });

    connection.start()
      .then(() => console.log('[IncomingCallOverlay] hub connected'))
      .catch((err) => console.error('[IncomingCallOverlay] hub connection failed', err));

    return () => {
      disposed = true;
      if (connectionRef.current && connectionRef.current.state !== HubConnectionState.Disconnected) {
        connectionRef.current.stop().catch(() => {});
      }
      connectionRef.current = null;
    };
  }, []); // stable — never recreated on navigation

  const handleAccept = () => {
    if (!incomingCall) return;

    const sessionId = String(incomingCall.sessionId);
    handledSessionsRef.current.add(sessionId);

    if (currentRole === 'Doctor') {
      navigate('/doctor/messages', {
        state: {
          patientId: incomingCall.patientId,
          appointmentId: incomingCall.appointmentId,
          autoStartCall: true,
          incomingSessionId: incomingCall.sessionId,
        },
      });
    } else {
      navigate('/patient/messages', {
        state: {
          doctorId: incomingCall.doctorId,
          appointmentId: incomingCall.appointmentId,
          autoStartCall: true,
          incomingSessionId: incomingCall.sessionId,
        },
      });
    }

    setIncomingCall(null);
  };

  const handleDecline = async () => {
    if (!incomingCall) return;

    const sessionId = String(incomingCall.sessionId);
    handledSessionsRef.current.add(sessionId);

    try {
      if (connectionRef.current?.state === HubConnectionState.Connected) {
        await connectionRef.current.invoke('DeclineIncomingCall', {
          appointmentId: incomingCall.appointmentId,
          sessionId: incomingCall.sessionId,
          callerUserId: incomingCall.callerUserId,
        });
      }
    } catch (error) {
      console.error('Decline incoming call failed', error);
    } finally {
      setIncomingCall(null);
    }
  };

  const callerPhoto = incomingCall?.callerProfilePicture
    ? resolveFileUrl(incomingCall.callerProfilePicture)
    : null;

  const callerRole = incomingCall?.callerRole === 'Doctor' ? 'Dr.' : '';
  const callerName = incomingCall?.callerName
    ? `${callerRole} ${incomingCall.callerName}`.trim()
    : 'Someone';

  return (
    <AnimatePresence>
      {incomingCall && (
        <aside
          className="fixed inset-0 z-[120] grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="incoming-call-title"
        >
          <motion.section
            initial={{ scale: 0.92, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl dark:bg-[#111827]"
          >
            {/* Pulsing avatar ring to indicate ringing */}
            <div className="relative mx-auto mb-5 h-24 w-24">
              <span className="absolute inset-0 animate-ping rounded-full bg-green-400/40" />
              <span className="absolute inset-0 animate-ping rounded-full bg-green-400/20 [animation-delay:0.3s]" />
              {callerPhoto ? (
                <img
                  src={callerPhoto}
                  alt={callerName}
                  className="relative z-10 h-24 w-24 rounded-full object-cover ring-4 ring-green-400"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-teal-500 ring-4 ring-green-400">
                  <span className="text-3xl font-bold text-white">
                    {callerName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <h2 id="incoming-call-title" className="text-lg font-bold text-slate-900 dark:text-[#E2E8F0]">
              Incoming Video Call
            </h2>
            <p className="mt-1 text-base font-semibold text-gray-800 dark:text-gray-200">
              {callerName}
            </p>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              is calling you…
            </p>

            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleDecline}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-transform hover:scale-105 hover:bg-red-600 active:scale-95"
                aria-label="Decline call"
              >
                <MdCallEnd size={26} />
              </button>

              <button
                type="button"
                onClick={handleAccept}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform hover:scale-105 hover:bg-green-600 active:scale-95"
                aria-label="Accept call"
              >
                <MdCall size={26} />
              </button>
            </div>
          </motion.section>
        </aside>
      )}
    </AnimatePresence>
  );
};

export default IncomingCallOverlay;
