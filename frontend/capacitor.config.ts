import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'store.goldenlandrestaurant.app',
  appName: 'Golden Land Restaurant',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
