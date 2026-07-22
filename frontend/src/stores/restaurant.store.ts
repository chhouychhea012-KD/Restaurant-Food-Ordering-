import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { CustomerCategorySummary, Restaurant } from '@/types';
import { getRestaurantBySlug, listRestaurantCategories, listRestaurants, searchRestaurants } from '@/services/restaurant.service';

const CACHE_TTL_MS = 45_000;

export const useRestaurantStore = defineStore('restaurants', () => {
  const restaurants = ref<Restaurant[]>([]);
  const categories = ref<CustomerCategorySummary[]>([]);
  const loading = ref(false);
  const loadedAt = ref(0);
  let loadPromise: Promise<void> | null = null;

  const featured = computed(() => restaurants.value.slice(0, 8));
  const isFresh = computed(() => restaurants.value.length > 0 && Date.now() - loadedAt.value < CACHE_TTL_MS);

  async function loadAll(force = false) {
    if (!force && isFresh.value && categories.value.length) {
      return;
    }
    if (loadPromise && !force) {
      return loadPromise;
    }

    loading.value = true;
    loadPromise = (async () => {
      const nextRestaurants = await listRestaurants();
      restaurants.value = nextRestaurants;
      categories.value = await listRestaurantCategories();
      loadedAt.value = Date.now();
    })();

    try {
      await loadPromise;
    } finally {
      loading.value = false;
      loadPromise = null;
    }
  }

  async function loadCategories(force = false) {
    if (!force && categories.value.length && Date.now() - loadedAt.value < CACHE_TTL_MS) {
      return;
    }
    categories.value = await listRestaurantCategories();
  }

  async function loadBySlug(slug: string) {
    return getRestaurantBySlug(slug);
  }

  async function filter(query = '', category = '') {
    loading.value = true;
    try {
      restaurants.value = await searchRestaurants(query, category);
      if (!categories.value.length) {
        categories.value = await listRestaurantCategories();
      }
      loadedAt.value = Date.now();
    } finally {
      loading.value = false;
    }
  }

  return {
    restaurants,
    categories,
    featured,
    loading,
    loadAll,
    loadCategories,
    loadBySlug,
    filter,
  };
});