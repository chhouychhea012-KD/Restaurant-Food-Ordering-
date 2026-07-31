import axios from 'axios';
import { appEnv } from '@/config/env';
import { clearSession, readSession } from '@/utils/mockDb';

export const httpClient = axios.create({
  baseURL: appEnv.apiMode === 'server' ? appEnv.apiBaseUrl : '/mock-api',
  timeout: 10000,
});

httpClient.interceptors.request.use((config) => {
  if (appEnv.apiMode === 'server') {
    const token = readSession()?.accessToken;
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      config.headers.delete('Authorization');
    }
    return config;
  }

  config.headers.set('X-Frontend-Mock', 'true');
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status ?? error?.response?.data?.error?.status;
    if (appEnv.apiMode === 'server' && status === 401) {
      clearSession();
      localStorage.removeItem('flavorfleet.currentUser');

      const currentPath = window.location.pathname + window.location.search;
      if (!window.location.pathname.startsWith('/auth/login')) {
        window.location.assign(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
      }
    }
    return Promise.reject(error);
  },
);
