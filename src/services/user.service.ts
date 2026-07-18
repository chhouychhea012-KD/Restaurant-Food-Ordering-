import type { User, UserInput } from '@/types';
import { createActivityLog } from '@/services/activity-log.service';
import { buildRoleAssignment } from '@/utils/access';
import { hashValue } from '@/utils/crypto';
import { dbRoles, dbUsers, saveUsers } from '@/utils/mockDb';

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

function buildRoleAssignments(
  userId: string,
  roleName: User['role'],
  restaurantId?: string | null,
  accessWindow?: UserInput['accessWindow'],
) {
  const role = dbRoles().find((entry) => entry.name === roleName);
  return [
    buildRoleAssignment({
      userId,
      roleId: role?.id ?? null,
      roleName,
      restaurantId: restaurantId ?? null,
      accessWindow: accessWindow ?? null,
    }),
  ];
}

export async function listUsers() {
  return dbUsers();
}

export async function createUser(payload: UserInput) {
  const users = dbUsers();
  if (users.some((user) => user.email.toLowerCase() === payload.email.toLowerCase())) {
    throw new Error('A user with this email already exists.');
  }

  const now = new Date().toISOString();
  const userId = `user-${crypto.randomUUID()}`;
  const user: User = {
    id: userId,
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone.trim(),
    role: payload.role,
    status: payload.status,
    shiftActive: payload.shiftActive,
    restaurantId: payload.restaurantId ?? null,
    avatar: buildAvatar(payload.name),
    avatarUrl: payload.avatarUrl ?? null,
    passwordHash: await hashValue(getSeedPassword(payload.role)),
    roleAssignments: buildRoleAssignments(userId, payload.role, payload.restaurantId ?? null, payload.accessWindow),
    loyaltyPoints: payload.role === 'customer' ? 0 : undefined,
    addresses: payload.role === 'customer' ? [] : undefined,
    createdAt: now,
    updatedAt: now,
  };

  saveUsers([user, ...users]);
  await createActivityLog({
    domain: 'auth',
    action: 'user.created',
    title: `User created: ${user.name}`,
    description: `${user.name} was added with the ${user.role} role and ${user.status} account status.`,
    restaurantId: user.restaurantId ?? null,
    metadata: {
      roleName: user.role,
      status: user.status,
      shiftActive: user.shiftActive,
      hasAccessWindow: Boolean(payload.accessWindow),
    },
  });
  return user;
}

export async function updateUser(userId: string, payload: UserInput) {
  const users = dbUsers();
  if (users.some((user) => user.id !== userId && user.email.toLowerCase() === payload.email.toLowerCase())) {
    throw new Error('A user with this email already exists.');
  }

  const existing = users.find((user) => user.id === userId);
  if (!existing) {
    throw new Error('User not found.');
  }

  const now = new Date().toISOString();
  const nextUsers = users.map((user) => {
    if (user.id !== userId) {
      return user;
    }

    return {
      ...user,
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone.trim(),
      role: payload.role,
      status: payload.status,
      shiftActive: payload.shiftActive,
      restaurantId: payload.restaurantId ?? null,
      roleAssignments: buildRoleAssignments(user.id, payload.role, payload.restaurantId ?? null, payload.accessWindow),
      avatar: buildAvatar(payload.name),
      avatarUrl: payload.avatarUrl === undefined ? user.avatarUrl ?? null : payload.avatarUrl,
      loyaltyPoints: payload.role === 'customer' ? user.loyaltyPoints ?? 0 : undefined,
      addresses: payload.role === 'customer' ? user.addresses ?? [] : user.addresses,
      updatedAt: now,
    } satisfies User;
  });

  saveUsers(nextUsers);

  const updatedUser = nextUsers.find((user) => user.id === userId) ?? null;
  if (updatedUser) {
    const accessWindowChanged = JSON.stringify(existing.roleAssignments?.[0]?.accessWindow ?? null) !== JSON.stringify(updatedUser.roleAssignments?.[0]?.accessWindow ?? null);
    await createActivityLog({
      domain: accessWindowChanged ? 'access' : 'auth',
      action: accessWindowChanged ? 'user.access_window_updated' : 'user.updated',
      title: `User updated: ${updatedUser.name}`,
      description: accessWindowChanged
        ? `${updatedUser.name}'s time-sensitive access was updated.`
        : `${updatedUser.name}'s role, account state, or contact information was updated.`,
      restaurantId: updatedUser.restaurantId ?? null,
      metadata: {
        previousRole: existing.role,
        nextRole: updatedUser.role,
        previousStatus: existing.status,
        nextStatus: updatedUser.status,
        accessWindowChanged,
        shiftActive: updatedUser.shiftActive,
      },
    });
  }

  return updatedUser;
}

export async function deleteUser(userId: string) {
  const existing = dbUsers().find((user) => user.id === userId);
  const nextUsers = dbUsers().filter((user) => user.id !== userId);
  saveUsers(nextUsers);

  if (existing) {
    await createActivityLog({
      domain: 'auth',
      action: 'user.deleted',
      title: `User deleted: ${existing.name}`,
      description: `${existing.name} was removed from the admin user directory.`,
      restaurantId: existing.restaurantId ?? null,
      metadata: {
        roleName: existing.role,
        status: existing.status,
      },
    });
  }

  return true;
}
