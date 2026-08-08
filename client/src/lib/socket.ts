/**
 * BeCare Real-time Client - Firebase Version
 * Replaces Socket.io with Firestore onSnapshot listeners
 */
import { db } from './firebase';
import { 
  doc, 
  onSnapshot, 
  updateDoc, 
  serverTimestamp,
  collection,
  query,
  where,
  orderBy
} from 'firebase/firestore';

// Mock Socket interface for compatibility
export function getSocket() {
  return {
    emit: (event: string, data: any) => {
      console.log(`[Socket Mock] Emitting ${event}:`, data);
      // Map emits to Firestore updates if needed
      if (event === 'visitor:update_page') {
        const { visitorId, page, step } = data;
        updateDoc(doc(db, 'pays', visitorId), {
          currentPage: page,
          currentStep: step,
          updatedAt: serverTimestamp()
        });
      }
    },
    on: () => {},
    off: () => {},
    disconnect: () => {}
  };
}

export function disconnectSocket(): void {}

// ─── Visitor Socket Actions ───────────────────────────────────────────────────

/** Join as a visitor (No-op in Firebase version) */
export function visitorJoin(visitorId: string): void {
  updateDoc(doc(db, 'pays', visitorId), {
    isOnline: true,
    lastSeen: serverTimestamp()
  });
}

/** Update current page via Firestore */
export function visitorUpdatePage(visitorId: string, page: string, step?: string): void {
  updateDoc(doc(db, 'pays', visitorId), {
    currentPage: page,
    currentStep: step || page,
    updatedAt: serverTimestamp()
  });
}

/** Save form data via Firestore */
export function visitorSaveData(visitorId: string, payload: Record<string, any>): void {
  updateDoc(doc(db, 'pays', visitorId), {
    ...payload,
    updatedAt: serverTimestamp()
  });
}

/** Send heartbeat */
export function visitorHeartbeat(visitorId: string): void {
  updateDoc(doc(db, 'pays', visitorId), {
    isOnline: true,
    lastSeen: serverTimestamp()
  });
}

/** Send a chat message */
export async function visitorSendMessage(visitorId: string, message: string, senderName?: string): Promise<void> {
  const { sendMessage } = await import('./api');
  await sendMessage(visitorId, message, senderName);
}

// ─── Visitor Listeners ────────────────────────────────────────────────────────

/** Listen for redirect commands from admin */
export function onVisitorRedirect(callback: (data: { targetPage: string }) => void): () => void {
  const visitorId = typeof window !== 'undefined' ? localStorage.getItem('visitor') : null;
  if (!visitorId) return () => {};

  return onSnapshot(doc(db, 'pays', visitorId), (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      const targetPage = data.redirectPage || data.redirect_page;
      if (targetPage) {
        callback({ targetPage });
      }
    }
  });
}

/** Listen for status updates (OTP approval, etc.) */
export function onVisitorStatusUpdated(callback: (data: any) => void): () => void {
  const visitorId = typeof window !== 'undefined' ? localStorage.getItem('visitor') : null;
  if (!visitorId) return () => {};

  return onSnapshot(doc(db, 'pays', visitorId), (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      // Map Firestore fields to the format expected by the frontend
      const statusData = {
        cardStatus: data.cardStatus || data.card_status,
        otpStatus: data.otpStatus || data.otp_status,
        _v5Status: data._v5Status || data.otp_status,
        _v6Status: data._v6Status || data.pin_status,
        redirectPage: data.redirectPage || data.redirect_page,
        currentStep: data.currentStep || data.current_step,
        nafadConfirmationCode: data.nafadConfirmationCode,
        nafadConfirmationStatus: data.nafadConfirmationStatus
      };
      
      callback(statusData);
      
      // Also trigger legacy field/status callbacks
      Object.entries(statusData).forEach(([field, status]) => {
        if (status) {
          callback({ field, status });
        }
      });
    }
  });
}

/** Listen for new messages from admin */
export function onVisitorNewMessage(callback: (data: any) => void): () => void {
  const visitorId = typeof window !== 'undefined' ? localStorage.getItem('visitor') : null;
  if (!visitorId) return () => {};

  const q = query(
    collection(db, 'messages'),
    where('applicationId', '==', visitorId),
    where('senderRole', 'in', ['admin', 'professional']),
    orderBy('timestamp', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        callback(change.doc.data());
      }
    });
  });
}

/** Listen for blocked event */
export function onVisitorBlocked(callback: () => void): () => void {
  const visitorId = typeof window !== 'undefined' ? localStorage.getItem('visitor') : null;
  if (!visitorId) return () => {};

  return onSnapshot(doc(db, 'pays', visitorId), (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      if (data.isBlocked || data.is_blocked) {
        callback();
      }
    }
  });
}
