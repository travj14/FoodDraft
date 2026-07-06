import { io } from 'socket.io-client';
import { getToken, BASE } from './api.js';

let socket = null;

export function getSocket() {
  if (!socket) {
    if (import.meta.env.DEV) {
      // dev: talk to the backend directly on :4100
      socket = io('http://localhost:4100', { auth: { token: getToken() }, autoConnect: true });
    } else {
      // prod: same origin; prefix the socket path when served under /fooddraft
      socket = io({ path: (BASE || '') + '/socket.io', auth: { token: getToken() }, autoConnect: true });
    }
  }
  return socket;
}

export function resetSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
