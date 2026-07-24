<template>
  <div class="space-y-8">
    <!-- Stats -->
    <!-- <div class="grid gap-4 md:grid-cols-3">
      <div class="surface-card p-6 rounded-xl">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center text-4xl">🛎️</div>
          <div>
            <p class="text-4xl font-bold text-slate-900">{{ notificationStore.unreadCount }}</p>
            <p class="text-sm text-slate-500">Unread Alerts</p>
          </div>
        </div>
      </div>

      <div class="surface-card p-6 rounded-xl">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-4xl">📥</div>
          <div>
            <p class="text-4xl font-bold text-slate-900">{{ notificationStore.items.length }}</p>
            <p class="text-sm text-slate-500">Total Notifications</p>
          </div>
        </div>
      </div>

      <div class="surface-card p-6 rounded-xl">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-brand-100 rounded-xl flex items-center justify-center text-4xl">🔍</div>
          <div>
            <p class="text-3xl font-bold text-slate-900">{{ activeFilterLabel }}</p>
            <p class="text-sm text-slate-500">Current Filter</p>
          </div>
        </div>
      </div>
    </div> -->

    <!-- Notifications Section -->
    <SectionCard 
      eyebrow="Activity Center" 
      title="Important Updates" 
      description="Stay informed about your orders, promotions, and account activity in one place."
    >
      <template #actions>
        <div class="flex flex-wrap gap-3">
          <button class="btn-secondary" :disabled="!hasUnread" @click="markAllRead">
            Mark all as read
          </button>
          <select v-model="filter" class="field-input w-full sm:w-52">
            <option value="all">All Notifications</option>
            <option value="unread">Unread Only</option>
            <option value="order">Order Updates</option>
            <option value="promo">Promotions</option>
            <option value="account">Account</option>
          </select>
        </div>
      </template>

      <div v-if="filteredNotifications.length" class="space-y-5">
        <article
          v-for="notification in filteredNotifications"
          :key="notification.id"
          class="rounded-xl border p-6 shadow-sm hover:shadow transition-all duration-200"
          :class="isRead(notification) ? 'bg-white border-slate-200' : 'bg-brand-50 border-brand-200'"
        >
          <div class="flex gap-5">
            <!-- Icon -->
            <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white text-brand-500 shadow-sm"><component :is="notificationIcon(notification.kind)" :size="24" /></div>

            <!-- Content -->
            <div class="flex-1">
              <div class="flex items-center gap-3">
                <span class="pill text-sm font-medium" :class="toneClass(notification.kind)">
                  {{ formatKind(notification.kind) }}
                </span>
                <span v-if="!isRead(notification)" class="inline-block px-3 py-1 text-xs font-semibold bg-white text-brand-600 rounded-full border border-brand-200">
                  New
                </span>
              </div>

              <h3 class="mt-4 text-xl font-semibold leading-tight text-slate-900">{{ notification.title }}</h3>
              <p class="mt-3 text-slate-600 leading-relaxed">{{ notification.message }}</p>

              <div class="mt-6 flex flex-wrap gap-3">
                <RouterLink
                  v-if="notification.ctaTo && notification.ctaLabel"
                  :to="notificationTarget(notification)"
                  class="btn-primary"
                  @click="markRead(notification.id)"
                >
                  {{ notification.ctaLabel }}
                </RouterLink>
                
                <button 
                  v-if="!isRead(notification)" 
                  class="btn-secondary"
                  @click="markRead(notification.id)"
                >
                  Mark as read
                </button>

                <button 
                  class="text-rose-600 hover:text-rose-700 font-medium text-sm py-2 px-4"
                  @click="removeNotification(notification.id)"
                >
                  Remove
                </button>
              </div>
            </div>

            <!-- Date -->
            <div class="text-xs text-slate-400 font-medium whitespace-nowrap">
              {{ formatShortDate(notification.createdAt) }}
            </div>
          </div>
        </article>
      </div>

      <div v-else class="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-20 text-center">
        <BellOff class="mx-auto mb-4 text-slate-300" :size="52" />
        <p class="text-xl font-medium text-slate-900">No notifications yet</p>
        <p class="text-slate-500 mt-2 max-w-md mx-auto">
          We'll notify you here when there are updates about your orders, promotions, and account activity.
        </p>
      </div>
    </SectionCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { Bell, BellOff, Gift, Package, Settings, UserRound } from 'lucide-vue-next';
import SectionCard from '@/components/common/SectionCard.vue';
import { useAppDialog } from '@/composables/useAppDialog';
import { useAuthStore } from '@/stores/auth.store';
import { useNotificationStore } from '@/stores/notification.store';
import { formatShortDate } from '@/utils/format';

const { confirmDialog } = useAppDialog();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const filter = ref<'all' | 'unread' | 'order' | 'promo' | 'account'>('all');

const filteredNotifications = computed(() => {
  return notificationStore.items.filter((n) => {
    if (filter.value === 'all') return true;
    if (filter.value === 'unread') return !isRead(n);
    return n.kind === filter.value;
  });
});

const hasUnread = computed(() => notificationStore.unreadCount > 0);

function notificationIcon(kind: string) {
  switch (kind) {
    case 'order':
      return Package;
    case 'promo':
      return Gift;
    case 'account':
      return UserRound;
    case 'system':
      return Settings;
    default:
      return Bell;
  }
}

onMounted(() => notificationStore.initialize(authStore.user));

watch(() => authStore.user, (user) => notificationStore.syncUser(user), { immediate: true });

function notificationTarget(notification: any) {
  const ctaTo = notification.ctaTo || '/dashboard';
  const role = authStore.user?.role;
  const looksLikeOrderAction = notification.kind === 'order' || /order/i.test(notification.ctaLabel || '') || /orders/.test(ctaTo);

  if (role === 'kitchen' && looksLikeOrderAction) {
    return '/kitchen';
  }

  if (role === 'rider' && looksLikeOrderAction) {
    return '/rider/deliveries';
  }

  return ctaTo;
}

function isRead(notification: any) {
  return Boolean(authStore.user && notification.readBy.includes(authStore.user.id));
}

function markRead(id: string) {
  if (authStore.user) notificationStore.markRead(id, authStore.user);
}

function markAllRead() {
  if (authStore.user) notificationStore.markEverythingRead(authStore.user);
}

async function removeNotification(id: string) {
  if (!authStore.user) return;

  const confirmed = await confirmDialog({
    title: 'Remove notification',
    message: 'Remove this notification from your feed?',
    confirmLabel: 'Remove notification',
    tone: 'danger',
  });
  if (confirmed) notificationStore.removeNotification(id, authStore.user);
}

function formatKind(kind: string) {
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

function toneClass(kind: string) {
  const colors: Record<string, string> = {
    order: 'bg-sky-100 text-sky-700',
    promo: 'bg-emerald-100 text-emerald-700',
    account: 'bg-violet-100 text-violet-700',
    system: 'bg-slate-100 text-slate-700',
  };
  return colors[kind] || 'bg-slate-100 text-slate-700';
}
</script>

