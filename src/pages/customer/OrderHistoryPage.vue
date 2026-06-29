<template>
  <SectionCard eyebrow="Order History" title="All customer orders" description="Every order you place from checkout appears here and is shared across operational role pages.">
    <div class="space-y-4">
      <div v-for="order in orderStore.orders" :key="order.id" class="surface-muted flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p class="text-sm text-slate-500">{{ order.id }}</p>
          <p class="text-lg font-semibold text-slate-950">{{ order.restaurantName }}</p>
          <p class="text-sm text-slate-500">{{ formatShortDate(order.createdAt) }}</p>
        </div>
        <div class="flex items-center gap-4">
          <p class="text-base font-bold text-slate-950">${{ order.total }}</p>
          <StatusBadge :status="order.status" />
        </div>
      </div>
    </div>
  </SectionCard>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import SectionCard from '@/components/common/SectionCard.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { useAuthStore } from '@/stores/auth.store';
import { useOrderStore } from '@/stores/order.store';
import { formatShortDate } from '@/utils/format';

const authStore = useAuthStore();
const orderStore = useOrderStore();

onMounted(() => {
  if (authStore.user) {
    orderStore.loadForCustomer(authStore.user.id);
  }
});
</script>
