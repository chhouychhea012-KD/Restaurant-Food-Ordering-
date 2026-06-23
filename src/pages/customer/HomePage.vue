<template>
  <div class="space-y-8">
    <HeroBanner />

    <section class="grid gap-4 md:grid-cols-3">
      <StatCard title="Active restaurants" :value="restaurantStore.restaurants.length" subtitle="Verified, responsive storefronts" tone="+12%" />
      <StatCard title="Average delivery" value="27 min" subtitle="Bangkok demo SLA" tone="-3 min" />
      <StatCard title="Promo unlocked" value="THB 30 off" subtitle="Applied automatically over THB 300" tone="Today" />
    </section>

    <SectionCard eyebrow="Category Discovery" title="Browse by dynamic categories" description="These category shortcuts come from the same menu categories the admin dashboard manages, so customer filters update automatically when catalog data changes.">
      <template #actions>
        <RouterLink to="/categories" class="btn-secondary">Open all categories</RouterLink>
      </template>

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <RouterLink
          v-for="category in featuredCategories"
          :key="category.slug"
          :to="{ path: '/categories', query: { category: category.name } }"
          class="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-sm transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-xs font-bold uppercase tracking-[0.2em] text-brand-500">Dynamic category</p>
              <h3 class="mt-2 text-xl font-bold text-slate-950">{{ category.name }}</h3>
            </div>
            <span class="pill bg-brand-50 text-brand-700">{{ category.restaurantCount }} stores</span>
          </div>
          <div class="mt-5 flex flex-wrap gap-3 text-sm text-slate-600">
            <span class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2">{{ category.productCount }} products</span>
            <span class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2">{{ category.restaurantNames[0] }}</span>
          </div>
        </RouterLink>
      </div>
    </SectionCard>

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
