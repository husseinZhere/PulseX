import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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

const PatientMessages = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const currentUserId = Number(user?.userId ?? 0);

    const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
    const [incomingCallAutoStart, setIncomingCallAutoStart] = useState(false);

    const [doctorsList, setDoctorsList] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [activeAppointmentId, setActiveAppointmentId] = useState(null);
    const [search, setSearch] = useState('');
    const [input, setInput] = useState('');
    const [showEmoji, setShowEmoji] = useState(false);
    const [convos, setConvos] = useState({});
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const fileRef = useRef(null);
    const bottomRef = useRef(null);
    const doctorsRef = useRef([]);
    const syncInFlightRef = useRef(false);
    const pendingAutoStartCallRef = useRef(false);

    useEffect(() => {
        doctorsRef.current = doctorsList;
    }, [doctorsList]);

    const updateDoctorPresence = useCallback((targetUserId, status) => {
        if (!targetUserId) return;

        setDoctorsList((prev) =>
            prev.map((doctor) =>
                Number(doctor.userId) === Number(targetUserId)
                    ? { ...doctor, status }
                    : doctor
            )
        );
    }, []);

    const appendMessageToConversation = useCallback(
        (rawMessage) => {
            const appointmentId = Number(rawMessage?.appointmentId ?? rawMessage?.AppointmentId ?? 0);
            if (!appointmentId) return;

            const targetConversation = doctorsRef.current.find(
                (doctor) => Number(doctor.appointmentId) === appointmentId
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

            setDoctorsList((prev) =>
                prev.map((doctor) =>
                    doctor.id === targetConversation.id
                        ? {
                            ...doctor,
                            lastMsg: uiMessage.type === 'text' ? uiMessage.text : 'Attachment',
                            time: uiMessage.time || doctor.time,
                        }
                        : doctor
                )
            );
        },
        [currentUserId]
    );

    useEffect(() => {
        let ignore = false;

        const loadAppointments = async () => {
            try {
                const list = await getMyAppointments();
                const items = Array.isArray(list) ? list : list?.items || [];
                const byDoctor = {};

                items.forEach((appointment) => {
                    if (!appointment.doctorId) return;

                    const existing = byDoctor[appointment.doctorId];
                    if (!existing || new Date(appointment.appointmentDate) > new Date(existing.appointmentDate)) {
                        byDoctor[appointment.doctorId] = appointment;
                    }
                });

                const doctors = Object.values(byDoctor).map((appointment) => ({
                    id: appointment.doctorId,
                    userId: appointment.doctorUserId,
                    appointmentId: appointment.id,
                    name: appointment.doctorName || 'Doctor',
                    specialty: appointment.specialization || '',
                    status: 'offline',
                    canChat: Boolean(appointment.canChat),
                    time: appointment.appointmentDate
                        ? new Date(appointment.appointmentDate).toLocaleDateString()
                        : '',
                    lastMsg: '',
                    img: resolveFileUrl(appointment.doctorAvatar || ''),
                }));

                if (ignore) return;

                setDoctorsList(doctors);

                const initialDoctorId = location.state?.doctorId ?? doctors[0]?.id ?? null;
                if (initialDoctorId) {
                    setActiveId(initialDoctorId);
                    const matchedConversation = doctors.find((doctor) => doctor.id === initialDoctorId);
                    if (matchedConversation) {
                        setActiveAppointmentId(matchedConversation.appointmentId);
                    }
                }
            } catch (error) {
                console.error('Load appointments failed', error);
            }
        };

        loadAppointments();

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
                setDoctorsList((prev) =>
                    prev.map((doctor) =>
                        doctor.id === activeId
                            ? {
                                ...doctor,
                                lastMsg: lastMessage.type === 'text' ? lastMessage.text : 'Attachment',
                                time: lastMessage.time || doctor.time,
                            }
                            : doctor
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
                    updateDoctorPresence(onlineUserId, 'online');
                });

                offOffline = onChatEvent('UserOffline', (payload) => {
                    const offlineUserId = payload?.userId ?? payload?.UserId;
                    updateDoctorPresence(offlineUserId, 'offline');
                });
            } catch (error) {
                console.error('Patient chat realtime connection failed', error);
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
    }, [appendMessageToConversation, updateDoctorPresence]);

    useEffect(() => {
        let ignore = false;
        if (!doctorsList.length) return;

        const syncPresence = async () => {
            try {
                const onlineUsers = await getOnlineUsers();
                if (ignore) return;

                const onlineSet = new Set(onlineUsers.map((id) => Number(id)));
                setDoctorsList((prev) =>
                    prev.map((doctor) => ({
                        ...doctor,
                        status: onlineSet.has(Number(doctor.userId)) ? 'online' : 'offline',
                    }))
                );
            } catch (error) {
                console.error('Sync doctor presence failed', error);
            }
        };

        syncPresence();

        return () => {
            ignore = true;
        };
    }, [doctorsList.length]);

    useEffect(() => {
        if (!activeAppointmentId) return undefined;

        joinConversation(activeAppointmentId).catch((error) => {
            console.error('Join patient conversation failed', error);
        });

        return () => {
            leaveConversation(activeAppointmentId).catch(() => { });
        };
    }, [activeAppointmentId]);

    useEffect(() => {
        document.title = 'Messages | PulseX';
        const meta = document.querySelector('meta[name="description"]');
        if (meta) {
            meta.setAttribute('content', 'Chat with your doctors and review messages.');
        }
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [convos, activeId]);

    useEffect(() => {
        const selectedDoctorId = location.state?.doctorId;
        const selectedAppointmentId = location.state?.appointmentId;
        const shouldAutoStart = Boolean(location.state?.autoStartCall);

        if (!selectedDoctorId && !selectedAppointmentId && !shouldAutoStart) return;

        if (shouldAutoStart) {
            pendingAutoStartCallRef.current = true;
        }

        let resolvedAppointmentId = selectedAppointmentId ?? null;

        if (selectedDoctorId) {
            setActiveId(selectedDoctorId);
            if (!resolvedAppointmentId) {
                const matchedConversation = doctorsList.find((doctor) => doctor.id === selectedDoctorId);
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
    }, [location.state, doctorsList]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            stopChatConnection().catch(() => { });
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    const doctor = doctorsList.find((item) => item.id === activeId);
    // Video call must follow the same gate as the chat window — if the
    // chat is closed (no active appointment window), ringing the doctor
    // would be a privacy/permissions leak.
    const canStartVideoCall = Boolean(activeAppointmentId) && Boolean(doctor?.canChat);
    const filteredDoctors = doctorsList.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    const sendMsg = async (content, type = 'text', file = null) => {
        const trimmedContent = typeof content === 'string' ? content.trim() : '';
        if (type === 'text' && !trimmedContent) return;
        if (!activeAppointmentId || !doctor || !doctor.canChat) return;

        const previousInput = input;
        setInput('');
        setShowEmoji(false);

        try {
            const response = await sendMessage(
                {
                    receiverId: doctor.id,
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
        const matchedConversation = doctorsList.find((doctorItem) => doctorItem.id === id);
        if (matchedConversation) {
            setActiveAppointmentId(matchedConversation.appointmentId);
        }
        setSidebarOpen(false);
    };

    return (
        <main className="h-[calc(100vh-120px)] min-h-[500px] bg-[#F8FAFC] dark:bg-[#0B1120] rounded-[20px]">
            <h1 className="sr-only">Messages</h1>

            <aside aria-live="polite">
                <VideoCallContainer
                    isOpen={isVideoCallOpen}
                    onClose={() => {
                        setIsVideoCallOpen(false);
                        setIncomingCallAutoStart(false);
                    }}
                    doctor={doctor}
                    appointmentId={activeAppointmentId}
                    asInitiator={!incomingCallAutoStart}
                    autoStart={incomingCallAutoStart}
                />
            </aside>

            <div className="flex h-full overflow-hidden relative">
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.div
                            key="bd"
                            className="fixed inset-0 z-20 bg-black/40 lg:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}
                </AnimatePresence>

                <MessagesSidebar
                    doctors={filteredDoctors}
                    activeId={activeId}
                    search={search}
                    onSearch={setSearch}
                    onSelect={selectChat}
                    sidebarOpen={sidebarOpen}
                />

                <section className="flex-1 flex flex-col min-w-0 bg-[#EEF2F7] dark:bg-[#0F172A] border border-gray-200 dark:border-gray-800 lg:border-l-0 lg:rounded-tr-3xl lg:rounded-br-3xl relative" aria-label="Chat window">
                    {doctor ? (
                        <>
                            <ChatHeader
                                doctor={doctor}
                                onOpenSidebar={() => setSidebarOpen(true)}
                                canStartVideo={canStartVideoCall}
                                onStartVideo={() => {
                                    if (!canStartVideoCall) return;
                                    setIncomingCallAutoStart(false);
                                    setIsVideoCallOpen(true);
                                    // Fallback: send Jitsi link as chat message for other party not on hub
                                    const jitsiUrl = `https://jitsi.member.fsf.org/PulseXAppt${activeAppointmentId}`;
                                    sendMsg(`📹 Video call invitation – Join the meeting: ${jitsiUrl}`);
                                }}
                            />
                            <MessagesList
                                messages={convos[activeId] ?? []}
                                doctorImg={doctor?.img}
                                doctorName={doctor?.name}
                                bottomRef={bottomRef}
                            />
                            {doctor.canChat ? (
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
                                    Chat is not active yet. It opens during the valid appointment chat window.
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
                                    {doctorsList.length === 0 ? 'No Active Chats Yet' : 'Select a Conversation'}
                                </h3>
                                <p className="text-[14px] text-gray-500 dark:text-gray-400 max-w-[280px] leading-relaxed">
                                    {doctorsList.length === 0
                                        ? 'You need an appointment with a doctor before you can chat. Book one from the Doctor List.'
                                        : 'Choose a doctor from the left panel to open the conversation.'}
                                </p>
                            </div>
                        </div>
                    )}
                </section>
            </div>

            <footer className="sr-only">
                <p>End of messages page.</p>
            </footer>
        </main>
    );
};

export default PatientMessages;
