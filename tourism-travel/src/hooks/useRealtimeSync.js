import { useEffect, useRef } from 'react';
import realtimeHub from '../utils/realtimeHub';

/**
 * Custom hook that triggers a refresh function:
 * 1. At a regular interval (default 6000ms = 6s) while the tab is active/visible.
 * 2. Immediately when the browser tab gains focus or becomes visible.
 * 3. Immediately when any of the specified realtimeHub events are fired (locally or from another device/tab).
 *
 * @param {Function} refreshFn - The callback to execute (should perform a silent background refetch)
 * @param {number} intervalMs - Polling interval in ms (default 6000ms)
 * @param {Array<string>} eventNames - Array of event names to listen for (e.g. ['booking_updated'])
 * @param {boolean} enabled - Whether realtime sync is active (default true)
 */
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
