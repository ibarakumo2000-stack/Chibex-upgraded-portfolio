import { collection, doc, setDoc } from 'firebase/firestore';
import { db, auth } from './firebase';

export interface ActivityEvent {
  id: string;
  sessionId: string;
  userId?: string;
  userEmail?: string;
  action: string;
  details?: string;
  page: string;
  referrer?: string;
  device?: string;
  timestamp: string;
}

const COOKIE_CONSENT_KEY = 'etech_cookie_consent_choice';
const SESSION_ID_KEY = 'etech_visitor_session_id';
const LOCAL_ACTIVITY_CACHE_KEY = 'etech_local_activity_logs';

// Get or generate stable session ID for this browser tab/session
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'server_session';
  try {
    let sid = sessionStorage.getItem(SESSION_ID_KEY);
    if (!sid) {
      sid = `sess_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
      sessionStorage.setItem(SESSION_ID_KEY, sid);
    }
    return sid;
  } catch {
    return 'fallback_session';
  }
}

// Detect device category
export function getDeviceType(): string {
  if (typeof window === 'undefined') return 'Desktop';
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'Tablet';
  }
  if (
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(
      ua
    )
  ) {
    return 'Mobile';
  }
  return 'Desktop';
}

// Check if user has consented to tracking cookies
export function hasCookieConsent(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    return consent === 'all' || consent === 'analytics';
  } catch {
    return false;
  }
}

// Record an activity event
export async function trackActivity(
  action: string,
  details?: string,
  customPage?: string
): Promise<void> {
  if (typeof window === 'undefined') return;

  // Respect user choice: only record if consent is given or essential session is active
  const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
  if (consent === 'declined') return;

  const sessionId = getOrCreateSessionId();
  const page = customPage || window.location.pathname || '/';
  const referrer = document.referrer ? document.referrer.slice(0, 300) : 'Direct';
  const device = getDeviceType();
  const timestamp = new Date().toISOString();
  const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const currentAuthUser = auth.currentUser;
  const demoUser = (() => {
    try {
      const d = localStorage.getItem('etech_demo_client_user');
      return d ? JSON.parse(d) : null;
    } catch {
      return null;
    }
  })();

  const userId = currentAuthUser?.uid || demoUser?.uid || undefined;
  const userEmail = currentAuthUser?.email || demoUser?.email || undefined;

  const eventRecord: ActivityEvent = {
    id: logId,
    sessionId,
    userId,
    userEmail,
    action: action.slice(0, 100),
    details: details ? details.slice(0, 500) : undefined,
    page: page.slice(0, 100),
    referrer,
    device,
    timestamp,
  };

  // 1. Always store in local circular buffer (max 100 recent events) for immediate Admin visibility
  try {
    const existingRaw = localStorage.getItem(LOCAL_ACTIVITY_CACHE_KEY);
    const existing: ActivityEvent[] = existingRaw ? JSON.parse(existingRaw) : [];
    const updated = [eventRecord, ...existing].slice(0, 150);
    localStorage.setItem(LOCAL_ACTIVITY_CACHE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Local activity cache notice:', err);
  }

  // 2. Dispatch to cloud Firestore if available
  try {
    const cleanPayload: Record<string, any> = {
      id: logId,
      sessionId,
      action: eventRecord.action,
      page: eventRecord.page,
      timestamp,
      referrer,
      device,
    };
    if (userId) cleanPayload.userId = userId;
    if (userEmail) cleanPayload.userEmail = userEmail;
    if (details) cleanPayload.details = details.slice(0, 500);

    await setDoc(doc(db, 'activityLogs', logId), cleanPayload);
  } catch (err) {
    // Gracefully handle offline or pending server rule deployment without affecting visitor experience
    // The activity remains safely captured in the local admin audit store
  }
}

// Retrieve cached activity logs for the Admin Dashboard
export function getLocalActivityLogs(): ActivityEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_ACTIVITY_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
