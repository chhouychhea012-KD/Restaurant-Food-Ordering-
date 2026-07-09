import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { CustomerCategorySummary, Restaurant } from '@/types';
import { getRestaurantBySlug, listRestaurantCategories, listRestaurants, searchRestaurants } from '@/services/restaurant.service';

export const useRestaurantStore = defineStore('restaurants', () => {
  const restaurants = ref<Restaurant[]>([]);
  const categories = ref<CustomerCategorySummary[]>([]);
  const featured = computed(() => restaurants.value.slice(0, 8));

  async function loadAll() {
    restaurants.value = await listRestaurants();
    categories.value = await listRestaurantCategories();
  }

  async function loadCategories() {
    categories.value = await listRestaurantCategories();
  }

  async function loadBySlug(slug: string) {
    return getRestaurantBySlug(slug);
  }

  async function filter(query = '', category = '') {
    restaurants.value = await searchRestaurants(query, category);
    if (!categories.value.length) {
      categories.value = await listRestaurantCategories();
    }
  }

  return {
    restaurants,
    categories,
    featured,
    loadAll,
    loadCategories,
    loadBySlug,
    filter,
  };
});
