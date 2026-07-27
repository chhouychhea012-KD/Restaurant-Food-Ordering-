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


export interface ForgotPasswordResponse {
  message: string;
  expiresInSeconds: number;
}

export interface VerifyResetCodeResponse {
  verified: boolean;
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone?: string;
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

export async function requestPasswordReset(email: string) {
  if (useBackendApi) {
    return unwrap<ForgotPasswordResponse>(await api.post('/auth/forgot-password', { email }));
  }

  return {
    message: 'If that email exists, a password reset code has been sent.',
    expiresInSeconds: 60,
  };
}

export async function verifyPasswordResetCode(email: string, code: string) {
  if (useBackendApi) {
    return unwrap<VerifyResetCodeResponse>(await api.post('/auth/verify-reset-code', { email, code }));
  }

  if (!email || !code) {
    throw new Error('Email and reset code are required.');
  }
  return { verified: true, message: 'Reset code verified. You can create a new password now.' };
}

export async function resetPassword(payload: { email: string; code: string; password: string }) {
  if (useBackendApi) {
    return unwrap<ResetPasswordResponse>(await api.post('/auth/reset-password', payload));
  }

  const users = dbUsers();
  const user = users.find((entry) => entry.email.toLowerCase() === payload.email.toLowerCase());
  if (!user) {
    throw new Error('Invalid or expired reset code.');
  }
  user.passwordHash = await hashValue(payload.password);
  saveUsers(users);
  return { message: 'Password changed successfully. Please sign in with your new password.' };
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

export async function loginWithGoogle(credential: string) {
  if (useBackendApi) {
    const response = unwrap<{ user: User; session: Session }>(await api.post('/auth/google', { credential }));
    saveSession(response.session);
    cacheCurrentUser(response.user);
    return response;
  }

  throw new Error('Google login requires backend API mode.');
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
    phone: payload.phone ?? '',
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
        label: 'Home',
        line1: 'Street 310, BKK1',
        district: 'Boeung Keng Kang',
        city: 'Phnom Penh',
        isDefault: true,
        lat: 11.5526,
        lng: 104.9282,
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
    title: 'Welcome to Golden Land Restaurant',
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

