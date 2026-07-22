import axios from 'axios';
import { appEnv } from '@/config/env';
import { readSession } from '@/utils/mockDb';

export const httpClient = axios.create({
  baseURL: appEnv.apiMode === 'server' ? appEnv.apiBaseUrl : '/mock-api',
  timeout: 10000,
});

httpClient.interceptors.request.use((config) => {
  if (appEnv.apiMode === 'server') {
    const token = readSession()?.accessToken;
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  }

  config.headers.set('X-Frontend-Mock', 'true');
  return config;
});