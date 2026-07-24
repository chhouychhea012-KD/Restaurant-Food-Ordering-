import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { PermissionKey, Session, User } from '@/types';
import { getActiveSession, getCurrentUser, login, logout, readCachedCurrentUser, register, validateSession } from '@/services/auth.service';
import { useBackendApi } from '@/services/backend';
import { startRealtimeClient, stopRealtimeClient } from '@/services/realtime/sse-client';
import { dbRoles, dbUsers } from '@/utils/mockDb';
import {
  evaluateUserOperationalAccess,
  getPrimaryRoleName,
  getUserPermissions,
  getWorkspaceHome,
  isUserStatusActive,
  resolveWorkspaceArea,
} from '@/utils/access';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const session = ref<Session | null>(getActiveSession());
  const loading = ref(false);
  const error = ref('');
  const roleRevision = ref(0);
  const serverPermissions = ref<PermissionKey[]>(session.value?.permissions ?? []);

  function hydrate() {
    if (!validateSession(session.value)) {
      logout();
      session.value = null;
      user.value = null;
      serverPermissions.value = [];
      return;
    }

    if (useBackendApi) {
      user.value = readCachedCurrentUser();
      serverPermissions.value = session.value?.permissions ?? serverPermissions.value;
      void refreshCurrentUser();
      return;
    }

    user.value = dbUsers().find((entry) => entry.id === session.value?.userId) ?? null;

    if (!user.value) {
      logout();
      session.value = null;
    }
  }

  async function refreshCurrentUser() {
    if (useBackendApi) {
      const nextUser = await getCurrentUser().catch(() => null);
      user.value = nextUser;
      serverPermissions.value = (nextUser as (User & { permissions?: PermissionKey[] }) | null)?.permissions ?? session.value?.permissions ?? [];
      return;
    }

    if (!user.value) {
      return;
    }

    user.value = dbUsers().find((entry) => entry.id === user.value?.id) ?? null;
  }

  function setCurrentUser(nextUser: User | null) {
    user.value = nextUser;
  }

  function refreshRolePermissions() {
    roleRevision.value += 1;
    refreshCurrentUser();
  }

  const isAuthenticated = computed(() => Boolean(user.value && session.value));
  const permissions = computed<PermissionKey[]>(() => {
    void roleRevision.value;
    return useBackendApi ? serverPermissions.value : getUserPermissions(user.value, dbRoles());
  });
  const primaryRole = computed(() => getPrimaryRoleName(user.value));
  const isAccountActive = computed(() => isUserStatusActive(user.value?.status));
  const accessEvaluation = computed(() => evaluateUserOperationalAccess(user.value));
  const workspaceArea = computed(() => resolveWorkspaceArea(user.value, permissions.value));
  const defaultWorkspaceRoute = computed(() => getWorkspaceHome(workspaceArea.value));

  function hasPermission(permission: PermissionKey) {
    return permissions.value.includes(permission);
  }

  function hasAllPermissions(required: readonly PermissionKey[]) {
    return required.every((permission) => permissions.value.includes(permission));
  }

  async function performLogin(email: string, password: string) {
    loading.value = true;
    error.value = '';
    try {
      const response = await login({ email, password });
      user.value = response.user;
      session.value = response.session;
      serverPermissions.value = response.session.permissions ?? [];
      startRealtimeClient();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to login.';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function performRegister(payload: { name: string; email: string; password: string; phone?: string }) {
    loading.value = true;
    error.value = '';
    try {
      const response = await register(payload);
      user.value = response.user;
      session.value = response.session;
      serverPermissions.value = response.session.permissions ?? [];
      startRealtimeClient();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to register.';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function performLogout() {
    logout();
    user.value = null;
    session.value = null;
    serverPermissions.value = [];
  }

  hydrate();

  return {
    user,
    session,
    loading,
    error,
    isAuthenticated,
    permissions,
    primaryRole,
    isAccountActive,
    accessEvaluation,
    workspaceArea,
    defaultWorkspaceRoute,
    hydrate,
    refreshCurrentUser,
    setCurrentUser,
    refreshRolePermissions,
    hasPermission,
    hasAllPermissions,
    performLogin,
    performRegister,
    performLogout,
  };
});

