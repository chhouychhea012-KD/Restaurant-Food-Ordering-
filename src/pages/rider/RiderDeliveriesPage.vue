<template>
  <SectionCard eyebrow="Delivery Actions" title="Update trip progress" description="Trip state changes here write back into the shared order dataset, so customer tracking and admin views stay aligned.">
    <div class="space-y-4">
      <div v-for="order in orders" :key="order.id" class="surface-muted p-5">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="text-sm text-slate-500">{{ order.id }}</p>
            <h3 class="text-lg font-semibold text-slate-950">{{ order.restaurantName }}</h3>
            <p class="text-sm text-slate-500">{{ order.deliveryAddress }}</p>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <StatusBadge :status="order.status" />
            <button class="btn-secondary px-3 py-2" @click="update(order.id, 'PICKED_UP', 'Rider picked up order')">Picked up</button>
            <button class="btn-primary px-3 py-2" @click="update(order.id, 'DELIVERED', 'Rider completed delivery')">Delivered</button>
          </div>
        </div>
      </div>
    </div>
  </SectionCard>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { Order } from '@/types';
import SectionCard from '@/components/common/SectionCard.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { useAuthStore } from '@/stores/auth.store';
import { listRiderOrders, updateOrderStatus } from '@/services/order.service';

const authStore = useAuthStore();
const orders = ref<Order[]>([]);

async function load() {
  if (authStore.user) {
    orders.value = await listRiderOrders(authStore.user.name);
  }
}

onMounted(load);

async function update(orderId: string, status: string, label: string) {
  await updateOrderStatus(orderId, status, label);
  await load();
}
</script>
