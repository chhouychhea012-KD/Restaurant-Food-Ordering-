import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth.store';

export function useAuth() {
  const store = useAuthStore();
  const { user, session, loading, error, isAuthenticated, permissions } = storeToRefs(store);

  return {
    user,
    session,
    loading,
    error,
    isAuthenticated,
    permissions,
    login: store.performLogin,
    register: store.performRegister,
    logout: store.performLogout,
    hydrate: store.hydrate,
  };
}
