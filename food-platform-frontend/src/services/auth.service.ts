import type { Session, User } from '@/types';
import { createNotification } from '@/services/notification.service';
import { createToken, hashValue } from '@/utils/crypto';
import { clearSession, dbUsers, readSession, saveSession, saveUsers } from '@/utils/mockDb';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}

function buildSession(userId: string): Session {
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString();
  return {
    accessToken: createToken('access'),
    refreshToken: createToken('refresh'),
    expiresAt,
    userId,
  };
}

export async function login(payload: LoginPayload) {
  const users = dbUsers();
  const passwordHash = await hashValue(payload.password);
  const user = users.find(
    (entry) => entry.email.toLowerCase() === payload.email.toLowerCase() && entry.passwordHash === passwordHash,
  );

  if (!user) {
    throw new Error('Invalid email or password.');
  }

  if (!user.shiftActive && ['kitchen', 'rider'].includes(user.role)) {
    throw new Error('Your operational shift is currently inactive.');
  }

  const session = buildSession(user.id);
  saveSession(session);

  return {
    user,
    session,
  };
}

export async function register(payload: RegisterPayload) {
  const users = dbUsers();
  const existing = users.find((entry) => entry.email.toLowerCase() === payload.email.toLowerCase());
  if (existing) {
    throw new Error('This email is already registered.');
  }

  const passwordHash = await hashValue(payload.password);
  const user: User = {
    id: `user-${crypto.randomUUID()}`,
    name: payload.name,
    email: payload.email.toLowerCase(),
    phone: payload.phone,
    passwordHash,
    avatar: payload.name
      .split(' ')
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join(''),
    role: 'customer',
    shiftActive: true,
    loyaltyPoints: 120,
    addresses: [
      {
        id: `addr-${crypto.randomUUID()}`,
        label: 'Primary',
        line1: 'Set your delivery address',
        district: 'Bangkok Central',
        city: 'Bangkok',
        isDefault: true,
        lat: 13.7563,
        lng: 100.5018,
      },
    ],
  };

  saveUsers([user, ...users]);
  const session = buildSession(user.id);
  saveSession(session);

  createNotification({
    title: 'Welcome to Flavor Fleet',
    message: `Hi ${user.name}, your account is ready. Start browsing restaurants, categories, and live delivery updates anytime.`,
    kind: 'account',
    audienceRole: 'customer',
    userId: user.id,
    ctaLabel: 'Open dashboard',
    ctaTo: '/dashboard',
  });

  createNotification({
    title: 'New customer account created',
    message: `${user.name} joined the platform with the email ${user.email}. Review customer activity from the admin workspace when needed.`,
    kind: 'account',
    audienceRole: 'admin',
    ctaLabel: 'Open users',
    ctaTo: '/admin/users',
  });

  return {
    user,
    session,
  };
}

export function logout() {
  clearSession();
}

export function getActiveSession() {
  return readSession();
}

export function validateSession(session: Session | null) {
  if (!session) {
    return false;
  }

  return new Date(session.expiresAt).getTime() > Date.now();
}
