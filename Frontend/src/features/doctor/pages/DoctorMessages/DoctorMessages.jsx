import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DoctorRatingModal from '../../components/DoctorRatingModal/DoctorRatingModal';
import VideoCallContainer from '../../components/VideoCall/VideoCallContainer';
import ChatHeader from '../../components/Messages/ChatHeader';
import MessageInputBar from '../../components/Messages/MessageInputBar';
import MessagesList from '../../components/Messages/MessagesList';
import MessagesSidebar from '../../components/Messages/MessagesSidebar';
import { getMyAppointments } from '../../../../services/appointmentService';
import { getAppointmentMessages, sendMessage } from '../../../../services/messageService';
import {
    ensureChatConnection,
    getOnlineUsers,
    joinConversation,
    leaveConversation,
    onChatEvent,
    stopChatConnection,
} from '../../../../services/chatRealtimeService';
import { useAuth } from '../../../../context/AuthContext';
import { resolveFileUrl } from '../../../../utils/api';

const formatMessageTime = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

const mapIncomingMessage = (message, currentUserId) => {
    const id = Number(message?.id ?? message?.Id ?? Date.now());
    const senderId = Number(message?.senderId ?? message?.SenderId ?? 0);
    const appointmentId = Number(message?.appointmentId ?? message?.AppointmentId ?? 0);
    const attachmentPath = message?.attachmentPath ?? message?.AttachmentPath;
    const content = message?.content ?? message?.Content ?? '';
    const sentAt = message?.sentAt ?? message?.SentAt;
    const hasAttachment = Boolean(attachmentPath);

    return {
        id,
        appointmentId,
        from: senderId === Number(currentUserId) ? 'me' : 'doctor',
        type: hasAttachment ? 'image' : 'text',
        text: hasAttachment ? resolveFileUrl(attachmentPath) : content,
        time: formatMessageTime(sentAt),
    };
};

const DoctorMessages = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const currentUserId = Number(user?.userId ?? 0);

    const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
    const [incomingCallAutoStart, setIncomingCallAutoStart] = useState(false);

    const [patientsList, setPatientsList] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [activeAppointmentId, setActiveAppointmentId] = useState(null);
    const [search, setSearch] = useState('');
    const [input, setInput] = useState('');
    const [showEmoji, setShowEmoji] = useState(false);
    const [convos, setConvos] = useState({});
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showRating, setShowRating] = useState(false);

    const fileRef = useRef(null);
    const bottomRef = useRef(null);
    const patientsRef = useRef([]);
    const syncInFlightRef = useRef(false);
    const pendingAutoStartCallRef = useRef(false);

    useEffect(() => {
        patientsRef.current = patientsList;
    }, [patientsList]);

    const updatePatientPresence = useCallback((targetUserId, status) => {
        if (!targetUserId) return;

        setPatientsList((prev) =>
            prev.map((patient) =>
                Number(patient.userId) === Number(targetUserId)
                    ? { ...patient, status }
                    : patient
            )
        );
    }, []);

    const appendMessageToConversation = useCallback(
        (rawMessage) => {
            const appointmentId = Number(rawMessage?.appointmentId ?? rawMessage?.AppointmentId ?? 0);
            if (!appointmentId) return;

            const targetConversation = patientsRef.current.find(
                (patient) => Number(patient.appointmentId) === appointmentId
            );
            if (!targetConversation) return;

            const uiMessage = mapIncomingMessage(rawMessage, currentUserId);

            setConvos((prev) => {
                const existingMessages = prev[targetConversation.id] ?? [];
                const alreadyExists = existingMessages.some(
                    (message) => Number(message.id) === Number(uiMessage.id)
                );

                if (alreadyExists) return prev;

                return {
                    ...prev,
                    [targetConversation.id]: [...existingMessages, uiMessage],
                };
            });

            setPatientsList((prev) =>
                prev.map((patient) =>
                    patient.id === targetConversation.id
                        ? {
                            ...patient,
                            lastMsg: uiMessage.type === 'text' ? uiMessage.text : 'Attachment',
                            time: uiMessage.time || patient.time,
                        }
                        : patient
                )
            );
        },
        [currentUserId]
    );

    useEffect(() => {
        let ignore = false;

        const load = async () => {
            try {
                const list = await getMyAppointments();
                const items = Array.isArray(list) ? list : list?.items || [];
                const byPatient = {};

                items.forEach((appointment) => {
                    if (!appointment.patientId) return;

                    const existing = byPatient[appointment.patientId];
                    if (!existing || new Date(appointment.appointmentDate) > new Date(existing.appointmentDate)) {
                        byPatient[appointment.patientId] = appointment;
                    }
                });

                const patients = Object.values(byPatient).map((appointment) => ({
                    id: appointment.patientId,
                    userId: appointment.patientUserId,
                    appointmentId: appointment.id,
                    name: appointment.patientName || 'Patient',
                    specialty: appointment.status || '',
                    status: 'offline',
                    canChat: Boolean(appointment.canChat),
                    time: appointment.appointmentDate
                        ? new Date(appointment.appointmentDate).toLocaleDateString()
                        : '',
                    lastMsg: '',
                    img: resolveFileUrl(appointment.patientAvatar || ''),
                }));

                if (ignore) return;

                setPatientsList(patients);

                const initialPatientId = location.state?.patientId ?? patients[0]?.id ?? null;
                if (initialPatientId) {
                    setActiveId(initialPatientId);
                    const matchedConversation = patients.find((patient) => patient.id === initialPatientId);
                    if (matchedConversation) {
                        setActiveAppointmentId(matchedConversation.appointmentId);
                    }
                }
            } catch (error) {
                console.error('Load doctor messages failed', error);
            }
        };

        load();
        return () => {
            ignore = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const syncActiveConversation = useCallback(async () => {
        if (!activeAppointmentId || !activeId || syncInFlightRef.current) return;

        syncInFlightRef.current = true;
        try {
            const response = await getAppointmentMessages(activeAppointmentId);
            const list = Array.isArray(response) ? response : response?.messages || response?.items || [];

            const mappedMessages = list.map((message) => mapIncomingMessage(message, currentUserId));

            setConvos((prev) => ({
                ...prev,
                [activeId]: mappedMessages,
            }));

            const lastMessage = mappedMessages[mappedMessages.length - 1];
            if (lastMessage) {
                setPatientsList((prev) =>
                    prev.map((patient) =>
                        patient.id === activeId
                            ? {
                                ...patient,
                                lastMsg: lastMessage.type === 'text' ? lastMessage.text : 'Attachment',
                                time: lastMessage.time || patient.time,
                            }
                            : patient
                    )
                );
            }
        } catch (error) {
            console.error('Load messages failed', error);
        } finally {
            syncInFlightRef.current = false;
        }
    }, [activeAppointmentId, activeId, currentUserId]);

    useEffect(() => {
        if (!activeAppointmentId || !activeId) return;

        let stopped = false;
        const runSync = async () => {
            if (stopped) return;
            await syncActiveConversation();
        };

        runSync();
        const intervalId = window.setInterval(runSync, 2000);

        return () => {
            stopped = true;
            window.clearInterval(intervalId);
        };
    }, [activeAppointmentId, activeId, syncActiveConversation]);

    useEffect(() => {
        let disposed = false;
        let offReceive = () => { };
        let offOnline = () => { };
        let offOffline = () => { };

        const initializeRealtime = async () => {
            try {
                await ensureChatConnection();
                if (disposed) return;

                offReceive = onChatEvent('ReceiveMessage', (message) => {
                    appendMessageToConversation(message);
                });

                offOnline = onChatEvent('UserOnline', (payload) => {
                    const onlineUserId = payload?.userId ?? payload?.UserId;
                    updatePatientPresence(onlineUserId, 'online');
                });

                offOffline = onChatEvent('UserOffline', (payload) => {
                    const offlineUserId = payload?.userId ?? payload?.UserId;
                    updatePatientPresence(offlineUserId, 'offline');
                });
            } catch (error) {
                console.error('Doctor chat realtime connection failed', error);
            }
        };

        initializeRealtime();

        return () => {
            disposed = true;
            offReceive();
            offOnline();
            offOffline();
            stopChatConnection().catch(() => { });
        };
    }, [appendMessageToConversation, updatePatientPresence]);

    useEffect(() => {
        let ignore = false;
        if (!patientsList.length) return;

        const syncPresence = async () => {
            try {
                const onlineUsers = await getOnlineUsers();
                if (ignore) return;

                const onlineSet = new Set(onlineUsers.map((id) => Number(id)));
                setPatientsList((prev) =>
                    prev.map((patient) => ({
                        ...patient,
                        status: onlineSet.has(Number(patient.userId)) ? 'online' : 'offline',
                    }))
                );
            } catch (error) {
                console.error('Sync patient presence failed', error);
            }
        };

        syncPresence();

        return () => {
            ignore = true;
        };
    }, [patientsList.length]);

    useEffect(() => {
        if (!activeAppointmentId) return undefined;

        joinConversation(activeAppointmentId).catch((error) => {
            console.error('Join doctor conversation failed', error);
        });

        return () => {
            leaveConversation(activeAppointmentId).catch(() => { });
        };
    }, [activeAppointmentId]);

    useEffect(() => {
        document.title = 'Messages | PulseX';
        const meta = document.querySelector('meta[name="description"]');
        if (meta) {
            meta.setAttribute('content', 'Doctor messaging workspace for patient follow-up and communication.');
        }
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [convos, activeId]);

    useEffect(() => {
        const selectedPatientId = location.state?.patientId;
        const selectedAppointmentId = location.state?.appointmentId;
        const shouldAutoStart = Boolean(location.state?.autoStartCall);

        if (!selectedPatientId && !selectedAppointmentId && !shouldAutoStart) return;

        if (shouldAutoStart) {
            pendingAutoStartCallRef.current = true;
        }

        let resolvedAppointmentId = selectedAppointmentId ?? null;

        if (selectedPatientId) {
            setActiveId(selectedPatientId);
            if (!resolvedAppointmentId) {
                const matchedConversation = patientsList.find((patient) => patient.id === selectedPatientId);
                resolvedAppointmentId = matchedConversation?.appointmentId ?? null;
            }
        }

        if (resolvedAppointmentId) {
            setActiveAppointmentId(resolvedAppointmentId);
        }

        if (pendingAutoStartCallRef.current && resolvedAppointmentId) {
            setIncomingCallAutoStart(true);
            setIsVideoCallOpen(true);
            pendingAutoStartCallRef.current = false;
        }
    }, [location.state, patientsList]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            stopChatConnection().catch(() => { });
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    const patient = patientsList.find((item) => item.id === activeId);
    const canStartVideoCall = Boolean(patient?.canChat && activeAppointmentId);
    const filteredPatients = patientsList.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    const sendMsg = async (content, type = 'text', file = null) => {
        const trimmedContent = typeof content === 'string' ? content.trim() : '';
        if (type === 'text' && !trimmedContent) return;
        if (!activeAppointmentId || !patient || !patient.canChat) return;

        const previousInput = input;
        setInput('');
        setShowEmoji(false);

        try {
            const response = await sendMessage(
                {
                    receiverId: patient.id,
                    appointmentId: activeAppointmentId,
                    content: type === 'text' ? trimmedContent : '',
                },
                file
            );

            const savedMessage = response?.data ?? response;
            if (savedMessage) {
                appendMessageToConversation(savedMessage);
            }
        } catch (error) {
            console.error('Send message failed', error);
            if (type === 'text') {
                setInput(previousInput);
            }
        }
    };

    useEffect(() => {
        if (!location.state?.autoStartCall) return;

        const nextState = { ...location.state };
        delete nextState.autoStartCall;

        navigate(location.pathname, { replace: true, state: nextState });
    }, [location.pathname, location.state, navigate]);

    const pickFile = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            sendMsg('', 'image', file);
        }
        event.target.value = '';
    };

    const selectChat = (id) => {
        setActiveId(id);
        const matchedConversation = patientsList.find((item) => item.id === id);
        if (matchedConversation) {
            setActiveAppointmentId(matchedConversation.appointmentId);
        }
        setSidebarOpen(false);
    };

    return (
        <main
            className="h-[calc(100vh-120px)] min-h-[500px] bg-[#F8FAFC] dark:bg-[#0B1120] rounded-[20px]"
            style={{
                '--msg-muted': '#6B7280',
                '--msg-muted-2': '#4B5563',
                '--msg-muted-3': '#9CA3AF',
            }}
        >
            <h1 className="sr-only">Doctor Messages</h1>

            <aside aria-live="polite">
                <VideoCallContainer
                    isOpen={isVideoCallOpen}
                    onClose={() => {
                        setIsVideoCallOpen(false);
                        setIncomingCallAutoStart(false);
                    }}
                    doctor={patient}
                    appointmentId={activeAppointmentId}
                    asInitiator={!incomingCallAutoStart}
                    autoStart={incomingCallAutoStart}
                />
            </aside>

            <aside aria-live="polite">
                <DoctorRatingModal
                    isOpen={showRating}
                    onClose={() => setShowRating(false)}
                    onSubmit={(rating, feedback) => {
                        console.log('Doctor feedback submitted:', { patientId: activeId, rating, feedback });
                    }}
                    patient={{
                        name: patient?.name,
                        img: patient?.img,
                    }}
                />
            </aside>

            <div className="flex h-full overflow-hidden relative">
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.div
                            key="bd"
                            className="cursor-pointer fixed inset-0 z-20 bg-black/40 lg:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}
                </AnimatePresence>

                <MessagesSidebar
                    doctors={filteredPatients}
                    activeId={activeId}
                    search={search}
                    onSearch={setSearch}
                    onSelect={selectChat}
                    sidebarOpen={sidebarOpen}
                />

                <section
                    className="flex-1 flex flex-col min-w-0 bg-[#EEF2F7] dark:bg-[#0F172A] border border-gray-200 dark:border-gray-800 lg:border-l-0 lg:rounded-tr-3xl lg:rounded-br-3xl relative"
                    aria-label="Chat window"
                >
                    {patient ? (
                        <>
                            <ChatHeader
                                doctor={patient}
                                onOpenSidebar={() => setSidebarOpen(true)}
                                canStartVideo={canStartVideoCall}
                                onStartVideo={() => {
                                    if (canStartVideoCall) {
                                        setIncomingCallAutoStart(false);
                                        setIsVideoCallOpen(true);
                                    }
                                }}
                            />

                            <MessagesList
                                messages={convos[activeId] ?? []}
                                doctorImg={patient?.img}
                                doctorName={patient?.name}
                                bottomRef={bottomRef}
                            />

                            {patient.canChat ? (
                                <MessageInputBar
                                    input={input}
                                    onChange={setInput}
                                    onSend={sendMsg}
                                    onPickFile={pickFile}
                                    showEmoji={showEmoji}
                                    setShowEmoji={setShowEmoji}
                                    fileRef={fileRef}
                                />
                            ) : (
                                <div className="px-6 py-4 bg-white dark:bg-[#111827] border-t border-gray-200 dark:border-gray-700 text-center text-[13px] text-gray-500 dark:text-gray-400">
                                    Chat is not active yet for this appointment window.
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8 text-center">
                            <div className="w-20 h-20 rounded-full bg-[#EEF2FF] dark:bg-[#1E293B] flex items-center justify-center shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none">
                                    <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#333CF5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-[18px] font-semibold text-black-main-text dark:text-[#E2E8F0] mb-2">
                                    {patientsList.length === 0 ? 'No Active Chats Yet' : 'Select a Conversation'}
                                </h3>
                                <p className="text-[14px] text-gray-500 dark:text-gray-400 max-w-[300px] leading-relaxed">
                                    {patientsList.length === 0
                                        ? 'No patient appointments yet. Chats open automatically once a patient books an appointment with you.'
                                        : 'Choose a patient from the left panel to open the conversation.'}
                                </p>
                            </div>
                        </div>
                    )}
                </section>
            </div>

            <footer className="sr-only">
                <p>End of doctor messages page.</p>
            </footer>
        </main>
    );
};

export default DoctorMessages;
