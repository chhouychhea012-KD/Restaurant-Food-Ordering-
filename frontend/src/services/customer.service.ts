import type { Address, User } from '@/types';
import api from '@/services/api';
import { unwrap, useBackendApi } from '@/services/backend';
import { clearSession, dbUsers, saveSession, saveUsers } from '@/utils/mockDb';

function buildAvatar(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export async function updateCustomerProfile(userId: string, payload: { name: string; email: string; phone: string; avatarUrl?: string | null }) {
  if (useBackendApi) return unwrap<User>(await api.put('/customers/' + userId + '/profile', payload));
  const users = dbUsers();
  const emailTaken = users.some((user) => user.id !== userId && user.email.toLowerCase() === payload.email.toLowerCase());
  if (emailTaken) {
    throw new Error('That email is already used by another account.');
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
      avatar: buildAvatar(payload.name),
      avatarUrl: payload.avatarUrl === undefined ? user.avatarUrl ?? null : payload.avatarUrl,
    };
    return updatedUser;
  });

  saveUsers(nextUsers);
  return updatedUser;
}

export async function addCustomerAddress(userId: string, payload: Omit<Address, 'id'>) {
  if (useBackendApi) { await api.post('/customers/' + userId + '/addresses', payload); return unwrap<User>(await api.get('/auth/me')); }
  const users = dbUsers();
  let updatedUser: User | null = null;

  const nextUsers = users.map((user) => {
    if (user.id !== userId) {
      return user;
    }

    const nextAddress: Address = {
      ...payload,
      id: `addr-${crypto.randomUUID()}`,
    };

    const currentAddresses = user.addresses ?? [];
    const normalized = payload.isDefault
      ? currentAddresses.map((address) => ({ ...address, isDefault: false }))
      : currentAddresses;

    updatedUser = {
      ...user,
      addresses: [...normalized, nextAddress],
    };
    return updatedUser;
  });

  saveUsers(nextUsers);
  return updatedUser;
}

export async function updateCustomerAddress(userId: string, addressId: string, payload: Omit<Address, 'id'>) {
  if (useBackendApi) { await api.put('/customers/' + userId + '/addresses/' + addressId, payload); return unwrap<User>(await api.get('/auth/me')); }
  const users = dbUsers();
  let updatedUser: User | null = null;

  const nextUsers = users.map((user) => {
    if (user.id !== userId) {
      return user;
    }

    const currentAddresses = user.addresses ?? [];
    const normalized = payload.isDefault
      ? currentAddresses.map((address) => ({ ...address, isDefault: false }))
      : currentAddresses;

    updatedUser = {
      ...user,
      addresses: normalized.map((address) =>
        address.id === addressId
          ? {
              ...payload,
              id: addressId,
            }
          : address,
      ),
    };
    return updatedUser;
  });

  saveUsers(nextUsers);
  return updatedUser;
}

export async function deleteCustomerAddress(userId: string, addressId: string) {
  if (useBackendApi) { await api.delete('/customers/' + userId + '/addresses/' + addressId); return unwrap<User>(await api.get('/auth/me')); }
  const users = dbUsers();
  let updatedUser: User | null = null;

  const nextUsers = users.map((user) => {
    if (user.id !== userId) {
      return user;
    }

    const remaining = (user.addresses ?? []).filter((address) => address.id !== addressId);
    updatedUser = {
      ...user,
      addresses: remaining.map((address, index) => ({ ...address, isDefault: index === 0 ? true : address.isDefault })),
    };
    return updatedUser;
  });

  saveUsers(nextUsers);
  return updatedUser;
}

export async function setDefaultCustomerAddress(userId: string, addressId: string) {
  if (useBackendApi) {
    const addresses = unwrap<Address[]>(await api.get('/customers/' + userId + '/addresses'));
    const address = addresses.find((entry) => entry.id === addressId);
    if (!address) return null;
    await api.put('/customers/' + userId + '/addresses/' + addressId, { ...address, isDefault: true });
    return unwrap<User>(await api.get('/auth/me'));
  }
  const users = dbUsers();
  let updatedUser: User | null = null;

  const nextUsers = users.map((user) => {
    if (user.id !== userId) {
      return user;
    }

    updatedUser = {
      ...user,
      addresses: (user.addresses ?? []).map((address) => ({
        ...address,
        isDefault: address.id === addressId,
      })),
    };
    return updatedUser;
  });

  saveUsers(nextUsers);
  return updatedUser;
}

export async function applyCustomerLoyaltyTransaction(userId: string, payload: { earnedPoints: number; redeemedPoints: number }) {
  if (useBackendApi) return unwrap<User>(await api.patch('/customers/' + userId + '/loyalty', payload));
  const users = dbUsers();
  let updatedUser: User | null = null;

  const nextUsers = users.map((user) => {
    if (user.id !== userId) {
      return user;
    }

    updatedUser = {
      ...user,
      loyaltyPoints: Math.max(0, (user.loyaltyPoints ?? 0) - payload.redeemedPoints + payload.earnedPoints),
    };
    return updatedUser;
  });

  saveUsers(nextUsers);
  return updatedUser;
}

export async function deleteCustomerAccount(userId: string) {
  if (useBackendApi) { await api.delete('/customers/' + userId); clearSession(); return true; }
  const nextUsers = dbUsers().filter((user) => user.id !== userId);
  saveUsers(nextUsers);
  clearSession();
  return true;
}

export function syncSessionUser(user: User | null) {
  const sessionRaw = localStorage.getItem('flavorfleet.session');
  if (!sessionRaw || !user) {
    return;
  }

  try {
    const session = JSON.parse(sessionRaw) as { accessToken: string; refreshToken: string; expiresAt: string; userId: string };
    saveSession({ ...session, userId: user.id });
  } catch {
    return;
  }
}
