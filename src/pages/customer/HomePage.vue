<template>
  <div class="space-y-6">
    <HeroBanner />

    <section class="grid gap-4 md:grid-cols-3">
      <StatCard title="Restaurants" :value="restaurantStore.restaurants.length" subtitle="Verified partners" tone="Live" />
      <StatCard title="Average delivery" value="27 min" subtitle="Across demo zones" tone="-3 min" />
      <StatCard title="Today deal" value="$ 30 off" subtitle="Orders over $ 300" tone="Today" />
    </section>

    <SectionCard eyebrow="Featured" title="Popular tonight">
      <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <RestaurantCard v-for="restaurant in restaurantStore.featured" :key="restaurant.id" :restaurant="restaurant" />
      </div>
    </SectionCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import HeroBanner from '@/components/customer/HeroBanner.vue';
import RestaurantCard from '@/components/customer/RestaurantCard.vue';
import SectionCard from '@/components/common/SectionCard.vue';
import StatCard from '@/components/common/StatCard.vue';
import { useRestaurantStore } from '@/stores/restaurant.store';

const restaurantStore = useRestaurantStore();

onMounted(() => {
  restaurantStore.loadAll();
});
</script>