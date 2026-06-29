<template>
  <div class="space-y-8">
    <!-- Category Discovery -->
    <SectionCard eyebrow="Discover Categories" title="What are you craving?" description="Browse popular categories from our restaurants">
      <template #actions>
        <div class="flex flex-wrap gap-3">
          <input 
            v-model="query" 
            class="field-input w-80" 
            type="search" 
            placeholder="Search categories..." 
            @input="updateRoute" 
          />
          <RouterLink to="/restaurants" class="btn-secondary">All Restaurants</RouterLink>
        </div>
      </template>

      <!-- Category Pills -->
      <div class="mt-6 flex flex-wrap gap-3">
        <button 
          class="pill px-5 py-2 text-sm transition" 
          :class="!activeCategory ? 'bg-slate-900 text-white' : 'bg-slate-100 hover:bg-slate-200'"
          @click="selectCategory('')"
        >
          All Categories
        </button>
        <button
          v-for="category in filteredCategories"
          :key="category.slug"
          class="pill px-5 py-2 text-sm transition"
          :class="activeCategory === category.name ? 'bg-brand-500 text-white' : 'bg-white hover:bg-slate-50 border border-slate-200'"
          @click="selectCategory(category.name)"
        >
          {{ category.name }}
        </button>
      </div>

      <!-- Visual Category Cards -->
      <div v-if="filteredCategories.length" class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <button
          v-for="category in filteredCategories"
          :key="category.slug"
          class="group text-left rounded-3xl overflow-hidden border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
          @click="selectCategory(category.name)"
        >
          <div class="relative h-44 bg-slate-100">
            <!-- You can replace with real category images later -->
            <div class="absolute inset-0 flex items-center justify-center text-6xl opacity-75">
              {{ getCategoryEmoji(category.name) }}
            </div>
            <div class="absolute bottom-3 right-3 bg-white/90 text-xs font-semibold px-3 py-1 rounded-full shadow">
              {{ category.restaurantCount }} stores
            </div>
          </div>

          <div class="p-5">
            <h3 class="text-xl font-semibold text-slate-900">{{ category.name }}</h3>
            <p class="mt-1 text-sm text-slate-600 line-clamp-2">
              {{ category.restaurantNames.slice(0, 2).join(' • ') }}
            </p>
          </div>
        </button>
      </div>

      <div v-else class="mt-12 rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
        <p class="text-2xl">😕</p>
        <p class="mt-3 text-lg font-medium">No matching categories</p>
        <p class="text-slate-500">Try different keywords</p>
      </div>
    </SectionCard>

    <!-- Filtered Restaurants -->
    <SectionCard 
      eyebrow="Available Restaurants" 
      :title="activeCategory ? `${activeCategory} Restaurants` : 'All Restaurants'"
      :description="activeCategory ? `Best places for ${activeCategory.toLowerCase()}` : 'Discover great restaurants near you'"
    >
      <div v-if="restaurantStore.restaurants.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <RestaurantCard 
          v-for="restaurant in restaurantStore.restaurants" 
          :key="restaurant.id" 
          :restaurant="restaurant" 
        />
      </div>
      <div v-else class="rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-20 text-center">
        <p class="text-xl">No restaurants found</p>
        <p class="mt-2 text-slate-500">Try changing category or search term</p>
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
  if (!term) return restaurantStore.categories;

  return restaurantStore.categories.filter((cat) =>
    cat.name.toLowerCase().includes(term) ||
    cat.restaurantNames.some(name => name.toLowerCase().includes(term))
  );
});

// Simple emoji mapping for categories
function getCategoryEmoji(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('pizza') || lower.includes('italian')) return '🍕';
  if (lower.includes('burger') || lower.includes('fast')) return '🍔';
  if (lower.includes('asian') || lower.includes('thai')) return '🍜';
  if (lower.includes('dessert') || lower.includes('sweet')) return '🍰';
  if (lower.includes('healthy') || lower.includes('salad')) return '🥗';
  if (lower.includes('chicken')) return '🍗';
  if (lower.includes('seafood')) return '🐟';
  return '🍽️';
}

const loadFromRoute = async () => {
  query.value = typeof route.query.q === 'string' ? route.query.q : '';
  activeCategory.value = typeof route.query.category === 'string' ? route.query.category : '';
  await restaurantStore.loadCategories();
  await restaurantStore.filter(query.value, activeCategory.value);
};

const updateRoute = () => {
  const nextQuery: Record<string, string> = {};
  if (query.value.trim()) nextQuery.q = query.value.trim();
  if (activeCategory.value) nextQuery.category = activeCategory.value;
  router.replace({ path: '/categories', query: nextQuery });
};

const selectCategory = (name: string) => {
  activeCategory.value = name;
  updateRoute();
};

onMounted(loadFromRoute);
watch(() => route.query, loadFromRoute);
</script>