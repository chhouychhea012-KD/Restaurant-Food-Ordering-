import api from '@/services/api';
import { unwrap, useBackendApi } from '@/services/backend';
import { cachedGet, clearApiCache } from '@/services/request-cache';
import type { AnalyticsSnapshot } from '@/types';
import { dbAnalytics } from '@/utils/mockDb';

export async function getAnalyticsSnapshot() {
  if (useBackendApi) return cachedGet<AnalyticsSnapshot>('/analytics/snapshot', undefined, 30_000);
  return dbAnalytics();
}
