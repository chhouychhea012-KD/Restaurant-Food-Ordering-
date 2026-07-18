import axios from 'axios';

export const httpClient = axios.create({
  baseURL: '/mock-api',
  timeout: 5000,
});

httpClient.interceptors.request.use((config) => {
  config.headers.set('X-Frontend-Mock', 'true');
  return config;
});
