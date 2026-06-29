<template>
  <RouterLink
    :to="`/restaurants/${restaurant.slug}`"
    class="group surface-card flex h-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white transition-all hover:-translate-y-1 hover:shadow-xl"
  >
    <!-- Image -->
    <div class="relative h-52 overflow-hidden rounded-t-3xl">
      <div
        class="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
        :style="{ backgroundImage: `url(${restaurant.coverImage})` }"
      />
      
      <div class="absolute top-3 left-3 flex gap-2">
        <span v-if="restaurant.verified" 
              class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-600 shadow">
          ✓ Verified
        </span>
        <StatusBadge :status="restaurant.status" :label="restaurant.status" />
      </div>
    </div>

    <!-- Content -->
    <div class="flex flex-1 flex-col p-4">
      <div>
        <h3 class="line-clamp-2 text-lg font-semibold text-slate-900">
          {{ restaurant.name }}
        </h3>
        <p class="mt-1 text-sm text-slate-600 line-clamp-2">
          {{ cuisineText }}
        </p>
      </div>

      <!-- Info Tags -->
      <div class="mt-4 flex flex-wrap gap-2">
        <div class="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs">
          <span class="text-amber-500">⭐</span>
          <span class="font-medium">{{ restaurant.rating.toFixed(1) }}</span>
        </div>

        <div class="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs">
          <span>⏱️</span>
          <span>{{ restaurant.deliveryTime }} min</span>
        </div>

        <div class="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs">
          <span>🚲</span>
          <span>$ {{ restaurant.deliveryFee }}</span>
        </div>
      </div>

      <!-- Branch Info -->
      <div class="mt-auto pt-4 border-t border-slate-100">
        <div class="flex items-center justify-between text-sm">
          <p class="text-slate-600">
            {{ branchSummary }}
          </p>
          <span class="text-emerald-600 text-xs font-medium">Open Now</span>
        </div>
      </div>

      <!-- View Menu Button -->
      <div class="mt-5">
        <div class="w-full rounded-2xl bg-brand-500 py-3 text-center text-sm font-semibold text-white transition group-hover:bg-brand-600">
          View Menu →
        </div>
      </div>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import type { Restaurant } from '@/types';
import StatusBadge from '@/components/common/StatusBadge.vue';

const props = defineProps<{
  restaurant: Restaurant;
}>();

const cuisineText = computed(() => props.restaurant.cuisine.join(' • '));

const branchSummary = computed(() => {
  const count = props.restaurant.branches.length;
  return `${count} ${count === 1 ? 'branch' : 'branches'} nearby`;
});
</script>