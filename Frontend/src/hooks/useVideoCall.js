import { useCallback, useEffect, useRef, useState } from 'react';
import { HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { API_BASE_URL, getToken } from '../utils/api';
import { endVideoCall as endCallApi, joinVideoCall } from '../services/videoCallService';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

const emptyState = () => ({
    status: 'idle', // idle | joining | ringing | connecting | reconnecting | connected | ended | error
    sessionId: null,
    appointmentId: null,
    participants: [],
    incomingCall: null,
    error: null,
    redirect: null,
    durationSeconds: 0,
    connectionQuality: {
        local: 'Unknown',
        remote: 'Unknown',
        latencyMs: null,
    },
    remoteMedia: {
        videoEnabled: true,
        audioEnabled: true,
    },
});

const qualityFromLatency = (latencyMs) => {
    if (latencyMs < 100) return 'Excellent';
    if (latencyMs < 180) return 'Good';
    if (latencyMs < 300) return 'Fair';
    return 'Poor';
};

const toSessionId = (value) => (value == null ? null : String(value));

const mapMediaError = (error) => {
    switch (error?.name) {
        case 'NotAllowedError':
            return 'Please allow camera and microphone permissions.';
        case 'NotFoundError':
            return 'No camera or microphone device was found.';
        case 'NotReadableError':
            return 'Camera or microphone is being used by another app.';
        case 'OverconstrainedError':
            return 'Selected camera/microphone constraints are not supported.';
        default:
            return error?.message || 'Failed to access camera and microphone.';
    }
};

const getUnsupportedMediaMessage = () => {
    const isSecureContext =
        typeof window !== 'undefined' &&
        (window.isSecureContext ||
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname.endsWith('.localhost'));

    if (!isSecureContext) {
        return 'Camera and microphone require HTTPS, or open the app from http://localhost:5173 on this computer.';
    }

    return 'This browser does not expose camera and microphone access. Try Chrome or Edge and allow site permissions.';
};

const mapApiError = (error, fallbackMessage) => {
    const response = error?.response?.data;

    if (typeof response === 'string' && response.trim()) {
        return response;
    }

    if (response && typeof response === 'object') {
        const directMessage =
            response.message ??
            response.Message ??
            response.error ??
            response.Error ??
            response.reason ??
            response.Reason ??
            response?.data?.message ??
            response?.data?.Message ??
            response?.data?.reason ??
            response?.data?.Reason;

        if (typeof directMessage === 'string' && directMessage.trim()) {
            return directMessage;
        }

        if (response.errors && typeof response.errors === 'object') {
            const firstError = Object.values(response.errors).flat?.()[0];
            if (typeof firstError === 'string' && firstError.trim()) {
                return firstError;
            }
        }
    }

    if (typeof error?.message === 'string' && error.message.trim()) {
        return error.message;
    }

    return fallbackMessage;
};

export default function useVideoCall() {
    const [state, setState] = useState(emptyState);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [mediaState, setMediaState] = useState({ video: true, audio: true });

    const connectionRef = useRef(null);
    const startPromiseRef = useRef(null);
    const peerRef = useRef(null);
    const sessionIdRef = useRef(null);
    const isInitiatorRef = useRef(false);
    const pendingCandidatesRef = useRef([]);
    const hasRemoteDescriptionRef = useRef(false);
    const localStreamRef = useRef(null);

    const patchState = useCallback((patch) => {
        setState((prev) => ({ ...prev, ...patch }));
    }, []);

    const clearIncomingCall = useCallback(() => {
        setState((prev) => ({ ...prev, incomingCall: null }));
    }, []);

    const drainPendingCandidates = useCallback(async () => {
        if (!peerRef.current) return;

        while (pendingCandidatesRef.current.length) {
            const candidate = pendingCandidatesRef.current.shift();
            try {
                await peerRef.current.addIceCandidate(candidate);
            } catch (error) {
                console.error('Drain ICE candidate failed', error);
            }
        }
    }, []);

    const createPeer = useCallback(() => {
        const peer = new RTCPeerConnection(ICE_SERVERS);

        peer.onicecandidate = async (event) => {
            const connection = connectionRef.current;
            const sessionId = sessionIdRef.current;
            if (!event.candidate || !connection || !sessionId) return;

            try {
                await connection.invoke('SendIceCandidate', {
                    sessionId,
                    candidate: event.candidate.candidate,
                    sdpMid: event.candidate.sdpMid,
                    sdpMLineIndex: event.candidate.sdpMLineIndex,
                });
            } catch (error) {
                console.error('SendIceCandidate failed', error);
            }
        };

        peer.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
                setRemoteStream(event.streams[0]);
                patchState({ status: 'connected' });
            }
        };

        peer.onconnectionstatechange = () => {
            const nextState = peer.connectionState;
            if (nextState === 'connected') {
                patchState({ status: 'connected', error: null });
            } else if (nextState === 'disconnected' || nextState === 'failed') {
                patchState({ status: 'reconnecting', error: 'Connection unstable, trying to recover...' });
            }
        };

        peerRef.current = peer;
        return peer;
    }, [patchState]);

    const createAndSendOfferInternal = useCallback(async () => {
        const peer = peerRef.current;
        const connection = connectionRef.current;
        const sessionId = sessionIdRef.current;
        if (!peer || !connection || !sessionId) return;

        try {
            // If we already have a local offer pending, resend it instead of creating a new one.
            if (peer.signalingState !== 'stable') {
                const pendingOffer = peer.localDescription;
                if (pendingOffer?.type === 'offer' && pendingOffer.sdp) {
                    await connection.invoke('SendOffer', {
                        sessionId,
                        sdp: pendingOffer.sdp,
                        type: 'offer',
                    });
                    patchState({ status: 'connecting', error: null });
                }
                return;
            }

            const offer = await peer.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true,
            });
            await peer.setLocalDescription(offer);
            await connection.invoke('SendOffer', {
                sessionId,
                sdp: offer.sdp,
                type: 'offer',
            });
            patchState({ status: 'connecting', error: null });
        } catch (error) {
            patchState({ status: 'error', error: error?.message || 'Offer creation failed' });
            throw error;
        }
    }, [patchState]);

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

            connection.on('SessionParticipants', (participants) => {
                const participantList = Array.isArray(participants) ? participants : [];
                patchState({ participants: participantList });

                // If both sides are connected and we are initiator, ensure offer is available to peer.
                if (isInitiatorRef.current && peerRef.current && sessionIdRef.current) {
                    const connectedParticipants = participantList.filter((participant) =>
                        Boolean(participant?.isConnected ?? participant?.IsConnected)
                    );

                    if (connectedParticipants.length > 1) {
                        createAndSendOfferInternal().catch(() => { });
                    }
                }
            });

            connection.on('ParticipantJoined', (participantEvent) => {
                setState((prev) => {
                    const exists = prev.participants.some((participant) => participant.userId === participantEvent.userId);
                    if (exists) {
                        return prev;
                    }

                    return {
                        ...prev,
                        participants: [...prev.participants, participantEvent],
                    };
                });

                if (isInitiatorRef.current && peerRef.current && sessionIdRef.current) {
                    createAndSendOfferInternal().catch(() => { });
                }
            });

            connection.on('ParticipantLeft', (participantEvent) => {
                setState((prev) => ({
                    ...prev,
                    participants: prev.participants.filter((participant) => participant.userId !== participantEvent.userId),
                }));
            });

            connection.on('IncomingCall', (payload) => {
                patchState({ incomingCall: payload, status: 'ringing', error: null });
            });

            connection.on('CallRinging', () => {
                patchState({ status: 'ringing', error: null });
            });

            connection.on('IncomingCallDeclined', (payload) => {
                if (payload?.sessionId && sessionIdRef.current && String(payload.sessionId) !== String(sessionIdRef.current)) {
                    return;
                }

                patchState({
                    status: 'ended',
                    error: 'The other participant declined the call.',
                });
            });

            connection.on('ReceiveOffer', async (offer) => {
                if (!peerRef.current) createPeer();
                try {
                    if (peerRef.current.signalingState !== 'stable') {
                        await peerRef.current.setLocalDescription({ type: 'rollback' });
                    }

                    await peerRef.current.setRemoteDescription({ type: 'offer', sdp: offer.sdp });
                    hasRemoteDescriptionRef.current = true;
                    await drainPendingCandidates();

                    const answer = await peerRef.current.createAnswer();
                    await peerRef.current.setLocalDescription(answer);

                    await connection.invoke('SendAnswer', {
                        sessionId: offer.sessionId,
                        sdp: answer.sdp,
                        type: 'answer',
                    });

                    patchState({ status: 'connecting', error: null });
                } catch (error) {
                    patchState({ status: 'error', error: error?.message || 'Offer handling failed' });
                }
            });

            connection.on('ReceiveAnswer', async (answer) => {
                if (!peerRef.current) return;
                try {
                    await peerRef.current.setRemoteDescription({ type: 'answer', sdp: answer.sdp });
                    hasRemoteDescriptionRef.current = true;
                    await drainPendingCandidates();
                    patchState({ status: 'connecting', error: null });
                } catch (error) {
                    patchState({ status: 'error', error: error?.message || 'Answer handling failed' });
                }
            });

            connection.on('ReceiveIceCandidate', async (candidatePayload) => {
                if (!peerRef.current) return;

                const candidate = {
                    candidate: candidatePayload.candidate,
                    sdpMid: candidatePayload.sdpMid,
                    sdpMLineIndex: candidatePayload.sdpMLineIndex,
                };

                try {
                    if (hasRemoteDescriptionRef.current) {
                        await peerRef.current.addIceCandidate(candidate);
                    } else {
                        pendingCandidatesRef.current.push(candidate);
                    }
                } catch (error) {
                    console.error('ICE add failed', error);
                }
            });

            connection.on('MediaStateChanged', (payload) => {
                setState((prev) => ({
                    ...prev,
                    remoteMedia: {
                        videoEnabled:
                            payload?.videoEnabled == null ? prev.remoteMedia.videoEnabled : Boolean(payload.videoEnabled),
                        audioEnabled:
                            payload?.audioEnabled == null ? prev.remoteMedia.audioEnabled : Boolean(payload.audioEnabled),
                    },
                }));
            });

            connection.on('ConnectionQualityUpdate', (quality) => {
                setState((prev) => ({
                    ...prev,
                    connectionQuality: {
                        ...prev.connectionQuality,
                        remote: quality?.quality || prev.connectionQuality.remote,
                    },
                }));
            });

            connection.on('CallEnded', (info) => {
                patchState({
                    status: 'ended',
                    durationSeconds: info?.durationSeconds ?? 0,
                });
            });

            connection.on('RedirectTo', (redirect) => {
                patchState({ redirect });
            });

            connection.onreconnecting(() => {
                patchState({ status: 'reconnecting', error: null });
            });

            connection.onreconnected(async () => {
                patchState({ status: 'connecting', error: null });
                if (sessionIdRef.current) {
                    try {
                        await connection.invoke('JoinSession', sessionIdRef.current);
                    } catch (error) {
                        console.error('Rejoin session after reconnect failed', error);
                    }
                }
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
            .catch((error) => {
                throw error;
            })
            .finally(() => {
                startPromiseRef.current = null;
            });

        await startPromiseRef.current;
        return connectionRef.current;
    }, [createAndSendOfferInternal, createPeer, drainPendingCandidates, patchState]);

    const getLocalMedia = useCallback(async () => {
        try {
            if (!navigator?.mediaDevices?.getUserMedia) {
                throw new Error(getUnsupportedMediaMessage());
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });

            localStreamRef.current = stream;
            setLocalStream(stream);

            if (!peerRef.current) {
                createPeer();
            }

            stream.getTracks().forEach((track) => {
                peerRef.current.addTrack(track, stream);
            });

            return stream;
        } catch (error) {
            const userMessage = mapMediaError(error);
            patchState({ status: 'error', error: userMessage });
            throw new Error(userMessage);
        }
    }, [createPeer, patchState]);

    const cleanupMedia = useCallback(() => {
        if (peerRef.current) {
            peerRef.current.close();
            peerRef.current = null;
        }

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => track.stop());
            localStreamRef.current = null;
        }

        setLocalStream(null);
        setRemoteStream(null);

        pendingCandidatesRef.current = [];
        hasRemoteDescriptionRef.current = false;
        isInitiatorRef.current = false;
        sessionIdRef.current = null;
    }, []);

    const startCall = useCallback(
        async ({ appointmentId, asInitiator = false }) => {
            try {
                patchState({ status: 'joining', appointmentId, error: null });

                const joinResponse = await joinVideoCall(appointmentId);
                const payload = joinResponse?.data ?? joinResponse;
                const joinSucceeded = payload?.success ?? payload?.Success;

                if (joinSucceeded === false) {
                    throw new Error(payload?.message ?? payload?.Message ?? 'Call is not available right now');
                }

                const sessionId = toSessionId(payload?.sessionId ?? payload?.SessionId);

                if (!sessionId) {
                    throw new Error(payload?.message ?? payload?.Message ?? 'No valid session id returned');
                }

                sessionIdRef.current = sessionId;
                isInitiatorRef.current = Boolean(asInitiator);
                patchState({ sessionId });

                const connection = await ensureConnection();

                if (!peerRef.current) {
                    createPeer();
                }

                await getLocalMedia();
                await connection.invoke('JoinSession', sessionId);

                if (asInitiator) {
                    await connection.invoke('NotifyIncomingCall', {
                        appointmentId,
                        sessionId,
                    });

                    await createAndSendOfferInternal();
                } else {
                    patchState({ status: 'connecting' });
                }
            } catch (error) {
                patchState({
                    status: 'error',
                    error: mapApiError(error, 'Unable to start video call right now'),
                });
                throw error;
            }
        },
        [createAndSendOfferInternal, createPeer, ensureConnection, getLocalMedia, patchState]
    );

    const acceptIncoming = useCallback(
        async (incoming) => {
            const appointmentId =
                typeof incoming === 'object'
                    ? Number(incoming?.appointmentId)
                    : Number(incoming);

            if (!appointmentId) {
                throw new Error('Incoming appointment id is required');
            }

            clearIncomingCall();
            await startCall({ appointmentId, asInitiator: false });
        },
        [clearIncomingCall, startCall]
    );

    const declineIncoming = useCallback(async () => {
        const connection = connectionRef.current;
        const incoming = state.incomingCall;

        if (!incoming) {
            return;
        }

        try {
            if (connection?.state === HubConnectionState.Connected) {
                await connection.invoke('DeclineIncomingCall', {
                    appointmentId: incoming.appointmentId,
                    sessionId: incoming.sessionId,
                    callerUserId: incoming.callerUserId,
                });
            }
        } catch (error) {
            console.error('Decline incoming call failed', error);
        } finally {
            clearIncomingCall();
            patchState({ status: 'idle' });
        }
    }, [clearIncomingCall, patchState, state.incomingCall]);

    const endCall = useCallback(async () => {
        const connection = connectionRef.current;
        const sessionId = sessionIdRef.current;

        try {
            if (connection?.state === HubConnectionState.Connected && sessionId) {
                await connection.invoke('EndCall', {
                    sessionId,
                    reason: 'User ended call',
                });
            } else if (sessionId) {
                await endCallApi(sessionId, 'User ended call');
            }
        } catch (error) {
            console.error('End call failed', error);
        } finally {
            cleanupMedia();
            patchState({ status: 'ended', incomingCall: null });
        }
    }, [cleanupMedia, patchState]);

    const toggleVideo = useCallback(async () => {
        if (!localStreamRef.current) return;

        const next = !mediaState.video;
        localStreamRef.current.getVideoTracks().forEach((track) => {
            track.enabled = next;
        });

        setMediaState((prev) => ({ ...prev, video: next }));

        const connection = connectionRef.current;
        const sessionId = sessionIdRef.current;
        if (connection?.state === HubConnectionState.Connected && sessionId) {
            try {
                await connection.invoke('ToggleVideo', sessionId, next);
            } catch (error) {
                console.error('ToggleVideo failed', error);
            }
        }
    }, [mediaState.video]);

    const toggleAudio = useCallback(async () => {
        if (!localStreamRef.current) return;

        const next = !mediaState.audio;
        localStreamRef.current.getAudioTracks().forEach((track) => {
            track.enabled = next;
        });

        setMediaState((prev) => ({ ...prev, audio: next }));

        const connection = connectionRef.current;
        const sessionId = sessionIdRef.current;
        if (connection?.state === HubConnectionState.Connected && sessionId) {
            try {
                await connection.invoke('ToggleAudio', sessionId, next);
            } catch (error) {
                console.error('ToggleAudio failed', error);
            }
        }
    }, [mediaState.audio]);

    useEffect(() => {
        const intervalId = window.setInterval(async () => {
            const peer = peerRef.current;
            const connection = connectionRef.current;
            const sessionId = sessionIdRef.current;

            if (!peer || !sessionId || connection?.state !== HubConnectionState.Connected) {
                return;
            }

            try {
                const stats = await peer.getStats();

                let latencyMs = null;
                let jitterMs = 0;
                let packetLossPercent = 0;
                let bitrate = 0;

                stats.forEach((report) => {
                    if (report.type === 'candidate-pair' && report.state === 'succeeded' && report.currentRoundTripTime != null) {
                        latencyMs = Math.round(report.currentRoundTripTime * 1000);
                    }

                    if (report.type === 'inbound-rtp' && !report.isRemote) {
                        if (typeof report.jitter === 'number') {
                            jitterMs = Math.max(jitterMs, Math.round(report.jitter * 1000));
                        }

                        if (typeof report.packetsLost === 'number' && typeof report.packetsReceived === 'number') {
                            const totalPackets = report.packetsLost + report.packetsReceived;
                            if (totalPackets > 0) {
                                packetLossPercent = Math.max(
                                    packetLossPercent,
                                    Math.round((report.packetsLost / totalPackets) * 100)
                                );
                            }
                        }

                        if (typeof report.bytesReceived === 'number' && typeof report.timestamp === 'number') {
                            bitrate = Math.max(bitrate, report.bytesReceived);
                        }
                    }
                });

                const normalizedLatency = latencyMs ?? 0;
                const quality = qualityFromLatency(normalizedLatency);

                setState((prev) => ({
                    ...prev,
                    connectionQuality: {
                        ...prev.connectionQuality,
                        local: quality,
                        latencyMs: normalizedLatency,
                    },
                }));

                await connection.invoke('ReportConnectionQuality', {
                    sessionId,
                    latencyMs: normalizedLatency,
                    jitterMs,
                    packetLossPercent,
                    bitrate,
                    quality,
                });
            } catch (error) {
                console.error('Connection quality reporting failed', error);
            }
        }, 5000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, []);

    useEffect(() => {
        return () => {
            cleanupMedia();
            if (connectionRef.current && connectionRef.current.state !== HubConnectionState.Disconnected) {
                connectionRef.current.stop().catch(() => { });
            }
            connectionRef.current = null;
            startPromiseRef.current = null;
        };
    }, [cleanupMedia]);

    return {
        state,
        localStream,
        remoteStream,
        mediaState,
        startCall,
        acceptIncoming,
        declineIncoming,
        endCall,
        toggleVideo,
        toggleAudio,
    };
}
