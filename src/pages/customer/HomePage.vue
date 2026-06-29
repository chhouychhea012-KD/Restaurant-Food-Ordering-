<template>
  <div class="space-y-8">
    <HeroBanner />

    <section class="grid gap-4 md:grid-cols-3">
      <StatCard title="Active restaurants" :value="restaurantStore.restaurants.length" subtitle="Verified, responsive storefronts" tone="+12%" />
      <StatCard title="Average delivery" value="27 min" subtitle="Bangkok demo SLA" tone="-3 min" />
      <StatCard title="Promo unlocked" value="$ 30 off" subtitle="Applied automatically over $ 300" tone="Today" />
    </section>
    <SectionCard eyebrow="Featured Restaurants" title="Popular tonight" description="Every card below is wired to a detailed menu page with add-to-cart controls and single-restaurant cart validation.">
      <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <RestaurantCard v-for="restaurant in restaurantStore.featured" :key="restaurant.id" :restaurant="restaurant" />
      </div>
    </SectionCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import HeroBanner from '@/components/customer/HeroBanner.vue';
import RestaurantCard from '@/components/customer/RestaurantCard.vue';
import SectionCard from '@/components/common/SectionCard.vue';
import StatCard from '@/components/common/StatCard.vue';
import { useRestaurantStore } from '@/stores/restaurant.store';

const restaurantStore = useRestaurantStore();
const featuredCategories = computed(() => restaurantStore.categories.slice(0, 6));

onMounted(() => {
  restaurantStore.loadAll();
});
</script>
