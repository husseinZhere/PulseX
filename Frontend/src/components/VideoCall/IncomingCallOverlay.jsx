import React, { useEffect, useRef, useState } from 'react';
import { HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL, getToken } from '../../utils/api';

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
      if (disposed || !payload?.sessionId) {
        return;
      }

      const sessionId = String(payload.sessionId);
      if (handledSessionsRef.current.has(sessionId)) {
        return;
      }

      // Avoid opening duplicated modal if we already navigated with this session.
      if (location.state?.incomingSessionId && String(location.state.incomingSessionId) === sessionId) {
        return;
      }

      setIncomingCall(payload);
    });

    const start = async () => {
      try {
        await connection.start();
      } catch (error) {
        console.error('Incoming call overlay connection failed', error);
      }
    };

    start();

    return () => {
      disposed = true;
      if (connectionRef.current && connectionRef.current.state !== HubConnectionState.Disconnected) {
        connectionRef.current.stop().catch(() => {});
      }
      connectionRef.current = null;
    };
  }, [location.state]);

  const handleAccept = () => {
    if (!incomingCall) {
      return;
    }

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
    if (!incomingCall) {
      return;
    }

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
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl dark:bg-[#111827]"
          >
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
              <img
                src={incomingCall.callerProfilePicture}
                alt={incomingCall.callerName || 'Caller'}
                className="h-16 w-16 rounded-full object-cover"
              />
            </div>

            <h2 id="incoming-call-title" className="text-xl font-bold text-slate-950 dark:text-[#E2E8F0]">
              Incoming Video Call
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {incomingCall.callerName || 'Someone'} is calling you now.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleDecline}
                className="h-12 min-w-32 rounded-2xl bg-red-500 px-5 font-bold text-white transition-colors hover:bg-red-600"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={handleAccept}
                className="h-12 min-w-32 rounded-2xl bg-green-500 px-5 font-bold text-white transition-colors hover:bg-green-600"
              >
                Answer
              </button>
            </div>
          </motion.section>
        </aside>
      )}
    </AnimatePresence>
  );
};

export default IncomingCallOverlay;
