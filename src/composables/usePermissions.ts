import { computed } from 'vue';
import type { PermissionKey } from '@/types';
import { useAuthStore } from '@/stores/auth.store';

export function usePermissions() {
  const authStore = useAuthStore();

  const permissions = computed(() => authStore.permissions);
  const has = (permission: PermissionKey) => authStore.hasPermission(permission);
  const hasAll = (required: PermissionKey[]) => authStore.hasAllPermissions(required);
  const isRole = (role: string) => authStore.primaryRole === role;

  return {
    permissions,
    has,
    hasAll,
    isRole,
  };
}
