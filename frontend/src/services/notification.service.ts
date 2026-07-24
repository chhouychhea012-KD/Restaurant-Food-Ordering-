import type { AppNotification, NotificationKind, User } from '@/types';
import api from '@/services/api';
import { unwrap, useBackendApi } from '@/services/backend';
import { cachedGet, clearApiCache } from '@/services/request-cache';
import { getUserPermissions, resolveWorkspaceArea } from '@/utils/access';
import { dbNotifications, dbRoles, saveNotifications } from '@/utils/mockDb';

const notificationsUpdatedEvent = 'flavorfleet:notifications-updated';

function emitNotificationsUpdated() {
  window.dispatchEvent(new CustomEvent(notificationsUpdatedEvent));
}

function sortNotifications(notifications: AppNotification[]) {
  return [...notifications].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

function isNotificationDue(notification: AppNotification) {
  return !notification.scheduledAt || new Date(notification.scheduledAt).getTime() <= Date.now();
}

function matchesAudienceRole(notification: AppNotification, user: User) {
  if (notification.userId) {
    return notification.userId === user.id;
  }

  const workspaceArea = resolveWorkspaceArea(user, getUserPermissions(user, dbRoles()));
  if (workspaceArea === 'customer') {
    return notification.audienceRole === 'customer';
  }

  if (workspaceArea === 'admin') {
    return notification.audienceRole === 'admin';
  }

  return false;
}

export function getNotificationsUpdatedEventName() {
  return notificationsUpdatedEvent;
}

export async function listNotificationsForUser(user: User) {
  if (useBackendApi) return cachedGet<AppNotification[]>('/notifications', undefined, 8_000);
  return sortNotifications(dbNotifications().filter((notification) => isNotificationDue(notification) && matchesAudienceRole(notification, user)));
}

export function isNotificationRead(notification: AppNotification, userId: string) {
  return notification.readBy.includes(userId);
}

export async function countUnreadNotifications(user: User) {
  return (await listNotificationsForUser(user)).filter((notification) => !isNotificationRead(notification, user.id)).length;
}

export async function createNotification(payload: {
  title: string;
  message: string;
  kind: NotificationKind;
  audienceRole: 'admin' | 'customer';
  userId?: string | null;
  ctaLabel?: string;
  ctaTo?: string;
  createdAt?: string;
  scheduledAt?: string | null;
}) {
  if (useBackendApi) { const notification = unwrap<AppNotification>(await api.post('/notifications', payload)); clearApiCache('/notifications'); return notification; }
  const notifications = dbNotifications();
  const notification: AppNotification = {
    id: `notif-${crypto.randomUUID()}`,
    title: payload.title.trim(),
    message: payload.message.trim(),
    kind: payload.kind,
    audienceRole: payload.audienceRole,
    userId: payload.userId ?? null,
    ctaLabel: payload.ctaLabel?.trim(),
    ctaTo: payload.ctaTo?.trim(),
    scheduledAt: payload.scheduledAt ?? null,
    createdAt: payload.createdAt ?? new Date().toISOString(),
    readBy: [],
  };

  saveNotifications([notification, ...notifications]);
  emitNotificationsUpdated();
  return notification;
}

export async function markNotificationRead(notificationId: string, userId: string) {
  if (useBackendApi) { await api.patch('/notifications/' + notificationId + '/read'); clearApiCache('/notifications'); return true; }
  let changed = false;
  const nextNotifications = dbNotifications().map((notification) => {
    if (notification.id !== notificationId || notification.readBy.includes(userId)) {
      return notification;
    }

    changed = true;
    return {
      ...notification,
      readBy: [...notification.readBy, userId],
    };
  });

  if (changed) {
    saveNotifications(nextNotifications);
    emitNotificationsUpdated();
  }

  return changed;
}

export async function markAllNotificationsRead(user: User) {
  if (useBackendApi) { await api.patch('/notifications/read-all'); clearApiCache('/notifications'); return; }
  const nextNotifications = dbNotifications().map((notification) => {
    const canSee = isNotificationDue(notification) && matchesAudienceRole(notification, user);
    if (!canSee || notification.readBy.includes(user.id)) {
      return notification;
    }

    return {
      ...notification,
      readBy: [...notification.readBy, user.id],
    };
  });

  saveNotifications(nextNotifications);
  emitNotificationsUpdated();
}

export async function deleteNotification(notificationId: string, user: User) {
  if (useBackendApi) { await api.delete('/notifications/' + notificationId); clearApiCache('/notifications'); return; }
  const nextNotifications = dbNotifications().filter((notification) => {
    if (notification.id !== notificationId) {
      return true;
    }

    return !matchesAudienceRole(notification, user);
  });

  saveNotifications(nextNotifications);
  emitNotificationsUpdated();
}
