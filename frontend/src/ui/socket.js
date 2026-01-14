import { io } from 'socket.io-client';

let socket;

export function createSocket() {
  if (socket) return socket;

  const base = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
  socket = io(base, {
    withCredentials: true,
    autoConnect: true,
  });

  return socket;
}
