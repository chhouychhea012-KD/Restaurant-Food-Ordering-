import type { Session, User } from '@/types';
import api from '@/services/api';
import { unwrap, useBackendApi } from '@/services/backend';
import { createNotification } from '@/services/notification.service';
import { buildRoleAssignment, evaluateUserOperationalAccess } from '@/utils/access';
import { createToken, hashValue } from '@/utils/crypto';
import { clearSession, dbRoles, dbUsers, readSession, saveSession, saveUsers } from '@/utils/mockDb';

const CURRENT_USER_KEY = 'flavorfleet.currentUser';

function cacheCurrentUser(user: User | null) {
  if (!useBackendApi) return;
  if (!user) {
    localStorage.removeItem(CURRENT_USER_KEY);
    return;
  }
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export function readCachedCurrentUser() {
  if (!useBackendApi) return null;
  const raw = localStorage.getItem(CURRENT_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

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
  if (useBackendApi) {
    const response = unwrap<{ user: User; session: Session }>(await api.post('/auth/login', payload));
    saveSession(response.session);
    cacheCurrentUser(response.user);
    return response;
  }
  const users = dbUsers();
  const passwordHash = await hashValue(payload.password);
  const user = users.find(
    (entry) => entry.email.toLowerCase() === payload.email.toLowerCase() && entry.passwordHash === passwordHash,
  );

  if (!user) {
    throw new Error('Invalid email or password.');
  }

  if (user.status !== 'active') {
    throw new Error(`This account is ${user.status} and cannot sign in right now.`);
  }

  const accessEvaluation = evaluateUserOperationalAccess(user);
  if (!accessEvaluation.isActive) {
    throw new Error(accessEvaluation.message);
  }

  const session = buildSession(user.id);
  saveSession(session);

  return {
    user,
    session,
  };
}

export async function register(payload: RegisterPayload) {
  if (useBackendApi) {
    const response = unwrap<{ user: User; session: Session }>(await api.post('/auth/register', payload));
    saveSession(response.session);
    cacheCurrentUser(response.user);
    return response;
  }
  const users = dbUsers();
  const existing = users.find((entry) => entry.email.toLowerCase() === payload.email.toLowerCase());
  if (existing) {
    throw new Error('This email is already registered.');
  }

  const passwordHash = await hashValue(payload.password);
  const now = new Date().toISOString();
  const customerRole = dbRoles().find((role) => role.name === 'customer');
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
    avatarUrl: null,
    role: 'customer',
    status: 'active',
    shiftActive: true,
    restaurantId: null,
    roleAssignments: [],
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
    createdAt: now,
    updatedAt: now,
  };
  user.roleAssignments = [
    buildRoleAssignment({
      userId: user.id,
      roleId: customerRole?.id ?? null,
      roleName: 'customer',
      restaurantId: null,
    }),
  ];

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
    ctaTo: '/customer/dashboard',
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

export async function getCurrentUser() {
  if (useBackendApi) {
    const user = unwrap<User & { permissions?: string[] }>(await api.get('/auth/me'));
    cacheCurrentUser(user);
    return user;
  }

  const session = readSession();
  return session ? dbUsers().find((entry) => entry.id === session.userId) ?? null : null;
}

export function logout() {
  clearSession();
  cacheCurrentUser(null);
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

