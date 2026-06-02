import { io, Socket } from 'socket.io-client';
import { AUTH_TOKEN_STORAGE_KEY } from './api';
import type { ChatMessage } from './chat.service';
import type { Notification } from './notifications.service';

type RealtimeEvents = {
  'notification:new': Notification;
  'chat:new-message': ChatMessage;
};

let socket: Socket | null = null;
let socketToken: string | null = null;

function getRealtimeUrl() {
  return import.meta.env.VITE_WS_URL ?? (import.meta.env.VITE_API_URL ?? 'http://localhost:3333/api').replace(/\/api$/, '');
}

export const realtimeService = {
  connect() {
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

    if (!token) {
      return null;
    }

    if (socket && socketToken === token) {
      return socket;
    }

    socket?.disconnect();
    socketToken = token;
    socket = io(getRealtimeUrl(), {
      auth: { token },
      transports: ['websocket'],
    });

    return socket;
  },

  on<TEvent extends keyof RealtimeEvents>(
    event: TEvent,
    handler: (payload: RealtimeEvents[TEvent]) => void,
  ) {
    const activeSocket = this.connect();
    activeSocket?.on(event, handler);

    return () => {
      activeSocket?.off(event, handler);
    };
  },

  disconnect() {
    socket?.disconnect();
    socket = null;
    socketToken = null;
  },
};
