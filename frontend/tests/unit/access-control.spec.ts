import { describe, expect, it } from 'vitest';
import type { RoleDefinition, User } from '@/types';
import {
  buildRoleAssignment,
  evaluateAccessWindow,
  evaluateUserOperationalAccess,
  canAccessWorkspace,
  getUserPermissions,
  getWorkspaceHome,
  resolveWorkspaceArea,
} from '@/utils/access';

const roles: RoleDefinition[] = [
  {
    id: 'role-ops',
    name: 'operations_manager',
    label: 'Operations Manager',
    permissions: ['activity_logs.read', 'analytics.read', 'dispatch.assign'],
  },
  {
    id: 'role-kitchen',
    name: 'kitchen',
    label: 'Kitchen Staff',
    permissions: ['orders.read', 'orders.accept', 'orders.status.update'],
  },
];

function buildUser(partial?: Partial<User>): User {
  return {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    passwordHash: 'hash',
    role: 'operations_manager',
    status: 'active',
    phone: '+1 555 0000',
    avatar: 'TU',
    restaurantId: null,
    shiftActive: true,
    roleAssignments: [
      buildRoleAssignment({
        userId: 'user-1',
        roleId: 'role-ops',
        roleName: 'operations_manager',
        restaurantId: null,
      }),
    ],
    ...partial,
  };
}

describe('access control utilities', () => {
  it('treats a missing access window as active', () => {
    const evaluation = evaluateAccessWindow(null, new Date('2026-07-13T10:00:00.000Z'));
    expect(evaluation.isActive).toBe(true);
    expect(evaluation.state).toBe('active');
  });

  it('returns scheduled when the valid-from date is in the future', () => {
    const evaluation = evaluateAccessWindow(
      {
        timezone: 'UTC',
        validFrom: '2026-07-14T09:00:00.000Z',
      },
      new Date('2026-07-13T10:00:00.000Z'),
    );

    expect(evaluation.state).toBe('scheduled');
    expect(evaluation.nextAllowedAt).toBe('2026-07-14T09:00:00.000Z');
  });

  it('returns expired when the valid-until date has passed', () => {
    const evaluation = evaluateAccessWindow(
      {
        timezone: 'UTC',
        validUntil: '2026-07-13T09:00:00.000Z',
      },
      new Date('2026-07-13T10:00:00.000Z'),
    );

    expect(evaluation.state).toBe('expired');
    expect(evaluation.isActive).toBe(false);
  });

  it('returns outside_days when the current day is not allowed', () => {
    const evaluation = evaluateAccessWindow(
      {
        timezone: 'UTC',
        allowedDays: [2],
        startTime: '09:00',
        endTime: '17:00',
      },
      new Date('2026-07-13T10:00:00.000Z'),
    );

    expect(evaluation.state).toBe('outside_days');
    expect(evaluation.isActive).toBe(false);
  });

  it('returns outside_hours when the current time is outside the shift', () => {
    const evaluation = evaluateAccessWindow(
      {
        timezone: 'UTC',
        allowedDays: [1],
        startTime: '18:00',
        endTime: '20:00',
      },
      new Date('2026-07-13T10:00:00.000Z'),
    );

    expect(evaluation.state).toBe('outside_hours');
    expect(evaluation.isActive).toBe(false);
  });

  it('prefers the admin workspace when an operations user also has kitchen permissions', () => {
    const user = buildUser({
      roleAssignments: [
        buildRoleAssignment({
          userId: 'user-1',
          roleId: 'role-ops',
          roleName: 'operations_manager',
          restaurantId: null,
        }),
        buildRoleAssignment({
          userId: 'user-1',
          roleId: 'role-kitchen',
          roleName: 'kitchen',
          restaurantId: 'rest-01',
        }),
      ],
    });

    const permissions = getUserPermissions(user, roles);

    expect(permissions).toContain('activity_logs.read');
    expect(permissions).toContain('orders.accept');
    expect(resolveWorkspaceArea(user, permissions)).toBe('admin');
  });


  it('keeps explicit admin users on the admin workspace even with kitchen permissions', () => {
    const user = buildUser({
      role: 'admin',
      roleAssignments: [
        buildRoleAssignment({
          userId: 'user-1',
          roleId: 'role-ops',
          roleName: 'operations_manager',
          restaurantId: null,
        }),
        buildRoleAssignment({
          userId: 'user-1',
          roleId: 'role-kitchen',
          roleName: 'kitchen',
          restaurantId: 'rest-01',
        }),
      ],
    });

    expect(resolveWorkspaceArea(user, ['orders.accept', 'analytics.read', 'roles.read'])).toBe('admin');
  });
  it('sends kitchen and rider logins to their operational workspaces while keeping role tools available', () => {
    const kitchenUser = buildUser({
      role: 'kitchen',
      roleAssignments: [
        buildRoleAssignment({
          userId: 'user-1',
          roleId: 'role-kitchen',
          roleName: 'kitchen',
          restaurantId: 'rest-01',
        }),
      ],
    });

    expect(getWorkspaceHome('kitchen')).toEqual({ name: 'kitchen-queue' });
    expect(getWorkspaceHome('rider')).toEqual({ name: 'rider-home' });
    expect(canAccessWorkspace('kitchen', kitchenUser, ['profile.manage', 'orders.accept'])).toBe(true);
  });
  it('treats suspended accounts as inactive even inside the time window', () => {
    const user = buildUser({
      status: 'suspended',
      roleAssignments: [
        buildRoleAssignment({
          userId: 'user-1',
          roleId: 'role-ops',
          roleName: 'operations_manager',
          restaurantId: null,
          accessWindow: {
            timezone: 'UTC',
            allowedDays: [1],
            startTime: '09:00',
            endTime: '17:00',
          },
        }),
      ],
    });

    const evaluation = evaluateUserOperationalAccess(user, new Date('2026-07-13T10:00:00.000Z'));
    expect(evaluation.isActive).toBe(false);
    expect(evaluation.message).toContain('suspended');
  });
});

