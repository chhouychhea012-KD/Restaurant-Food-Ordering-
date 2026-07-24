<template>
  <div class="space-y-6">
    <RiderStatusPanel :active="Boolean(authStore.user?.shiftActive)" :saving="savingAvailability" @toggle="toggleAvailability" />

    <div class="grid gap-4 md:grid-cols-3">
      <div class="surface-card p-5">
        <p class="text-sm font-semibold text-slate-600">Active trips</p>
        <p class="mt-2 text-3xl font-bold text-slate-950">{{ activeTrips.length }}</p>
        <p class="mt-2 text-sm text-slate-500">Assigned to you</p>
      </div>
      <div class="surface-card p-5">
        <p class="text-sm font-semibold text-slate-600">Ready for pickup</p>
        <p class="mt-2 text-3xl font-bold text-slate-950">{{ availableTrips.length }}</p>
        <p class="mt-2 text-sm text-slate-500">Available delivery tasks</p>
      </div>
      <div class="surface-card p-5">
        <p class="text-sm font-semibold text-slate-600">Completed today</p>
        <p class="mt-2 text-3xl font-bold text-slate-950">{{ completedTrips.length }}</p>
        <p class="mt-2 text-sm text-slate-500">Delivered orders</p>
      </div>
    </div>

    <SectionCard eyebrow="Assigned Work" title="Current delivery stack" description="Delivery tasks assigned to you and ready pickup orders appear here.">
      <template #actions>
        <RouterLink class="btn-primary" to="/rider/deliveries">Open deliveries</RouterLink>
      </template>

      <div v-if="currentTrips.length" class="space-y-4">
        <div v-for="order in currentTrips.slice(0, 4)" :key="order.id" class="surface-muted p-5">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-sm text-slate-500">{{ order.id }} - {{ order.branchName }}</p>
              <p class="text-lg font-semibold text-slate-950">{{ order.restaurantName }}</p>
              <p class="text-sm text-slate-500">{{ order.deliveryAddress }}</p>
              <p class="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{{ order.riderName ? 'Assigned to you' : 'Ready for pickup' }}</p>
            </div>
            <StatusBadge :status="order.status" />
          </div>
        </div>
      </div>
      <EmptyState v-else title="No delivery tasks" message="Go online and wait for ready pickup orders or assigned trips." />
    </SectionCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import type { Order } from '@/types';
import EmptyState from '@/components/common/EmptyState.vue';
import RiderStatusPanel from '@/components/riders/RiderStatusPanel.vue';
import SectionCard from '@/components/common/SectionCard.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { useAuthStore } from '@/stores/auth.store';
import { useSocket } from '@/composables/useSocket';
import { useRiderStore } from '@/stores/rider.store';
import { listRiderOrders } from '@/services/order.service';

const authStore = useAuthStore();
const riderStore = useRiderStore();
const orders = ref<Order[]>([]);
const savingAvailability = ref(false);

const activeTrips = computed(() => orders.value.filter((order) => order.riderName === authStore.user?.name && !['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(order.status)));
const availableTrips = computed(() => orders.value.filter((order) => !order.riderName && order.status === 'READY_FOR_PICKUP'));
const completedTrips = computed(() => orders.value.filter((order) => order.riderName === authStore.user?.name && ['DELIVERED', 'COMPLETED'].includes(order.status)));
const currentTrips = computed(() => [...activeTrips.value, ...availableTrips.value]);

async function loadOrders() {
  if (authStore.user) {
    orders.value = await listRiderOrders(authStore.user.name);
  }
}

onMounted(loadOrders);

useSocket('order.changed', () => {
  void loadOrders();
});

async function toggleAvailability() {
  if (!authStore.user || savingAvailability.value) return;
  savingAvailability.value = true;
  try {
    const rider = await riderStore.toggleAvailability(authStore.user.id);
    if (rider) {
      authStore.setCurrentUser(rider);
    }
  } finally {
    savingAvailability.value = false;
  }
}
</script>