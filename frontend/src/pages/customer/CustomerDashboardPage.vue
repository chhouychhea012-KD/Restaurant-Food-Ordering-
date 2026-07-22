<template>
  <div class="space-y-6">
    <section class="surface-card overflow-hidden">
      <div class="border-b border-orange-100 bg-gradient-to-br from-orange-50 via-white to-emerald-50 p-6 sm:p-8">
        <div class="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.22em] text-brand-600">{{ workspaceEyebrow }}</p>
            <h1 class="mt-3 text-3xl font-extrabold text-slate-950">{{ workspaceTitle }}</h1>
            <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{{ workspaceDescription }}</p>
          </div>
          <RouterLink v-if="primaryAction" :to="primaryAction.to" class="btn-primary">{{ primaryAction.label }}</RouterLink>
        </div>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-3">
      <StatCard v-for="metric in dashboardMetrics" :key="metric.title" :title="metric.title" :value="metric.value" :subtitle="metric.subtitle" :tone="metric.tone" />
    </section>

    <SectionCard :eyebrow="actionSectionEyebrow" :title="actionSectionTitle" description="">
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <RouterLink v-for="action in workspaceActions" :key="action.to" class="surface-muted p-5 transition hover:-translate-y-1 hover:bg-white" :to="action.to">
          <p class="text-sm font-semibold text-slate-900">{{ action.title }}</p>
          <p class="mt-2 text-sm text-slate-500">{{ action.description }}</p>
        </RouterLink>
      </div>
    </SectionCard>

    <SectionCard v-if="isKitchen" eyebrow="Kitchen Orders" title="Current preparation queue" description="">
      <div class="space-y-4">
        <div v-for="order in operationalOrders.slice(0, 4)" :key="order.id" class="surface-muted flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <p class="text-sm text-slate-500">{{ order.id }}</p>
            <p class="text-lg font-semibold text-slate-950">{{ order.restaurantName }}</p>
            <p class="mt-1 text-sm text-slate-500">{{ order.items.length }} items for {{ order.branchName }}</p>
          </div>
          <div class="flex items-center gap-3">
            <StatusBadge :status="order.status" />
            <RouterLink class="text-sm font-semibold text-brand-600" to="/kitchen">Open</RouterLink>
          </div>
        </div>
        <div v-if="!operationalOrders.length" class="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-8 text-center text-sm text-slate-500">
          No kitchen orders need attention right now.
        </div>
      </div>
    </SectionCard>

    <SectionCard v-else-if="isRider" eyebrow="Delivery Work" title="Assigned delivery stack" description="">
      <div class="space-y-4">
        <div v-for="order in operationalOrders.slice(0, 4)" :key="order.id" class="surface-muted flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <p class="text-sm text-slate-500">{{ order.id }}</p>
            <p class="text-lg font-semibold text-slate-950">{{ order.restaurantName }}</p>
            <p class="mt-1 text-sm text-slate-500">{{ order.deliveryAddress }}</p>
          </div>
          <div class="flex items-center gap-3">
            <StatusBadge :status="order.status" />
            <RouterLink class="text-sm font-semibold text-brand-600" to="/rider/deliveries">Update</RouterLink>
          </div>
        </div>
        <div v-if="!operationalOrders.length" class="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-8 text-center text-sm text-slate-500">
          No active deliveries assigned right now.
        </div>
      </div>
    </SectionCard>

    <SectionCard v-else eyebrow="Recent Orders" title="Your latest activity">
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
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import SectionCard from '@/components/common/SectionCard.vue';
import StatCard from '@/components/common/StatCard.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { listOrdersForRestaurant, listRiderOrders } from '@/services/order.service';
import { useAuthStore } from '@/stores/auth.store';
import { useNotificationStore } from '@/stores/notification.store';
import { useOrderStore } from '@/stores/order.store';
import type { Order } from '@/types';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const orderStore = useOrderStore();
const operationalOrders = ref<Order[]>([]);

const isKitchen = computed(() => authStore.user?.role === 'kitchen');
const isRider = computed(() => authStore.user?.role === 'rider');
const isCustomer = computed(() => authStore.user?.role === 'customer');

const workspaceEyebrow = computed(() => {
  if (isKitchen.value) return 'Kitchen Staff';
  if (isRider.value) return 'Delivery Rider';
  return 'Customer Workspace';
});

const workspaceTitle = computed(() => {
  if (isKitchen.value) return 'Kitchen dashboard';
  if (isRider.value) return 'Rider dashboard';
  return 'Your account overview';
});

const workspaceDescription = computed(() => {
  if (isKitchen.value) return 'Use the same clean customer interface, with quick access to kitchen queue actions and profile tools.';
  if (isRider.value) return 'Use the same clean customer interface, with delivery actions, availability, and profile tools ready.';
  return 'Orders, points, saved details, and account activity in one simple place.';
});

const primaryAction = computed(() => {
  if (isKitchen.value) return { label: 'Open kitchen queue', to: '/kitchen' };
  if (isRider.value) return { label: 'Open deliveries', to: '/rider/deliveries' };
  return { label: 'Browse food', to: '/restaurants' };
});

const dashboardMetrics = computed(() => {
  if (isKitchen.value) {
    return [
      { title: 'Queue orders', value: operationalOrders.value.length, subtitle: 'Assigned restaurant orders', tone: 'Live' },
      { title: 'Shift access', value: authStore.accessEvaluation.state === 'active' ? 'Active' : 'Paused', subtitle: authStore.accessEvaluation.message, tone: 'Kitchen' },
      { title: 'Notifications', value: notificationStore.unreadCount, subtitle: 'Workspace updates', tone: 'New' },
    ];
  }

  if (isRider.value) {
    return [
      { title: 'Deliveries', value: operationalOrders.value.length, subtitle: 'Assigned or available trips', tone: 'Live' },
      { title: 'Availability', value: authStore.user?.shiftActive ? 'Online' : 'Offline', subtitle: 'Rider shift status', tone: 'Rider' },
      { title: 'Notifications', value: notificationStore.unreadCount, subtitle: 'Delivery updates', tone: 'New' },
    ];
  }

  return [
    { title: 'Loyalty points', value: authStore.user?.loyaltyPoints ?? 0, subtitle: 'Earned from completed orders', tone: '+42 pts' },
    { title: 'Saved addresses', value: authStore.user?.addresses?.length ?? 0, subtitle: 'Fast checkout defaults', tone: 'Updated' },
    { title: 'Recent orders', value: orderStore.orders.length, subtitle: 'Persisted in local mock history', tone: '+3 this week' },
  ];
});

const actionSectionEyebrow = computed(() => (isCustomer.value ? 'Customer Workspace' : 'Role Options'));
const actionSectionTitle = computed(() => (isCustomer.value ? 'Account shortcuts' : 'Your available tools'));

const workspaceActions = computed(() => {
  if (isKitchen.value) {
    return [
      { title: 'Kitchen queue', description: 'Start preparing and mark orders ready.', to: '/kitchen' },
      { title: 'Customer view', description: 'Browse the customer storefront.', to: '/restaurants' },
      { title: 'Profile', description: 'Update your name, phone, and profile image.', to: '/profile' },
      { title: 'Notifications', description: 'Check account and operations updates.', to: '/notifications' },
    ];
  }

  if (isRider.value) {
    return [
      { title: 'Delivery tasks', description: 'Update pickup and delivery progress.', to: '/rider/deliveries' },
      { title: 'Rider console', description: 'Manage availability and assigned work.', to: '/rider' },
      { title: 'Profile', description: 'Update your account and profile photo.', to: '/profile' },
      { title: 'Notifications', description: 'Check delivery and account updates.', to: '/notifications' },
    ];
  }

  return [
    { title: 'Profile', description: 'View and edit your account details.', to: '/profile' },
    { title: 'Addresses', description: 'Manage delivery locations and defaults.', to: '/addresses' },
    { title: 'Order history', description: 'Review your full purchase activity.', to: '/orders' },
    { title: 'Notifications', description: 'Check order, promo, and account updates.', to: '/notifications' },
  ];
});

async function loadWorkspaceData() {
  operationalOrders.value = [];
  if (!authStore.user) return;

  if (isKitchen.value && authStore.user.restaurantId) {
    operationalOrders.value = await listOrdersForRestaurant(authStore.user.restaurantId);
    return;
  }

  if (isRider.value) {
    operationalOrders.value = await listRiderOrders(authStore.user.name);
    return;
  }

  if (isCustomer.value) {
    await orderStore.loadForCustomer(authStore.user.id);
  }
}

onMounted(() => {
  notificationStore.initialize(authStore.user);
  void loadWorkspaceData();
});

watch(
  () => authStore.user,
  (user) => {
    notificationStore.syncUser(user);
    void loadWorkspaceData();
  },
  { immediate: true },
);
</script>