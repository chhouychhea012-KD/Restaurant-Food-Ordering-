<template>
  <div class="space-y-6">
    <RiderStatusPanel :active="Boolean(authStore.user?.shiftActive)" @toggle="toggleAvailability" />

    <SectionCard eyebrow="Assigned Work" title="Current delivery stack" description="Rider state is role-protected and tuned for quick mobile actions.">
      <div class="space-y-4">
        <div v-for="order in orders.slice(0, 2)" :key="order.id" class="surface-muted p-5">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-sm text-slate-500">{{ order.id }}</p>
              <p class="text-lg font-semibold text-slate-950">{{ order.restaurantName }}</p>
              <p class="text-sm text-slate-500">{{ order.deliveryAddress }}</p>
            </div>
            <StatusBadge :status="order.status" />
          </div>
        </div>
      </div>
    </SectionCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { Order } from '@/types';
import RiderStatusPanel from '@/components/riders/RiderStatusPanel.vue';
import SectionCard from '@/components/common/SectionCard.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { useAuthStore } from '@/stores/auth.store';
import { useRiderStore } from '@/stores/rider.store';
import { listRiderOrders } from '@/services/order.service';

const authStore = useAuthStore();
const riderStore = useRiderStore();
const orders = ref<Order[]>([]);

async function loadOrders() {
  if (authStore.user) {
    orders.value = await listRiderOrders(authStore.user.name);
  }
}

onMounted(loadOrders);

async function toggleAvailability() {
  if (!authStore.user) {
    return;
  }
  const rider = await riderStore.toggleAvailability(authStore.user.id);
  if (rider) {
    authStore.user = rider;
  }
}
</script>
