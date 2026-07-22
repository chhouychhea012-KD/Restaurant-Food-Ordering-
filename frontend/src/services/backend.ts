import api from '@/services/api';
import { appEnv } from '@/config/env';

export const useBackendApi = appEnv.apiMode === 'server';

export function unwrap<T>(response: { data: { data: T } }) {
  return response.data.data;
}

export function authHeader(token?: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}