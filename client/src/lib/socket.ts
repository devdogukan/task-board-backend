import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { STORAGE_KEYS } from './constants';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

let socket: Socket | null = null;

export type { Socket };

export const getSocket = (): Socket | null => {
  if (!socket) {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    
    socket = io(SOCKET_URL, {
      auth: {
        token: token || undefined,
      },
      withCredentials: true,
      autoConnect: false,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  return socket;
};

export const connectSocket = (): Socket | null => {
  const socketInstance = getSocket();
  if (socketInstance && !socketInstance.connected) {
    socketInstance.connect();
  }
  return socketInstance;
};

export const disconnectSocket = (): void => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};

export const resetSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

