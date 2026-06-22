import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { Session, User } from '@/types';
import { getActiveSession, login, logout, register, validateSession } from '@/services/auth.service';
import { dbUsers } from '@/utils/mockDb';
import { getRoleDefinition } from '@/utils/permissions';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const session = ref<Session | null>(getActiveSession());
  const loading = ref(false);
  const error = ref('');
  const roleRevision = ref(0);

  function hydrate() {
    if (!validateSession(session.value)) {
      logout();
      session.value = null;
      user.value = null;
      return;
    }

    user.value = dbUsers().find((entry) => entry.id === session.value?.userId) ?? null;

    if (!user.value) {
      logout();
      session.value = null;
    }
  }

  function refreshCurrentUser() {
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
  }

  const isAuthenticated = computed(() => Boolean(user.value && session.value));
  const permissions = computed(() => {
    roleRevision.value;
    return user.value ? getRoleDefinition(user.value.role)?.permissions ?? [] : [];
  });

  async function performLogin(email: string, password: string) {
    loading.value = true;
    error.value = '';
    try {
      const response = await login({ email, password });
      user.value = response.user;
      session.value = response.session;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to login.';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function performRegister(payload: { name: string; email: string; phone: string; password: string }) {
    loading.value = true;
    error.value = '';
    try {
      const response = await register(payload);
      user.value = response.user;
      session.value = response.session;
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
  }

  hydrate();

  return {
    user,
    session,
    loading,
    error,
    isAuthenticated,
    permissions,
    hydrate,
    refreshCurrentUser,
    setCurrentUser,
    refreshRolePermissions,
    performLogin,
    performRegister,
    performLogout,
  };
});
