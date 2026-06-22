import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

export function authGuard(to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) {
  const authStore = useAuthStore();
  authStore.hydrate();

  const guestOnly = to.matched.some((record) => Boolean(record.meta.guestOnly));
  const requiresAuth = to.matched.some((record) => Boolean(record.meta.requiresAuth));
  const roles = getMatchedRoles(to);
  const permissions = getMatchedPermissions(to);

  if (guestOnly && authStore.isAuthenticated) {
    next(getDefaultRoute(authStore.user?.role));
    return;
  }

  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } });
    return;
  }

  if (roles.length && (!authStore.user || !roles.includes(authStore.user.role))) {
    next(authStore.isAuthenticated ? { name: 'forbidden' } : { name: 'login', query: { redirect: to.fullPath } });
    return;
  }

  if (permissions.length && permissions.some((permission) => !authStore.permissions.includes(permission))) {
    next({ name: 'forbidden' });
    return;
  }

  next();
}

function getMatchedRoles(to: RouteLocationNormalized) {
  return [...new Set(to.matched.flatMap((record) => ((record.meta.roles as string[] | undefined) ?? [])))];
}

function getMatchedPermissions(to: RouteLocationNormalized) {
  return [...new Set(to.matched.flatMap((record) => {
    const permission = record.meta.permission as string | undefined;
    return permission ? [permission] : [];
  }))];
}

function getDefaultRoute(role?: string) {
  switch (role) {
    case 'admin':
      return { name: 'admin-overview' };
    case 'owner':
      return { name: 'restaurant-overview' };
    case 'kitchen':
      return { name: 'kitchen-queue' };
    case 'rider':
      return { name: 'rider-home' };
    case 'customer':
    default:
      return { name: 'customer-home' };
  }
}
