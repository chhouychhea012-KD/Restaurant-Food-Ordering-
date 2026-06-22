import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { AppNotification, User } from '@/types';
import {
  deleteNotification,
  getNotificationsUpdatedEventName,
  isNotificationRead,
  listNotificationsForUser,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/services/notification.service';

export const useNotificationStore = defineStore('notifications', () => {
  const items = ref<AppNotification[]>([]);
  const currentUser = ref<User | null>(null);
  const initialized = ref(false);

  const unreadCount = computed(() => {
    if (!currentUser.value) {
      return 0;
    }

    return items.value.filter((notification) => !isNotificationRead(notification, currentUser.value!.id)).length;
  });

  function refreshForUser(user: User | null) {
    currentUser.value = user;
    items.value = user ? listNotificationsForUser(user) : [];
  }

  function initialize(user: User | null) {
    if (!initialized.value) {
      window.addEventListener(getNotificationsUpdatedEventName(), () => {
        refreshForUser(currentUser.value);
      });
      initialized.value = true;
    }

    refreshForUser(user);
  }

  function syncUser(user: User | null) {
    if (!initialized.value) {
      initialize(user);
      return;
    }

    refreshForUser(user);
  }

  function markRead(notificationId: string, user: User) {
    markNotificationRead(notificationId, user.id);
    refreshForUser(user);
  }

  function markEverythingRead(user: User) {
    markAllNotificationsRead(user);
    refreshForUser(user);
  }

  function removeNotification(notificationId: string, user: User) {
    deleteNotification(notificationId, user);
    refreshForUser(user);
  }

  return {
    items,
    unreadCount,
    initialize,
    syncUser,
    markRead,
    markEverythingRead,
    removeNotification,
  };
});
