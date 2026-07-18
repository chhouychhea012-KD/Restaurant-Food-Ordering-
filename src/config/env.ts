const appName = import.meta.env.VITE_APP_NAME?.trim() || 'Flavor Fleet';
const defaultTimezone = import.meta.env.VITE_DEFAULT_TIMEZONE?.trim() || 'Asia/Phnom_Penh';
const defaultCurrency = import.meta.env.VITE_DEFAULT_CURRENCY?.trim() || 'USD';
const enableScenarioTools = import.meta.env.VITE_ENABLE_SCENARIO_TOOLS === 'true';

export const appEnv = {
  appName,
  defaultTimezone,
  defaultCurrency,
  enableScenarioTools,
} as const;
