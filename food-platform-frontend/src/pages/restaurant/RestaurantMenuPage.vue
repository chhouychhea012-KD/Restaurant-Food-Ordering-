<template>
  <SectionCard eyebrow="Menu Management" title="Branch-ready menu inventory" description="Owners can review item availability states. Toggle actions here are persisted into the local mock restaurant dataset.">
    <div v-if="restaurant" class="space-y-5">
      <MenuItemCard
        v-for="category in restaurant.menuCategories"
        :key="category.id"
        :category="category.name"
        :item="category.items[0]"
      >
        <button class="btn-secondary" @click="toggle(category.items[0].id)">Toggle availability</button>
      </MenuItemCard>
    </div>
  </SectionCard>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { Restaurant } from '@/types';
import SectionCard from '@/components/common/SectionCard.vue';
import MenuItemCard from '@/components/restaurants/MenuItemCard.vue';
import { useAuthStore } from '@/stores/auth.store';
import { toggleItemAvailability } from '@/services/menu.service';
import { getRestaurantById } from '@/services/restaurant.service';

const authStore = useAuthStore();
const restaurant = ref<Restaurant | null>(null);

async function load() {
  if (authStore.user?.restaurantId) {
    restaurant.value = await getRestaurantById(authStore.user.restaurantId);
  }
}

onMounted(load);

async function toggle(itemId: string) {
  if (!authStore.user?.restaurantId) {
    return;
  }
  await toggleItemAvailability(authStore.user.restaurantId, itemId);
  await load();
}
</script>
