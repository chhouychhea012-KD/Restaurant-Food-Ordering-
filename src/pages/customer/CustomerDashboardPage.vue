<template>
  <div class="space-y-6">
    <section class="grid gap-4 md:grid-cols-3">
      <StatCard title="Loyalty points" :value="authStore.user?.loyaltyPoints ?? 0" subtitle="Earned from completed orders" tone="+42 pts" />
      <StatCard title="Saved addresses" :value="authStore.user?.addresses?.length ?? 0" subtitle="Fast checkout defaults" tone="Updated" />
      <StatCard title="Recent orders" :value="orderStore.orders.length" subtitle="Persisted in local mock history" tone="+3 this week" />
    </section>

    <SectionCard eyebrow="Customer Workspace" title="Your account overview" description="These panels demonstrate protected customer pages using the same auth state as checkout, tracking, and your personal notification feed.">
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <RouterLink class="surface-muted p-5 transition hover:-translate-y-1 hover:bg-white" to="/profile">
          <p class="text-sm font-semibold text-slate-900">Profile</p>
          <p class="mt-2 text-sm text-slate-500">View and edit your account details.</p>
        </RouterLink>
        <RouterLink class="surface-muted p-5 transition hover:-translate-y-1 hover:bg-white" to="/addresses">
          <p class="text-sm font-semibold text-slate-900">Addresses</p>
          <p class="mt-2 text-sm text-slate-500">Manage delivery locations and defaults.</p>
        </RouterLink>
        <RouterLink class="surface-muted p-5 transition hover:-translate-y-1 hover:bg-white" to="/orders">
          <p class="text-sm font-semibold text-slate-900">Order history</p>
          <p class="mt-2 text-sm text-slate-500">Review your full purchase activity.</p>
        </RouterLink>
        <RouterLink class="surface-muted p-5 transition hover:-translate-y-1 hover:bg-white" to="/notifications">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-semibold text-slate-900">Notifications</p>
              <p class="mt-2 text-sm text-slate-500">Check order, promo, and account updates.</p>
            </div>
            <span v-if="notificationStore.unreadCount" class="pill bg-brand-500 text-white">{{ notificationStore.unreadCount }}</span>
          </div>
        </RouterLink>
      </div>
    </SectionCard>

    <SectionCard eyebrow="Recent Orders" title="Your latest activity">
      <div class="space-y-4">
        <div v-for="order in orderStore.orders.slice(0, 3)" :key="order.id" class="surface-muted flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <p class="text-sm text-slate-500">{{ order.id }}</p>
            <p class="text-lg font-semibold text-slate-950">{{ order.restaurantName }}</p>
          </div>
          <div class="flex items-center gap-4">
            <StatusBadge :status="order.status" />
            <RouterLink class="text-sm font-semibold text-brand-600" :to="{ path: '/track-order', query: { orderId: order.id } }">Track</RouterLink>
          </div>
        </div>
      </div>
    </SectionCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { RouterLink } from 'vue-router';
import SectionCard from '@/components/common/SectionCard.vue';
import StatCard from '@/components/common/StatCard.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { useAuthStore } from '@/stores/auth.store';
import { useNotificationStore } from '@/stores/notification.store';
import { useOrderStore } from '@/stores/order.store';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const orderStore = useOrderStore();

onMounted(() => {
  notificationStore.initialize(authStore.user);
  if (authStore.user) {
    orderStore.loadForCustomer(authStore.user.id);
  }
});

watch(
  () => authStore.user,
  (user) => {
    notificationStore.syncUser(user);
  },
  { immediate: true },
);
</script>
