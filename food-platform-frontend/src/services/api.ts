import axios from 'axios';

const api = axios.create({
  baseURL: '/mock-api',
  timeout: 5000,
});

api.interceptors.request.use((config) => {
  config.headers.set('X-Frontend-Mock', 'true');
  return config;
});

export default api;
