<template>
  <div class="grid gap-6 xl:grid-cols-[1fr_340px]">
    <SectionCard eyebrow="Live Tracking" title="Follow your latest order" description="Order timelines update from the same stored order state that operations views use.">
      <div v-if="order" class="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          <div class="surface-muted mb-5 flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <p class="text-sm text-slate-500">{{ order.id }}</p>
              <h3 class="mt-1 text-2xl font-bold text-slate-950">{{ order.restaurantName }}</h3>
            </div>
            <StatusBadge :status="order.status" />
          </div>
          <OrderTimeline :timeline="order.timeline" />
        </div>
        <div class="space-y-4">
          <div class="surface-muted p-5">
            <p class="text-sm font-semibold text-slate-900">Delivery address</p>
            <p class="mt-2 text-sm text-slate-600">{{ order.deliveryAddress }}</p>
          </div>
          <div class="surface-muted p-5">
            <p class="text-sm font-semibold text-slate-900">Assigned rider</p>
            <p class="mt-2 text-sm text-slate-600">{{ order.riderName ?? 'Waiting for assignment' }}</p>
          </div>
        </div>
      </div>
      <EmptyState v-else title="No active order found" message="Place a new order or review your order history from the customer dashboard." />
    </SectionCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import EmptyState from '@/components/common/EmptyState.vue';
import SectionCard from '@/components/common/SectionCard.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import OrderTimeline from '@/components/orders/OrderTimeline.vue';
import { useAuthStore } from '@/stores/auth.store';
import { useOrderStore } from '@/stores/order.store';

const authStore = useAuthStore();
const orderStore = useOrderStore();
const route = useRoute();

const requestedOrderId = computed(() => (typeof route.query.orderId === 'string' ? route.query.orderId : null));
const order = computed(() => {
  if (requestedOrderId.value) {
    return orderStore.orders.find((entry) => entry.id === requestedOrderId.value) ?? null;
  }

  return orderStore.activeOrder ?? orderStore.orders[0] ?? null;
});

onMounted(() => {
  if (authStore.user) {
    orderStore.loadForCustomer(authStore.user.id);
  }
});
</script>
