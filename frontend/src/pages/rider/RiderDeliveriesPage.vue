<template>
  <SectionCard eyebrow="Delivery Actions" title="Update trip progress" description="Pickup and delivery changes update customer tracking, admin orders, and restaurant operations.">
    <template #actions>
      <button class="btn-secondary" type="button" :disabled="loading" @click="load">Refresh</button>
    </template>

    <div v-if="orders.length" class="space-y-4">
      <div v-for="order in orders" :key="order.id" class="surface-muted p-5">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="min-w-0">
            <p class="text-sm text-slate-500">{{ order.id }} - {{ order.branchName }}</p>
            <h3 class="text-lg font-semibold text-slate-950">{{ order.restaurantName }}</h3>
            <p class="mt-1 text-sm text-slate-500">{{ order.deliveryAddress }}</p>
            <p class="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{{ order.riderName ? 'Assigned to ' + order.riderName : 'Ready for pickup' }}</p>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <StatusBadge :status="order.status" />
            <button v-if="canPickup(order)" class="btn-secondary px-3 py-2" :disabled="updatingId === order.id" @click="update(order, 'PICKED_UP', 'Rider picked up order')">Pick up</button>
            <button v-if="canStartDelivery(order)" class="btn-secondary px-3 py-2" :disabled="updatingId === order.id" @click="update(order, 'ON_THE_WAY', 'Rider is on the way')">On the way</button>
            <button v-if="canDeliver(order)" class="btn-primary px-3 py-2" :disabled="updatingId === order.id" @click="update(order, 'DELIVERED', 'Rider completed delivery')">Delivered</button>
          </div>
        </div>
      </div>
    </div>

    <EmptyState v-else title="No rider deliveries" message="Ready pickup orders and your assigned deliveries will appear here." />
    <p v-if="message" class="mt-5 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ message }}</p>
    <p v-if="error" class="mt-5 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600">{{ error }}</p>
  </SectionCard>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { Order } from '@/types';
import EmptyState from '@/components/common/EmptyState.vue';
import SectionCard from '@/components/common/SectionCard.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { useAuthStore } from '@/stores/auth.store';
import { useSocket } from '@/composables/useSocket';
import { listRiderOrders, updateOrderStatus } from '@/services/order.service';

const authStore = useAuthStore();
const orders = ref<Order[]>([]);
const loading = ref(false);
const updatingId = ref<string | null>(null);
const message = ref('');
const error = ref('');

async function load() {
  if (!authStore.user) return;
  loading.value = true;
  try {
    orders.value = await listRiderOrders(authStore.user.name);
  } finally {
    loading.value = false;
  }
}

onMounted(load);

useSocket('order.changed', () => {
  void load();
});

function isMine(order: Order) {
  return Boolean(authStore.user && order.riderName === authStore.user.name);
}

function canPickup(order: Order) {
  return order.status === 'READY_FOR_PICKUP' || (isMine(order) && order.status === 'RIDER_ASSIGNED');
}

function canStartDelivery(order: Order) {
  return isMine(order) && order.status === 'PICKED_UP';
}

function canDeliver(order: Order) {
  return isMine(order) && ['PICKED_UP', 'ON_THE_WAY'].includes(order.status);
}

async function update(order: Order, status: string, label: string) {
  updatingId.value = order.id;
  message.value = '';
  error.value = '';
  try {
    const updated = await updateOrderStatus(order.id, status, label);
    message.value = updated ? `${updated.id} updated to ${status.replace(/_/g, ' ').toLowerCase()}.` : 'Delivery updated.';
    await load();
  } catch (incoming) {
    error.value = incoming instanceof Error ? incoming.message : 'Unable to update delivery.';
  } finally {
    updatingId.value = null;
  }
}
</script>