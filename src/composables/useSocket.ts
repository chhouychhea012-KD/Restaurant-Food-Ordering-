import { onBeforeUnmount } from 'vue';

type Listener = (payload: unknown) => void;

const bus = new EventTarget();

export function emitSocketEvent(event: string, payload: unknown) {
  bus.dispatchEvent(new CustomEvent(event, { detail: payload }));
}

export function useSocket(event: string, listener: Listener) {
  const handler = (incoming: Event) => {
    listener((incoming as CustomEvent).detail);
  };

  bus.addEventListener(event, handler);
  onBeforeUnmount(() => {
    bus.removeEventListener(event, handler);
  });
}
