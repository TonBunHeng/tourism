import { resolveBackendHost } from '../services/api';

/**
 * High-performance, multi-device Real-Time Sync Hub for AngkorVerses Admin.
 */
class RealtimeHub {
  constructor() {
    this.listeners = new Map();
    this.channel = null;
    this.pulseTimer = null;
    this.isPolling = false;
    this.lastState = {
      unread: null,
      bookingTime: null,
      reviewTime: null,
      businessTime: null,
    };

    if (typeof window !== 'undefined') {
      try {
        if ('BroadcastChannel' in window) {
          this.channel = new BroadcastChannel('angkorverses_realtime_hub');
          this.channel.onmessage = (event) => {
            const { type, data } = event.data || {};
            if (type) {
              this._dispatchLocal(type, data);
            }
          };
        }
      } catch (err) {
        console.warn('BroadcastChannel not supported, using fallback:', err);
      }

      window.addEventListener('storage', (e) => {
        if (e.key === 'angkorverses_realtime_event' && e.newValue) {
          try {
            const { type, data } = JSON.parse(e.newValue);
            if (type) {
              this._dispatchLocal(type, data);
            }
          } catch {
            // Ignore parse errors
          }
        }
      });

      const handleActive = () => {
        if (!document.hidden) {
          this.checkPulse();
        }
      };
      window.addEventListener('focus', handleActive);
      document.addEventListener('visibilitychange', handleActive);

      this.startPulse(4500);
    }
  }

  startPulse(intervalMs = 4500) {
    if (this.pulseTimer) clearInterval(this.pulseTimer);
    this.pulseTimer = setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden) {
        this.checkPulse();
      }
    }, intervalMs);
  }

  async checkPulse() {
    if (this.isPolling) return;
    this.isPolling = true;

    try {
      const rawApi = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const rootUrl = resolveBackendHost(rawApi, '8000').replace(/\/+$/, '');
      const pulseUrl = `${rootUrl}/sync/pulse`;

      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const headers = { 'Accept': 'application/json' };
      if (token && token !== 'undefined' && token !== 'null') {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(pulseUrl, {
        method: 'GET',
        headers,
        cache: 'no-store',
      });

      if (!res.ok) return;
      const json = await res.json();
      if (!json?.success) return;

      const {
        unread_notifications,
        latest_booking_time,
        latest_review_time,
        latest_business_time,
      } = json;

      if (this.lastState.bookingTime === null) {
        this.lastState = {
          unread: unread_notifications,
          bookingTime: latest_booking_time,
          reviewTime: latest_review_time,
          businessTime: latest_business_time,
        };
        return;
      }

      if (latest_booking_time && latest_booking_time !== this.lastState.bookingTime) {
        this.lastState.bookingTime = latest_booking_time;
        this._dispatchLocal('booking_updated', { source: 'pulse' });
      }

      if (latest_review_time && latest_review_time !== this.lastState.reviewTime) {
        this.lastState.reviewTime = latest_review_time;
        this._dispatchLocal('review_updated', { source: 'pulse' });
      }

      if (latest_business_time && latest_business_time !== this.lastState.businessTime) {
        this.lastState.businessTime = latest_business_time;
        this._dispatchLocal('business_updated', { source: 'pulse' });
      }

      if (typeof unread_notifications === 'number' && unread_notifications !== this.lastState.unread) {
        const prev = this.lastState.unread;
        this.lastState.unread = unread_notifications;
        this._dispatchLocal('notification_received', {
          unreadCount: unread_notifications,
          isNew: unread_notifications > (prev || 0),
        });
      }
    } catch {
      // Silent catch
    } finally {
      this.isPolling = false;
    }
  }

  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    return () => {
      const set = this.listeners.get(event);
      if (set) {
        set.delete(callback);
        if (set.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  _dispatchLocal(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in realtime listener for ${event}:`, err);
        }
      });
    }

    const wildcard = this.listeners.get('*');
    if (wildcard) {
      wildcard.forEach((cb) => {
        try {
          cb({ event, data });
        } catch (err) {
          console.error('Error in wildcard listener:', err);
        }
      });
    }
  }

  emit(event, data = {}) {
    this._dispatchLocal(event, data);

    if (this.channel) {
      try {
        this.channel.postMessage({ type: event, data });
      } catch {
        // Ignore broadcast errors
      }
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          'angkorverses_realtime_event',
          JSON.stringify({ type: event, data, _t: Date.now() })
        );
      } catch {
        // Ignore storage errors
      }
    }
  }
}

export const realtimeHub = new RealtimeHub();
export default realtimeHub;
