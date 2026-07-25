/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string;
  readonly VITE_DEFAULT_TIMEZONE?: string;
  readonly VITE_DEFAULT_CURRENCY?: string;
  readonly VITE_ENABLE_SCENARIO_TOOLS?: string;
  readonly VITE_API_MODE?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  __flavorFleet?: {
    resetMockData: () => Promise<void>;
    seedMockData: () => Promise<void>;
    storageKeys: Record<string, string>;
    version: string;
  };
}
