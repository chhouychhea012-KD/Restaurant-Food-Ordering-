import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth.store';

export function usePermissions() {
  const authStore = useAuthStore();

  const permissions = computed(() => authStore.permissions);
  const has = (permission: string) => authStore.permissions.includes(permission);
  const isRole = (role: string) => authStore.user?.role === role;

  return {
    permissions,
    has,
    isRole,
  };
}
