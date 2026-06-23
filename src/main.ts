import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './main.css';
import { seedDatabase } from './utils/mockDb';

async function bootstrap() {
  await seedDatabase();

  const app = createApp(App);
  app.use(createPinia());
  app.use(router);
  app.mount('#app');
}

bootstrap();
