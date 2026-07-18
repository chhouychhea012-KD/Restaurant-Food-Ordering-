import type { AppNotification, NotificationKind, User } from '@/types';
import { getUserPermissions, resolveWorkspaceArea } from '@/utils/access';
import { dbNotifications, dbRoles, saveNotifications } from '@/utils/mockDb';

const notificationsUpdatedEvent = 'flavorfleet:notifications-updated';

function emitNotificationsUpdated() {
  window.dispatchEvent(new CustomEvent(notificationsUpdatedEvent));
}

function sortNotifications(notifications: AppNotification[]) {
  return [...notifications].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

function matchesAudienceRole(notification: AppNotification, user: User) {
  if (notification.userId) {
    return notification.userId === user.id;
  }

  const workspaceArea = resolveWorkspaceArea(user, getUserPermissions(user, dbRoles()));
  const audienceRole = workspaceArea === 'customer' ? 'customer' : 'admin';
  return notification.audienceRole === audienceRole;
}

export function getNotificationsUpdatedEventName() {
  return notificationsUpdatedEvent;
}

export function listNotificationsForUser(user: User) {
  return sortNotifications(dbNotifications().filter((notification) => matchesAudienceRole(notification, user)));
}

export function isNotificationRead(notification: AppNotification, userId: string) {
  return notification.readBy.includes(userId);
}

export function countUnreadNotifications(user: User) {
  return listNotificationsForUser(user).filter((notification) => !isNotificationRead(notification, user.id)).length;
}

export function createNotification(payload: {
  title: string;
  message: string;
  kind: NotificationKind;
  audienceRole: 'admin' | 'customer';
  userId?: string | null;
  ctaLabel?: string;
  ctaTo?: string;
  createdAt?: string;
}) {
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
    createdAt: payload.createdAt ?? new Date().toISOString(),
    readBy: [],
  };

  saveNotifications([notification, ...notifications]);
  emitNotificationsUpdated();
  return notification;
}

export function markNotificationRead(notificationId: string, userId: string) {
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

export function markAllNotificationsRead(user: User) {
  const nextNotifications = dbNotifications().map((notification) => {
    const canSee = matchesAudienceRole(notification, user);
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

export function deleteNotification(notificationId: string, user: User) {
  const nextNotifications = dbNotifications().filter((notification) => {
    if (notification.id !== notificationId) {
      return true;
    }

    return !matchesAudienceRole(notification, user);
  });

  saveNotifications(nextNotifications);
  emitNotificationsUpdated();
}
