import type { AxiosRequestConfig } from 'axios';
import api from '@/services/api';
import { unwrap } from '@/services/backend';

type CacheEntry<T> = {
  expiresAt: number;
  promise: Promise<T>;
};

const cache = new Map<string, CacheEntry<unknown>>();
const DEFAULT_TTL_MS = 45_000;

function stableKey(path: string, config?: AxiosRequestConfig) {
  const params = config?.params ? JSON.stringify(config.params, Object.keys(config.params).sort()) : '';
  return `${path}?${params}`;
}

export function clearApiCache(prefix = '') {
  for (const key of cache.keys()) {
    if (!prefix || key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

export async function cachedGet<T>(path: string, config?: AxiosRequestConfig, ttlMs = DEFAULT_TTL_MS) {
  const key = stableKey(path, config);
  const now = Date.now();
  const existing = cache.get(key) as CacheEntry<T> | undefined;
  if (existing && existing.expiresAt > now) {
    return existing.promise;
  }

  const promise = api.get(path, config).then((response) => unwrap<T>(response));
  cache.set(key, { expiresAt: now + ttlMs, promise });
  promise.catch(() => cache.delete(key));
  return promise;
}