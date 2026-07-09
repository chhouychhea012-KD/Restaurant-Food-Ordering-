<template>
  <div class="grid gap-5 lg:grid-cols-3">
    <div v-for="order in orders" :key="order.id" class="rounded-xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-sm text-slate-400">{{ order.id }}</p>
          <h2 class="mt-2 text-xl font-bold">{{ order.restaurantName }}</h2>
        </div>
        <StatusBadge :status="order.status" />
      </div>
      <div class="mt-5 space-y-2 text-sm text-slate-300">
        <p v-for="item in order.items" :key="item.id">{{ item.quantity }}x {{ item.name }}</p>
      </div>
      <div class="mt-6 grid gap-2">
        <button class="btn-primary" @click="update(order.id, 'PREPARING', 'Kitchen started preparation')">Start preparing</button>
        <button class="btn-secondary border-white/10 bg-white/10 text-white hover:bg-white/20" @click="update(order.id, 'READY_FOR_PICKUP', 'Kitchen marked order ready')">
          Mark ready
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { Order } from '@/types';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { useAuthStore } from '@/stores/auth.store';
import { listOrdersForRestaurant, updateOrderStatus } from '@/services/order.service';

const authStore = useAuthStore();
const orders = ref<Order[]>([]);

async function load() {
  if (authStore.user?.restaurantId) {
    orders.value = await listOrdersForRestaurant(authStore.user.restaurantId);
  }
}

onMounted(load);

async function update(orderId: string, status: string, label: string) {
  await updateOrderStatus(orderId, status, label);
  await load();
}
</script>
