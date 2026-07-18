<template>
  <section v-if="items.length" class="mb-8 space-y-4">
    <div class="flex flex-wrap items-end justify-between gap-3 px-1">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.3em] text-brand-500">{{ categoryName }}</p>
        <h3 class="mt-2 text-2xl font-bold text-slate-950">{{ items.length }} products to explore</h3>
        <p class="mt-2 text-sm text-slate-500">Click any product card to open only that selected item.</p>
      </div>
    </div>

    <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <RouterLink
        v-for="item in items"
        :key="`${item.restaurantSlug}-${item.id}`"
        :to="{ path: `/restaurants/${item.restaurantSlug}`, query: { item: item.id, category: item.category } }"
        class="group surface-card flex h-full flex-col overflow-hidden rounded-xl border border-slate-100 bg-white transition-all hover:-translate-y-1 hover:shadow-xl"
      >
        <div class="relative h-52 overflow-hidden rounded-t-xl">
          <div
            class="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
            :style="{ backgroundImage: `url(${item.image})` }"
          />

          <div class="absolute left-3 top-3 flex flex-wrap gap-2">
            <span class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-500 shadow">
              {{ item.category }}
            </span>
            <StatusBadge :status="item.available ? 'OPEN' : 'OFFLINE'" :label="item.available ? 'Available' : 'Paused'" />
          </div>
        </div>

        <div class="flex flex-1 flex-col p-4">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.24em] text-brand-500">{{ item.restaurantName }}</p>
            <h4 class="mt-2 line-clamp-2 text-lg font-semibold text-slate-900">{{ item.name }}</h4>
            <p class="mt-1 line-clamp-2 text-sm text-slate-600">{{ item.description }}</p>
          </div>

          <div class="mt-4 flex flex-wrap gap-2">
            <div class="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs">
              <span class="text-amber-500">$</span>
              <span class="font-medium">{{ item.price }}</span>
            </div>

            <div class="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs">
              <span>Prep</span>
              <span>{{ item.prepTime }} min</span>
            </div>
          </div>

          <div class="mt-4 flex flex-wrap gap-2">
            <span v-for="modifier in item.modifiers.slice(0, 3)" :key="modifier" class="pill bg-slate-100 text-slate-600">{{ modifier }}</span>
          </div>

          <div class="mt-auto pt-4 border-t border-slate-100">
            <div class="flex items-center justify-between text-sm">
              <p class="text-slate-600">From {{ item.restaurantName }}</p>
              <span class="text-emerald-600 text-xs font-medium">{{ item.available ? 'Ready to order' : 'Unavailable' }}</span>
            </div>
          </div>

          <div class="mt-5">
            <div class="w-full rounded-xl bg-brand-500 py-3 text-center text-sm font-semibold text-white transition group-hover:bg-brand-600">
              View item
            </div>
          </div>
        </div>
      </RouterLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import type { MenuItem, Restaurant } from '@/types';
import StatusBadge from '@/components/common/StatusBadge.vue';

interface CategoryProductPreview extends MenuItem {
  category: string;
  restaurantName: string;
  restaurantSlug: string;
}

const props = withDefaults(
  defineProps<{
    categoryName: string;
    restaurants: Restaurant[];
    limit?: number;
  }>(),
  {
    limit: 3,
  },
);

const normalizedCategory = computed(() => props.categoryName.trim().toLowerCase());

const items = computed<CategoryProductPreview[]>(() => {
  if (!normalizedCategory.value) {
    return [];
  }

  return props.restaurants
    .flatMap((restaurant) =>
      restaurant.menuCategories
        .filter((category) => category.name.trim().toLowerCase() === normalizedCategory.value)
        .flatMap((category) =>
          category.items.map((item) => ({
            ...item,
            category: category.name,
            restaurantName: restaurant.name,
            restaurantSlug: restaurant.slug,
          })),
        ),
    )
    .slice(0, props.limit);
});
</script>
