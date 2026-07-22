const appName = import.meta.env.VITE_APP_NAME?.trim() || 'Golden Land Restaurant';
const defaultTimezone = import.meta.env.VITE_DEFAULT_TIMEZONE?.trim() || 'Asia/Phnom_Penh';
const defaultCurrency = import.meta.env.VITE_DEFAULT_CURRENCY?.trim() || 'USD';
const enableScenarioTools = import.meta.env.VITE_ENABLE_SCENARIO_TOOLS === 'true';
const apiMode = import.meta.env.VITE_API_MODE?.trim() === 'server' ? 'server' : 'mock';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || 'http://localhost:4000/api/v1';

export const appEnv = {
  appName,
  defaultTimezone,
  defaultCurrency,
  enableScenarioTools,
  apiMode,
  apiBaseUrl,
} as const;
