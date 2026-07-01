<template>
  <div class="space-y-6">
   <section class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <p class="text-xs font-bold uppercase tracking-[0.35em] text-orange-600">Operations Signals</p>
      <h1 class="text-3xl font-extrabold text-slate-900">Notification Center</h1>
    </div>
    <Bell class="text-orange-500" :size="32" />
  </div>

  <!-- Stats Cards -->
  <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
    
    <!-- Card 1: Unread -->
    <div class="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
      <div class="flex items-start justify-between">
        <p class="text-sm font-medium text-slate-500">Unread</p>
        <div class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600">
          New
        </div>
      </div>
      <p class="mt-3 text-4xl font-bold text-slate-900">{{ notificationStore.unreadCount }}</p>
      <p class="mt-2 text-sm text-slate-500">Still waiting for review</p>
    </div>

    <!-- Card 2: Total -->
    <div class="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
      <div class="flex items-start justify-between">
        <p class="text-sm font-medium text-slate-500">Total</p>
        <div class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          All
        </div>
      </div>
      <p class="mt-3 text-4xl font-bold text-slate-900">{{ notificationStore.items.length }}</p>
      <p class="mt-2 text-sm text-slate-500">Notifications in the admin feed</p>
    </div>

    <!-- Card 3: Focus -->
    <div class="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
      <div class="flex items-start justify-between">
        <p class="text-sm font-medium text-slate-500">Filter the notification</p>
        <div class="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-600">
          Active
        </div>
      </div>
      <p class="mt-3 text-4xl font-bold text-slate-900">{{ activeFilterLabel }}</p>
      <p class="mt-2 text-sm text-slate-500">Filtered view for faster review</p>
    </div>

  </div>
</section>

    <SectionCard eyebrow="Admin Notifications" title="Platform activity feed" description="">
      <template #actions>
        <div class="flex flex-wrap gap-3">
          <button class="btn-secondary" type="button" @click="markAllRead" :disabled="!authStore.user || !notificationStore.unreadCount">Mark all read</button>
          <select v-model="filter" class="field-input w-52">
            <option value="all">All notifications</option>
            <option value="unread">Unread only</option>
            <option value="order">Order updates</option>
            <option value="catalog">Catalog</option>
            <option value="system">System</option>
            <option value="account">Account</option>
          </select>
        </div>
      </template>

      <div v-if="filteredNotifications.length" class="space-y-4">
        <article
          v-for="notification in filteredNotifications"
          :key="notification.id"
          class="rounded-[1.75rem] border p-5 shadow-sm transition"
          :class="isRead(notification) ? 'border-slate-200 bg-white/90' : 'border-orange-200 bg-orange-50/50 shadow-orange-100/40'"
        >
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <span class="pill" :class="toneClass(notification.kind)">{{ formatKind(notification.kind) }}</span>
                <span v-if="!isRead(notification)" class="pill bg-slate-900 text-white">Needs review</span>
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
        <p class="mt-2 text-sm text-slate-500">As customer orders and admin operations move through the system, fresh updates will appear here.</p>
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
    return 'All';
  }
  if (filter.value === 'unread') {
    return 'Unread';
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
