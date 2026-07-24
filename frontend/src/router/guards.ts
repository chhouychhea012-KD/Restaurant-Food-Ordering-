import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import type { PermissionKey } from '@/types';
import type { WorkspaceArea } from '@/utils/access';
import { useAuthStore } from '@/stores/auth.store';
import { canAccessWorkspace, getUserStatusLabel } from '@/utils/access';

export function authGuard(to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) {
  const authStore = useAuthStore();
  authStore.hydrate();

  const guestOnly = to.matched.some((record) => Boolean(record.meta.guestOnly));
  const requiresAuth = to.matched.some((record) => Boolean(record.meta.requiresAuth));
  const workspace = getMatchedWorkspace(to);
  const permissions = getMatchedPermissions(to);
  const requiresActiveAccess = to.matched.some((record) => record.meta.requiresActiveAccess !== false);

  if (guestOnly && authStore.isAuthenticated) {
    next(authStore.defaultWorkspaceRoute);
    return;
  }

  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } });
    return;
  }

  if (requiresAuth && !authStore.isAccountActive) {
    next({
      name: 'forbidden',
      query: {
        reason: 'account-status',
        status: authStore.user?.status ? getUserStatusLabel(authStore.user.status) : 'Unknown',
      },
    });
    return;
  }

  if (workspace && !canAccessWorkspace(workspace, authStore.user, authStore.permissions)) {
    next({ name: 'forbidden', query: { reason: 'workspace' } });
    return;
  }

  if (requiresAuth && workspace !== 'customer' && workspace !== 'rider' && requiresActiveAccess && !authStore.accessEvaluation.isActive) {
    next({
      name: 'forbidden',
      query: {
        reason: 'access-window',
        detail: authStore.accessEvaluation.message,
      },
    });
    return;
  }

  if (permissions.length && !authStore.hasAllPermissions(permissions)) {
    next({ name: 'forbidden', query: { reason: 'permission' } });
    return;
  }

  next();
}

function getMatchedWorkspace(to: RouteLocationNormalized) {
  return to.matched.map((record) => record.meta.workspace as WorkspaceArea | undefined).find(Boolean);
}

function getMatchedPermissions(to: RouteLocationNormalized) {
  return [
    ...new Set(
      to.matched.flatMap((record) => {
        const singular = record.meta.permission as PermissionKey | undefined;
        const plural = (record.meta.permissions as PermissionKey[] | undefined) ?? [];
        return singular ? [singular, ...plural] : plural;
      }),
    ),
  ];
}
