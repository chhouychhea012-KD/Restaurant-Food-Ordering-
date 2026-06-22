import type { User, UserInput } from '@/types';
import { hashValue } from '@/utils/crypto';
import { dbUsers, saveUsers } from '@/utils/mockDb';

function buildAvatar(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

const coreRolePasswords = {
  admin: 'Admin@123',
  owner: 'Owner@123',
  kitchen: 'Kitchen@123',
  rider: 'Rider@123',
  customer: 'Customer@123',
} as const;

function getSeedPassword(role: User['role']) {
  return coreRolePasswords[role as keyof typeof coreRolePasswords] ?? 'Welcome@123';
}

export async function listUsers() {
  return dbUsers();
}

export async function createUser(payload: UserInput) {
  const users = dbUsers();
  if (users.some((user) => user.email.toLowerCase() === payload.email.toLowerCase())) {
    throw new Error('A user with this email already exists.');
  }

  const user: User = {
    id: `user-${crypto.randomUUID()}`,
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone.trim(),
    role: payload.role,
    shiftActive: payload.shiftActive,
    restaurantId: payload.restaurantId ?? null,
    avatar: buildAvatar(payload.name),
    passwordHash: await hashValue(getSeedPassword(payload.role)),
    loyaltyPoints: payload.role === 'customer' ? 0 : undefined,
    addresses: payload.role === 'customer' ? [] : undefined,
  };

  saveUsers([user, ...users]);
  return user;
}

export async function updateUser(userId: string, payload: UserInput) {
  const users = dbUsers();
  if (users.some((user) => user.id !== userId && user.email.toLowerCase() === payload.email.toLowerCase())) {
    throw new Error('A user with this email already exists.');
  }

  let updatedUser: User | null = null;
  const nextUsers = users.map((user) => {
    if (user.id !== userId) {
      return user;
    }

    updatedUser = {
      ...user,
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone.trim(),
      role: payload.role,
      shiftActive: payload.shiftActive,
      restaurantId: payload.restaurantId ?? null,
      avatar: buildAvatar(payload.name),
      loyaltyPoints: payload.role === 'customer' ? user.loyaltyPoints ?? 0 : undefined,
      addresses: payload.role === 'customer' ? user.addresses ?? [] : user.addresses,
    };

    return updatedUser;
  });

  saveUsers(nextUsers);
  return updatedUser;
}

export async function deleteUser(userId: string) {
  const nextUsers = dbUsers().filter((user) => user.id !== userId);
  saveUsers(nextUsers);
  return true;
}
