<template>
  <div class="space-y-6">
    <SectionCard eyebrow="Category Discovery" title="Browse menu categories" description="Every category below is generated from the admin-managed restaurant catalog, so customer filters stay in sync with the dashboard CRUD data.">
      <template #actions>
        <div class="flex flex-wrap gap-3">
          <input v-model="query" class="field-input w-72" type="search" placeholder="Search category or restaurant" @input="updateRoute" />
          <RouterLink to="/restaurants" class="btn-secondary">Open restaurants</RouterLink>
        </div>
      </template>

      <div class="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        <div class="surface-muted p-5">
          <p class="text-sm font-semibold text-slate-900">Dynamic categories</p>
          <p class="mt-2 text-3xl font-bold text-slate-950">{{ restaurantStore.categories.length }}</p>
          <p class="mt-2 text-sm text-slate-500">Live from admin dashboard catalog data</p>
        </div>
        <div class="surface-muted p-5">
          <p class="text-sm font-semibold text-slate-900">Matching restaurants</p>
          <p class="mt-2 text-3xl font-bold text-slate-950">{{ restaurantStore.restaurants.length }}</p>
          <p class="mt-2 text-sm text-slate-500">Customer-visible partners in this filter</p>
        </div>
        <div class="surface-muted p-5">
          <p class="text-sm font-semibold text-slate-900">Products mapped</p>
          <p class="mt-2 text-3xl font-bold text-slate-950">{{ highlightedProductCount }}</p>
          <p class="mt-2 text-sm text-slate-500">Menu items connected to the active category set</p>
        </div>
        <div class="surface-muted p-5">
          <p class="text-sm font-semibold text-slate-900">Active filter</p>
          <p class="mt-2 text-2xl font-bold text-slate-950">{{ activeCategory || 'All categories' }}</p>
          <p class="mt-2 text-sm text-slate-500">Switch categories to refine restaurant results</p>
        </div>
      </div>

      <div class="mt-6 flex flex-wrap gap-3">
        <button class="pill px-4 py-2 text-sm transition" :class="!activeCategory ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'" type="button" @click="selectCategory('')">
          All categories
        </button>
        <button
          v-for="category in filteredCategories"
          :key="category.slug"
          class="pill px-4 py-2 text-sm transition"
          :class="activeCategory === category.name ? 'bg-brand-500 text-white' : 'bg-brand-50 text-brand-700 hover:bg-brand-100'"
          type="button"
          @click="selectCategory(category.name)"
        >
          {{ category.name }}
        </button>
      </div>

      <div v-if="filteredCategories.length" class="mt-6 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        <button
          v-for="category in filteredCategories"
          :key="`${category.slug}-card`"
          class="text-left rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-sm transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg"
          type="button"
          @click="selectCategory(category.name)"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-xs font-bold uppercase tracking-[0.2em] text-brand-500">Category</p>
              <h3 class="mt-2 text-xl font-bold text-slate-950">{{ category.name }}</h3>
            </div>
            <span class="pill" :class="activeCategory === category.name ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-700'">
              {{ category.restaurantCount }} stores
            </span>
          </div>

          <div class="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div class="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4 text-center">
              <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Restaurants</p>
              <p class="mt-2 text-lg font-bold text-slate-950">{{ category.restaurantCount }}</p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4 text-center">
              <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Products</p>
              <p class="mt-2 text-lg font-bold text-slate-950">{{ category.productCount }}</p>
            </div>
          </div>

          <div class="mt-5 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Restaurant preview</p>
            <p class="mt-2 text-sm leading-6 text-slate-600">{{ category.restaurantNames.slice(0, 3).join(' • ') }}</p>
          </div>
        </button>
      </div>

      <div v-else class="mt-6 rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50/80 p-10 text-center">
        <p class="text-lg font-semibold text-slate-900">No category matched your search</p>
        <p class="mt-2 text-sm text-slate-500">Try another keyword or create more categories from the admin dashboard.</p>
      </div>
    </SectionCard>

    <SectionCard eyebrow="Filtered Restaurants" :title="activeCategory ? `${activeCategory} results` : 'Restaurants across all categories'" description="Customer restaurant cards below update from the selected category and search filter.">
      <div v-if="restaurantStore.restaurants.length" class="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <RestaurantCard v-for="restaurant in restaurantStore.restaurants" :key="restaurant.id" :restaurant="restaurant" />
      </div>
      <div v-else class="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50/80 p-10 text-center">
        <p class="text-lg font-semibold text-slate-900">No restaurants found</p>
        <p class="mt-2 text-sm text-slate-500">Adjust the category or search filter to see more customer results.</p>
      </div>
    </SectionCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import RestaurantCard from '@/components/customer/RestaurantCard.vue';
import SectionCard from '@/components/common/SectionCard.vue';
import { useRestaurantStore } from '@/stores/restaurant.store';

const restaurantStore = useRestaurantStore();
const route = useRoute();
const router = useRouter();
const query = ref('');
const activeCategory = ref('');

const filteredCategories = computed(() => {
  const term = query.value.trim().toLowerCase();
  if (!term) {
    return restaurantStore.categories;
  }

  return restaurantStore.categories.filter((category) =>
    [category.name, ...category.restaurantNames].some((value) => value.toLowerCase().includes(term)),
  );
});

const highlightedProductCount = computed(() => {
  if (activeCategory.value) {
    return restaurantStore.categories.find((category) => category.name === activeCategory.value)?.productCount ?? 0;
  }

  return filteredCategories.value.reduce((sum, category) => sum + category.productCount, 0);
});

async function loadFromRoute() {
  query.value = typeof route.query.q === 'string' ? route.query.q : '';
  activeCategory.value = typeof route.query.category === 'string' ? route.query.category : '';
  await restaurantStore.loadCategories();
  await restaurantStore.filter(query.value, activeCategory.value);
}

function updateRoute() {
  const nextQuery: Record<string, string> = {};
  if (query.value.trim()) {
    nextQuery.q = query.value.trim();
  }
  if (activeCategory.value) {
    nextQuery.category = activeCategory.value;
  }

  void router.replace({ path: '/categories', query: nextQuery });
}

function selectCategory(categoryName: string) {
  activeCategory.value = categoryName;
  updateRoute();
}

onMounted(loadFromRoute);
watch(() => route.query, loadFromRoute);
</script>
