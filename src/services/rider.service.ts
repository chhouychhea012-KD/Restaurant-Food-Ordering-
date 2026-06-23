import type { User } from '@/types';
import { dbUsers, saveUsers } from '@/utils/mockDb';

export async function listRiders() {
  return dbUsers().filter((user) => user.role === 'rider');
}

export async function toggleRiderAvailability(userId: string) {
  const users = dbUsers();
  const nextUsers = users.map((user) =>
    user.id === userId ? ({ ...user, shiftActive: !user.shiftActive } as User) : user,
  );
  saveUsers(nextUsers);
  return nextUsers.find((user) => user.id === userId) ?? null;
}
