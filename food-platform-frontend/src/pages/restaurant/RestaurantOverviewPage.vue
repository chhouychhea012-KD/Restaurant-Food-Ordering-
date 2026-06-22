<template>
  <div v-if="restaurant" class="space-y-6">
    <section class="grid gap-4 md:grid-cols-3">
      <StatCard title="Restaurant rating" :value="restaurant.rating.toFixed(1)" subtitle="Customer satisfaction snapshot" tone="+0.2" />
      <StatCard title="Branch count" :value="restaurant.branches.length" subtitle="Visible from owner profile" tone="Stable" />
      <StatCard title="Menu categories" :value="restaurant.menuCategories.length" subtitle="Editable through menu controls" tone="+1 new" />
    </section>

    <SectionCard eyebrow="Owner Workspace" title="Restaurant profile" :description="restaurant.cuisine.join(' • ')">
      <div class="grid gap-4 md:grid-cols-2">
        <div v-for="branch in restaurant.branches" :key="branch.id" class="surface-muted p-5">
          <p class="text-lg font-semibold text-slate-950">{{ branch.name }}</p>
          <p class="mt-2 text-sm text-slate-500">{{ branch.zone }}</p>
        </div>
      </div>
    </SectionCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { Restaurant } from '@/types';
import SectionCard from '@/components/common/SectionCard.vue';
import StatCard from '@/components/common/StatCard.vue';
import { useAuthStore } from '@/stores/auth.store';
import { getRestaurantById } from '@/services/restaurant.service';

const authStore = useAuthStore();
const restaurant = ref<Restaurant | null>(null);

onMounted(async () => {
  if (authStore.user?.restaurantId) {
    restaurant.value = await getRestaurantById(authStore.user.restaurantId);
  }
});
</script>
