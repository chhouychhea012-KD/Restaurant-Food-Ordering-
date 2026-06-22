import { dbAnalytics } from '@/utils/mockDb';

export async function getAnalyticsSnapshot() {
  return dbAnalytics();
}
