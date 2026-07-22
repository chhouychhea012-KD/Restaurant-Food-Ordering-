type Listener<T = unknown> = (payload: T) => void;

const bus = new EventTarget();

export function emitRealtimeEvent<T>(event: string, payload: T) {
  bus.dispatchEvent(new CustomEvent<T>(event, { detail: payload }));
}

export function subscribeRealtimeEvent<T>(event: string, listener: Listener<T>) {
  const handler = (incoming: Event) => {
    listener((incoming as CustomEvent<T>).detail);
  };

  bus.addEventListener(event, handler);

  return () => {
    bus.removeEventListener(event, handler);
  };
}
