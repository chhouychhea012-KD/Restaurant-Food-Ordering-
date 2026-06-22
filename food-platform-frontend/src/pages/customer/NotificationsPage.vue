<template>
  <div class="space-y-6">
    <section class="grid gap-4 md:grid-cols-3">
      <div class="surface-card p-5">
        <p class="text-sm font-semibold text-slate-900">Unread alerts</p>
        <p class="mt-2 text-3xl font-bold text-slate-950">{{ notificationStore.unreadCount }}</p>
        <p class="mt-2 text-sm text-slate-500">Fresh updates waiting for your attention</p>
      </div>
      <div class="surface-card p-5">
        <p class="text-sm font-semibold text-slate-900">Total notifications</p>
        <p class="mt-2 text-3xl font-bold text-slate-950">{{ notificationStore.items.length }}</p>
        <p class="mt-2 text-sm text-slate-500">Stored in your customer activity feed</p>
      </div>
      <div class="surface-card p-5">
        <p class="text-sm font-semibold text-slate-900">Active filter</p>
        <p class="mt-2 text-2xl font-bold text-slate-950">{{ activeFilterLabel }}</p>
        <p class="mt-2 text-sm text-slate-500">Switch views to focus on order, promo, or system updates</p>
      </div>
    </section>

    <SectionCard eyebrow="Customer Notifications" title="Updates that matter to your order journey" description="This notification module helps customers understand order changes, promotions, and account activity clearly from one easy-to-read page.">
      <template #actions>
        <div class="flex flex-wrap gap-3">
          <button class="btn-secondary" type="button" @click="markAllRead" :disabled="!authStore.user || !notificationStore.unreadCount">Mark all read</button>
          <select v-model="filter" class="field-input w-52">
            <option value="all">All notifications</option>
            <option value="unread">Unread only</option>
            <option value="order">Order updates</option>
            <option value="promo">Promotions</option>
            <option value="account">Account</option>
            <option value="system">System</option>
          </select>
        </div>
      </template>

      <div v-if="filteredNotifications.length" class="space-y-4">
        <article
          v-for="notification in filteredNotifications"
          :key="notification.id"
          class="rounded-[1.75rem] border p-5 shadow-sm transition"
          :class="isRead(notification) ? 'border-slate-200 bg-white/90' : 'border-brand-200 bg-brand-50/50 shadow-brand-100/40'"
        >
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <span class="pill" :class="toneClass(notification.kind)">{{ formatKind(notification.kind) }}</span>
                <span v-if="!isRead(notification)" class="pill bg-slate-900 text-white">New</span>
              </div>
              <h3 class="mt-3 text-xl font-bold text-slate-950">{{ notification.title }}</h3>
              <p class="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{{ notification.message }}</p>
            </div>
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{{ formatShortDate(notification.createdAt) }}</p>
          </div>

          <div class="mt-5 flex flex-wrap items-center gap-3">
            <RouterLink
              v-if="notification.ctaTo && notification.ctaLabel"
              :to="notification.ctaTo"
              class="btn-primary"
              @click="markRead(notification.id)"
            >
              {{ notification.ctaLabel }}
            </RouterLink>
            <button v-if="!isRead(notification)" class="btn-secondary" type="button" @click="markRead(notification.id)">Mark as read</button>
            <button class="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-100" type="button" @click="removeNotification(notification.id)">Remove</button>
          </div>
        </article>
      </div>

      <div v-else class="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50/80 p-10 text-center">
        <p class="text-lg font-semibold text-slate-900">No notifications for this filter</p>
        <p class="mt-2 text-sm text-slate-500">Your customer alerts will appear here as orders, promotions, and account events are created.</p>
      </div>
    </SectionCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import type { AppNotification, NotificationKind } from '@/types';
import SectionCard from '@/components/common/SectionCard.vue';
import { useAuthStore } from '@/stores/auth.store';
import { useNotificationStore } from '@/stores/notification.store';
import { formatShortDate } from '@/utils/format';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const filter = ref<'all' | 'unread' | NotificationKind>('all');

const filteredNotifications = computed(() => {
  return notificationStore.items.filter((notification) => {
    if (filter.value === 'all') {
      return true;
    }
    if (filter.value === 'unread') {
      return !isRead(notification);
    }
    return notification.kind === filter.value;
  });
});

const activeFilterLabel = computed(() => {
  if (filter.value === 'all') {
    return 'All notifications';
  }
  if (filter.value === 'unread') {
    return 'Unread only';
  }
  return formatKind(filter.value);
});

onMounted(() => {
  notificationStore.initialize(authStore.user);
});

watch(
  () => authStore.user,
  (user) => {
    notificationStore.syncUser(user);
  },
  { immediate: true },
);

function isRead(notification: AppNotification) {
  return Boolean(authStore.user && notification.readBy.includes(authStore.user.id));
}

function markRead(notificationId: string) {
  if (!authStore.user) {
    return;
  }

  notificationStore.markRead(notificationId, authStore.user);
}

function markAllRead() {
  if (!authStore.user) {
    return;
  }

  notificationStore.markEverythingRead(authStore.user);
}

function removeNotification(notificationId: string) {
  if (!authStore.user) {
    return;
  }

  notificationStore.removeNotification(notificationId, authStore.user);
}

function formatKind(kind: NotificationKind) {
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

function toneClass(kind: NotificationKind) {
  switch (kind) {
    case 'order':
      return 'bg-sky-100 text-sky-700';
    case 'promo':
      return 'bg-emerald-100 text-emerald-700';
    case 'catalog':
      return 'bg-amber-100 text-amber-700';
    case 'account':
      return 'bg-violet-100 text-violet-700';
    case 'system':
    default:
      return 'bg-slate-100 text-slate-700';
  }
}
</script>
