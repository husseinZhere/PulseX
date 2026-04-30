import { HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { API_BASE_URL, getToken } from '../utils/api';

const CHAT_HUB_URL = `${API_BASE_URL}/hubs/chat`;

let chatConnection = null;
let startPromise = null;
const joinedConversations = new Set();

const rejoinTrackedConversations = async (connection) => {
    if (!connection || connection.state !== HubConnectionState.Connected) {
        return;
    }

    const ids = Array.from(joinedConversations);
    if (!ids.length) {
        return;
    }

    await Promise.all(
        ids.map((appointmentId) =>
            connection.invoke('JoinConversation', Number(appointmentId)).catch(() => { })
        )
    );
};

const createConnection = () => {
    const connection = new HubConnectionBuilder()
        .withUrl(CHAT_HUB_URL, {
            accessTokenFactory: () => getToken() || '',
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Warning)
        .build();

    connection.onreconnected(async () => {
        await rejoinTrackedConversations(connection);
    });

    return connection;
};

export const ensureChatConnection = async () => {
    if (chatConnection?.state === HubConnectionState.Connected) {
        return chatConnection;
    }

    if (!chatConnection || chatConnection.state === HubConnectionState.Disconnected) {
        chatConnection = createConnection();
    }

    if (startPromise) {
        await startPromise;
        return chatConnection;
    }

    if (chatConnection.state === HubConnectionState.Connected) {
        return chatConnection;
    }

    startPromise = chatConnection
        .start()
        .then(async () => {
            await rejoinTrackedConversations(chatConnection);
        })
        .catch((error) => {
            chatConnection = null;
            throw error;
        })
        .finally(() => {
            startPromise = null;
        });

    await startPromise;
    return chatConnection;
};

export const onChatEvent = (eventName, handler) => {
    if (!chatConnection) {
        return () => { };
    }

    chatConnection.on(eventName, handler);

    return () => {
        chatConnection?.off(eventName, handler);
    };
};

export const joinConversation = async (appointmentId) => {
    if (!appointmentId) return;

    const normalizedAppointmentId = Number(appointmentId);
    joinedConversations.add(normalizedAppointmentId);

    const connection = await ensureChatConnection();

    try {
        await connection.invoke('JoinConversation', normalizedAppointmentId);
    } catch (error) {
        // If join races with reconnect/start, retry once after ensuring connection.
        const recoveredConnection = await ensureChatConnection();
        await recoveredConnection.invoke('JoinConversation', normalizedAppointmentId);
    }
};

export const leaveConversation = async (appointmentId) => {
    if (!appointmentId || !chatConnection || chatConnection.state !== HubConnectionState.Connected) {
        joinedConversations.delete(Number(appointmentId));
        return;
    }

    joinedConversations.delete(Number(appointmentId));
    await chatConnection.invoke('LeaveConversation', Number(appointmentId));
};

export const getOnlineUsers = async () => {
    const connection = await ensureChatConnection();
    const users = await connection.invoke('GetOnlineUsers');
    return Array.isArray(users) ? users.map((id) => Number(id)) : [];
};

export const isUserOnline = async (userId) => {
    if (!userId) return false;

    const connection = await ensureChatConnection();
    return Boolean(await connection.invoke('IsUserOnline', Number(userId)));
};

export const stopChatConnection = async () => {
    if (!chatConnection) {
        joinedConversations.clear();
        return;
    }

    const connectionToStop = chatConnection;
    chatConnection = null;
    startPromise = null;

    if (connectionToStop.state !== HubConnectionState.Disconnected) {
        await connectionToStop.stop();
    }

    joinedConversations.clear();
};
