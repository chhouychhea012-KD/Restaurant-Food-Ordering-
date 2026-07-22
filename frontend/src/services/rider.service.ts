import type { User } from '@/types';
import api from '@/services/api';
import { unwrap, useBackendApi } from '@/services/backend';
import { cachedGet, clearApiCache } from '@/services/request-cache';
import { dbUsers, saveUsers } from '@/utils/mockDb';

export async function listRiders() {
  if (useBackendApi) return cachedGet<User[]>('/riders', undefined, 20_000);
  return dbUsers().filter((user) => user.role === 'rider');
}

export async function toggleRiderAvailability(userId: string) {
  if (useBackendApi) { const rider = unwrap<User | null>(await api.patch('/riders/' + userId + '/availability')); clearApiCache('/riders'); return rider; }
  const users = dbUsers();
  const nextUsers = users.map((user) =>
    user.id === userId ? ({ ...user, shiftActive: !user.shiftActive } as User) : user,
  );
  saveUsers(nextUsers);
  return nextUsers.find((user) => user.id === userId) ?? null;
}
