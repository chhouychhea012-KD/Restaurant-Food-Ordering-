/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string;
  readonly VITE_DEFAULT_TIMEZONE?: string;
  readonly VITE_DEFAULT_CURRENCY?: string;
  readonly VITE_ENABLE_SCENARIO_TOOLS?: string;
  readonly VITE_API_MODE?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  google?: {
    accounts?: {
      id?: {
        initialize: (options: { client_id: string; callback: (response: { credential?: string }) => void; auto_select?: boolean; cancel_on_tap_outside?: boolean }) => void;
        prompt: () => void;
        renderButton: (parent: HTMLElement, options: { theme?: string; size?: string; type?: string; text?: string; shape?: string; width?: number; logo_alignment?: string }) => void;
      };
    };
  };
  __flavorFleet?: {
    resetMockData: () => Promise<void>;
    seedMockData: () => Promise<void>;
    storageKeys: Record<string, string>;
    version: string;
  };
}
