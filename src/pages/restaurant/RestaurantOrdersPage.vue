<template>
  <SectionCard eyebrow="Restaurant Orders" title="Service-hour order management" description="This owner view shows orders tied to the logged-in restaurant only, preventing cross-restaurant access in the frontend MVP.">
    <div class="space-y-4">
      <div v-for="order in orders" :key="order.id" class="surface-muted flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p class="text-sm text-slate-500">{{ order.id }}</p>
          <p class="text-lg font-semibold text-slate-950">{{ order.deliveryAddress }}</p>
        </div>
        <div class="flex items-center gap-4">
          <p class="text-sm text-slate-500">{{ order.items.length }} items</p>
          <StatusBadge :status="order.status" />
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
import { listOrdersForRestaurant } from '@/services/order.service';

const authStore = useAuthStore();
const orders = ref<Order[]>([]);

onMounted(async () => {
  if (authStore.user?.restaurantId) {
    orders.value = await listOrdersForRestaurant(authStore.user.restaurantId);
  }
});
</script>
