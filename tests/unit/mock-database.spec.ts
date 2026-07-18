import { describe, expect, it } from 'vitest';
import { seedMockDatabase, resetMockDatabase } from '@/mocks/database/runtime';
import { storageKeys } from '@/utils/storage';

describe('mock database runtime', () => {
  it('seeds the local storage dataset', async () => {
    await seedMockDatabase();

    expect(localStorage.getItem(storageKeys.users)).toBeTruthy();
    expect(localStorage.getItem(storageKeys.restaurants)).toBeTruthy();
    expect(localStorage.getItem(storageKeys.orders)).toBeTruthy();
  });

  it('resets and reseeds app storage', async () => {
    localStorage.setItem(storageKeys.cart, JSON.stringify([{ id: 'temp' }]));

    await resetMockDatabase();

    expect(localStorage.getItem(storageKeys.cart)).toBeNull();
    expect(localStorage.getItem(storageKeys.users)).toBeTruthy();
  });
});
