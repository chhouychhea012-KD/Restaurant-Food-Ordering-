import { seedDatabase } from '@/utils/mockDb';
import { clearAppStorage } from '@/utils/storage';

export async function seedMockDatabase() {
  await seedDatabase();
}

export async function resetMockDatabase() {
  clearAppStorage();
  await seedDatabase();
}
