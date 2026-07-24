import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from '@/App.vue';
import router from '@/router';
import '@/main.css';
import { seedMockDatabase, resetMockDatabase } from '@/mocks/database/runtime';
import { storageKeys } from '@/utils/storage';
import { startRealtimeClient } from '@/services/realtime/sse-client';

export async function bootstrapApp() {
  await seedMockDatabase();

  if (typeof window !== 'undefined') {
    window.__flavorFleet = {
      resetMockData: resetMockDatabase,
      seedMockData: seedMockDatabase,
      storageKeys,
      version: 'milestone-0',
    };
  }

  const app = createApp(App);
  app.use(createPinia());
  app.use(router);
  startRealtimeClient();
  app.mount('#app');
}
