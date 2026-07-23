<template>
  <div class="space-y-6">
    <SectionCard eyebrow="Restaurant Directory" title="Browse all delivery partners" description="">
      <template #actions>
        <div class="flex flex-wrap gap-3">
          <input v-model="query" class="field-input w-full sm:w-72" type="search" placeholder="Search cuisine, restaurant, or category" @input="updateRoute" />
          <select v-model="activeCategory" class="field-input w-full sm:w-60" @change="updateRoute">
            <option value="">All categories</option>
            <option v-for="category in restaurantStore.categories" :key="category.slug" :value="category.name">{{ category.name }}</option>
          </select>
        </div>
      </template>

      <div class="mb-6 flex flex-wrap gap-3">
        <button class="pill px-4 py-2 text-sm transition" :class="!activeCategory ? 'bg-brand-500 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-orange-50 hover:text-brand-700'" type="button" @click="selectCategory('')">
          All categories
        </button>
        <button
          v-for="category in restaurantStore.categories"
          :key="`${category.slug}-chip`"
          class="pill px-4 py-2 text-sm transition"
          :class="activeCategory === category.name ? 'bg-brand-500 text-white' : 'bg-brand-50 text-brand-700 hover:bg-brand-100'"
          type="button"
          @click="selectCategory(category.name)"
        >
          {{ category.name }}
        </button>
      </div>

      <CategoryProductPreview :category-name="activeCategory" :restaurants="restaurantStore.restaurants" />

      <div v-if="restaurantStore.restaurants.length" class="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <RestaurantCard v-for="restaurant in restaurantStore.restaurants" :key="restaurant.id" :restaurant="restaurant" />
      </div>
      <div v-else class="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-10 text-center">
        <p class="text-lg font-semibold text-slate-900">No restaurants matched your filter</p>
        <p class="mt-2 text-sm text-slate-500">Try another search keyword or switch to a different category.</p>
      </div>
    </SectionCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SectionCard from '@/components/common/SectionCard.vue';
import CategoryProductPreview from '@/components/customer/CategoryProductPreview.vue';
import RestaurantCard from '@/components/customer/RestaurantCard.vue';
import { useRestaurantStore } from '@/stores/restaurant.store';

const restaurantStore = useRestaurantStore();
const route = useRoute();
const router = useRouter();
const query = ref('');
const activeCategory = ref('');
let routeUpdateTimer: ReturnType<typeof setTimeout> | null = null;

async function loadFromRoute() {
  query.value = typeof route.query.q === 'string' ? route.query.q : '';
  activeCategory.value = typeof route.query.category === 'string' ? route.query.category : '';
  await restaurantStore.loadCategories();
  await restaurantStore.filter(query.value, activeCategory.value);
}

function applyRouteUpdate() {
  const nextQuery: Record<string, string> = {};
  if (query.value.trim()) {
    nextQuery.q = query.value.trim();
  }
  if (activeCategory.value) {
    nextQuery.category = activeCategory.value;
  }

  void router.replace({ path: '/restaurants', query: nextQuery });
}

function updateRoute() {
  if (routeUpdateTimer) {
    clearTimeout(routeUpdateTimer);
  }
  routeUpdateTimer = setTimeout(applyRouteUpdate, 180);
}

function selectCategory(categoryName: string) {
  activeCategory.value = categoryName;
  applyRouteUpdate();
}

onMounted(loadFromRoute);
watch(() => route.query, loadFromRoute);
</script>
