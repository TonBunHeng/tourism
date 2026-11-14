import { useEffect, useRef } from 'react';
import realtimeHub from '../utils/realtimeHub';

export function useRealtimeSync(refreshFn, intervalMs = 6000, eventNames = [], enabled = true) {
  const refreshRef = useRef(refreshFn);
  refreshRef.current = refreshFn;

  useEffect(() => {
    if (!enabled) return;

    let timer = null;

    const executeRefresh = () => {
      if (typeof document !== 'undefined' && document.hidden) {
        return;
      }
      try {
        refreshRef.current?.();
      } catch (err) {
        console.warn('Realtime refresh error:', err);
      }
    };

    if (intervalMs > 0) {
      timer = setInterval(executeRefresh, intervalMs);
    }

    const unsubscribes = (eventNames || []).map((name) => {
      return realtimeHub.subscribe(name, () => {
        executeRefresh();
      });
    });

    const handleVisibilityOrFocus = () => {
      if (typeof document !== 'undefined' && !document.hidden) {
        executeRefresh();
      }
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      if (timer) clearInterval(timer);
      unsubscribes.forEach((unsub) => unsub());
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, [intervalMs, enabled, JSON.stringify(eventNames)]);
}

export default useRealtimeSync;
