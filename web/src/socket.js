import { io } from 'socket.io-client';
import { getToken } from './api.js';

let socket = null;

export function getSocket() {
  if (!socket) {
    const url = import.meta.env.DEV ? 'http://localhost:4100' : undefined;
    socket = io(url, { auth: { token: getToken() }, autoConnect: true });
  }
  return socket;
}

export function resetSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
