<template>
  <div class="space-y-6">
    <section class="grid gap-4 md:grid-cols-3">
      <StatCard title="Unread" :value="notificationStore.unreadCount" subtitle="Needs review" tone="Orders" />
      <StatCard title="Order alerts" :value="orderNotifications.length" subtitle="Owned restaurant" tone="Scoped" />
      <StatCard title="Latest" :value="latestLabel" subtitle="Most recent update" tone="Live" />
    </section>

    <SectionCard eyebrow="Notifications" title="Restaurant order alerts" description="Only customer order and workflow alerts for your assigned restaurant are shown here.">
      <template #actions>
        <button class="btn-secondary" type="button" :disabled="!notificationStore.unreadCount || !authStore.user" @click="markAllRead">Mark all read</button>
      </template>

      <div v-if="orderNotifications.length" class="space-y-3">
        <article
          v-for="notification in orderNotifications"
          :key="notification.id"
          class="rounded-lg border p-5 transition"
          :class="isRead(notification) ? 'border-slate-200 bg-white' : 'border-orange-200 bg-orange-50/70 shadow-sm shadow-orange-100/50'"
        >
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span class="pill bg-brand-100 text-brand-700">Order</span>
                <span v-if="!isRead(notification)" class="pill bg-emerald-100 text-emerald-700">New</span>
              </div>
              <h3 class="mt-3 text-lg font-bold text-slate-950">{{ notification.title }}</h3>
              <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{{ notification.message }}</p>
            </div>
            <p class="shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{{ formatShortDate(notification.createdAt) }}</p>
          </div>

          <div class="mt-5 flex flex-wrap gap-3">
            <RouterLink v-if="notification.ctaTo" class="btn-primary" :to="notification.ctaTo" @click="markRead(notification.id)">
              {{ notification.ctaLabel ?? 'Open orders' }}
            </RouterLink>
            <button v-if="!isRead(notification)" class="btn-secondary" type="button" @click="markRead(notification.id)">Mark read</button>
          </div>
        </article>
      </div>

      <EmptyState v-else title="No restaurant alerts" message="New customer orders and status updates for your restaurant will appear here." />
    </SectionCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { RouterLink } from 'vue-router';
import type { AppNotification } from '@/types';
import EmptyState from '@/components/common/EmptyState.vue';
import SectionCard from '@/components/common/SectionCard.vue';
import StatCard from '@/components/common/StatCard.vue';
import { useAuthStore } from '@/stores/auth.store';
import { useNotificationStore } from '@/stores/notification.store';
import { formatShortDate } from '@/utils/format';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();

const orderNotifications = computed(() => notificationStore.items.filter((notification) => notification.kind === 'order'));
const latestLabel = computed(() => (orderNotifications.value[0] ? formatShortDate(orderNotifications.value[0].createdAt) : 'None'));

onMounted(() => notificationStore.initialize(authStore.user));

watch(
  () => authStore.user,
  (user) => notificationStore.syncUser(user),
  { immediate: true },
);

function isRead(notification: AppNotification) {
  return Boolean(authStore.user && notification.readBy.includes(authStore.user.id));
}

function markRead(notificationId: string) {
  if (authStore.user) {
    notificationStore.markRead(notificationId, authStore.user);
  }
}

function markAllRead() {
  if (authStore.user) {
    notificationStore.markEverythingRead(authStore.user);
  }
}
</script>