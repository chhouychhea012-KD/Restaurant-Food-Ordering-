export function withMockLatency<T>(value: T, delayMs = 180) {
  return new Promise<T>((resolve) => {
    window.setTimeout(() => resolve(value), delayMs);
  });
}
