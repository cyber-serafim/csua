import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SESSION_KEY = 'visitor_session_id';

function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

function getOrCreateSessionId(): string {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export function useVisitorTracking() {
  const location = useLocation();
  const pageViewIdRef = useRef<string | null>(null);
  const enterTimeRef = useRef<number>(Date.now());
  const lastPathRef = useRef<string | null>(null);

  const trackPageExit = useCallback(async () => {
    if (!pageViewIdRef.current || !lastPathRef.current) return;

    const duration = Math.floor((Date.now() - enterTimeRef.current) / 1000);
    
    try {
      await fetch(`${SUPABASE_URL}/functions/v1/track-visit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: getOrCreateSessionId(),
          pageUrl: window.location.href,
          pagePath: lastPathRef.current,
          userAgent: navigator.userAgent,
          action: 'exit',
          pageViewId: pageViewIdRef.current,
          duration,
        }),
        keepalive: true,
      });
    } catch (error) {
      console.error('[Tracking] Error tracking page exit:', error);
    }

    pageViewIdRef.current = null;
  }, []);

  const trackPageEnter = useCallback(async (path: string) => {
    enterTimeRef.current = Date.now();
    lastPathRef.current = path;

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/track-visit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: getOrCreateSessionId(),
          pageUrl: window.location.href,
          pagePath: path,
          referer: document.referrer || null,
          userAgent: navigator.userAgent,
          action: 'enter',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        pageViewIdRef.current = data.pageViewId;
      }
    } catch (error) {
      console.error('[Tracking] Error tracking page enter:', error);
    }
  }, []);

  useEffect(() => {
    // Skip tracking for admin pages
    if (location.pathname.startsWith('/admin')) {
      return;
    }

    // Track exit of previous page
    trackPageExit();

    // Track enter of new page
    trackPageEnter(location.pathname);

    // Cleanup on unmount or page change
    return () => {
      // Track exit when component unmounts (page navigation)
    };
  }, [location.pathname, trackPageEnter, trackPageExit]);

  // Track page exit on browser close/navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!pageViewIdRef.current || !lastPathRef.current) return;
      
      const duration = Math.floor((Date.now() - enterTimeRef.current) / 1000);
      
      // Use sendBeacon for reliability during page unload
      navigator.sendBeacon(
        `${SUPABASE_URL}/functions/v1/track-visit`,
        JSON.stringify({
          sessionId: getOrCreateSessionId(),
          pageUrl: window.location.href,
          pagePath: lastPathRef.current,
          userAgent: navigator.userAgent,
          action: 'exit',
          pageViewId: pageViewIdRef.current,
          duration,
        })
      );
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
}