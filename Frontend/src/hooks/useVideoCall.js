import { useCallback, useEffect, useRef, useState } from 'react';
import { HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { API_BASE_URL, getToken } from '../utils/api';
import { endVideoCall as endCallApi, joinVideoCall } from '../services/videoCallService';

const emptyState = () => ({
    status: 'idle', // idle | joining | connecting | connected | ended | error
    sessionId: null,
    appointmentId: null,
    error: null,
    redirect: null,
});

export default function useVideoCall() {
    const [state, setState] = useState(emptyState);

    const connectionRef = useRef(null);
    const startPromiseRef = useRef(null);
    const sessionIdRef = useRef(null);

    const patchState = useCallback((patch) => {
        setState((prev) => ({ ...prev, ...patch }));
    }, []);

    const ensureConnection = useCallback(async () => {
        if (connectionRef.current?.state === HubConnectionState.Connected) {
            return connectionRef.current;
        }

        if (!connectionRef.current || connectionRef.current.state === HubConnectionState.Disconnected) {
            const connection = new HubConnectionBuilder()
                .withUrl(`${API_BASE_URL}/hubs/videocall`, {
                    accessTokenFactory: () => getToken() || '',
                })
                .withAutomaticReconnect()
                .configureLogging(LogLevel.Warning)
                .build();

            connection.on('IncomingCallDeclined', () => {
                patchState({ status: 'ended', error: 'The other participant declined the call.' });
            });

            connection.on('CallEnded', () => {
                patchState({ status: 'ended' });
            });

            connection.on('RedirectTo', (redirect) => {
                patchState({ redirect });
            });

            connectionRef.current = connection;
        }

        if (startPromiseRef.current) {
            await startPromiseRef.current;
            return connectionRef.current;
        }

        if (connectionRef.current?.state === HubConnectionState.Connected) {
            return connectionRef.current;
        }

        startPromiseRef.current = connectionRef.current
            .start()
            .finally(() => { startPromiseRef.current = null; });

        await startPromiseRef.current;
        return connectionRef.current;
    }, [patchState]);

    const startCall = useCallback(async ({ appointmentId, asInitiator = false }) => {
        try {
            patchState({ status: 'joining', appointmentId, error: null });

            const raw = await joinVideoCall(appointmentId);
            const payload = raw?.data ?? raw;
            const sessionId = String(payload?.sessionId ?? payload?.SessionId ?? '');

            if (!sessionId) {
                throw new Error(payload?.message ?? 'No session id returned from server');
            }

            sessionIdRef.current = sessionId;
            patchState({ sessionId, status: 'connecting' });

            const connection = await ensureConnection();
            await connection.invoke('JoinSession', sessionId);

            if (asInitiator) {
                await connection.invoke('NotifyIncomingCall', { appointmentId, sessionId });
            }

            patchState({ status: 'connected' });
        } catch (error) {
            patchState({
                status: 'error',
                error: error?.response?.data?.message || error?.message || 'Unable to start video call right now',
            });
            throw error;
        }
    }, [ensureConnection, patchState]);

    const acceptIncoming = useCallback(async (appointmentIdOrObj) => {
        const appointmentId =
            typeof appointmentIdOrObj === 'object'
                ? Number(appointmentIdOrObj?.appointmentId)
                : Number(appointmentIdOrObj);
        await startCall({ appointmentId, asInitiator: false });
    }, [startCall]);

    const declineIncoming = useCallback(() => {
        patchState({ status: 'idle' });
    }, [patchState]);

    const endCall = useCallback(async () => {
        const connection = connectionRef.current;
        const sessionId = sessionIdRef.current;
        try {
            if (connection?.state === HubConnectionState.Connected && sessionId) {
                await connection.invoke('EndCall', { sessionId, reason: 'User ended call' });
            } else if (sessionId) {
                await endCallApi(sessionId, 'User ended call');
            }
        } catch (error) {
            console.error('End call failed', error);
        } finally {
            sessionIdRef.current = null;
            patchState({ status: 'ended' });
        }
    }, [patchState]);

    useEffect(() => {
        return () => {
            if (connectionRef.current && connectionRef.current.state !== HubConnectionState.Disconnected) {
                connectionRef.current.stop().catch(() => {});
            }
            connectionRef.current = null;
            startPromiseRef.current = null;
        };
    }, []);

    return { state, startCall, acceptIncoming, declineIncoming, endCall };
}
