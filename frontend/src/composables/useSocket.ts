import { onBeforeUnmount } from 'vue';
import { emitRealtimeEvent, subscribeRealtimeEvent } from '@/services/realtime/event-bus';

type Listener = (payload: unknown) => void;

export function emitSocketEvent(event: string, payload: unknown) {
  emitRealtimeEvent(event, payload);
}

export function useSocket(event: string, listener: Listener) {
  const unsubscribe = subscribeRealtimeEvent(event, listener);

  onBeforeUnmount(() => {
    unsubscribe();
  });
}
