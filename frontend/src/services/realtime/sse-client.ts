import { appEnv } from '@/config/env';
import { emitRealtimeEvent } from '@/services/realtime/event-bus';
import { clearApiCache } from '@/services/request-cache';
import { readSession } from '@/utils/mockDb';

let source: EventSource | null = null;
let activeToken: string | null = null;

function realtimeUrl(token: string) {
  return appEnv.apiBaseUrl.replace(/\/$/, '') + '/realtime/events?token=' + encodeURIComponent(token);
}

function handleMessage(eventName: string, incoming: MessageEvent<string>) {
  const payload = incoming.data ? JSON.parse(incoming.data) : {};
  if (eventName === 'order.changed') {
    clearApiCache('/orders');
    clearApiCache('/analytics');
    clearApiCache('/activity-logs');
  }
  if (eventName === 'notification.changed') {
    clearApiCache('/notifications');
  }
  emitRealtimeEvent(eventName, payload);
}

export function startRealtimeClient() {
  if (appEnv.apiMode !== 'server' || typeof window === 'undefined' || typeof EventSource === 'undefined') {
    return;
  }

  const token = readSession()?.accessToken ?? null;
  if (!token) {
    stopRealtimeClient();
    return;
  }

  if (source && activeToken === token) {
    return;
  }

  stopRealtimeClient();
  activeToken = token;
  source = new EventSource(realtimeUrl(token));
  source.addEventListener('order.changed', (event) => handleMessage('order.changed', event as MessageEvent<string>));
  source.addEventListener('notification.changed', (event) => handleMessage('notification.changed', event as MessageEvent<string>));
  source.onerror = () => {
    // EventSource reconnects automatically; keep the handler quiet for normal network churn.
  };
}

export function stopRealtimeClient() {
  if (source) {
    source.close();
  }
  source = null;
  activeToken = null;
}
