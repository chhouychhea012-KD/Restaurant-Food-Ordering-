<template>
  <RouterLink
    :to="`/restaurants/${restaurant.slug}`"
    class="group surface-card flex h-full flex-col overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg"
  >
    <div class="relative h-44 overflow-hidden">
      <div
        class="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
        :style="{ backgroundImage: `url(${restaurant.coverImage})` }"
      />
      <div class="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-orange-950/58 to-transparent" />

      <div class="absolute left-3 top-3 flex gap-2">
        <span v-if="restaurant.verified" class="pill bg-white text-emerald-700 shadow-sm">Verified</span>
        <StatusBadge :status="restaurant.status" :label="restaurant.status" />
      </div>
    </div>

    <div class="flex flex-1 flex-col p-4">
      <div>
        <h3 class="line-clamp-1 text-lg font-bold text-slate-950">
          {{ restaurant.name }}
        </h3>
        <p class="mt-1 line-clamp-1 text-sm text-slate-500">
          {{ cuisineText }}
        </p>
      </div>

      <div class="mt-4 grid grid-cols-3 gap-2">
        <div class="rounded-lg bg-slate-50 px-3 py-2 text-xs">
          <p class="font-bold text-slate-950">{{ restaurant.rating.toFixed(1) }}</p>
          <p class="mt-0.5 text-slate-500">Rating</p>
        </div>
        <div class="rounded-lg bg-slate-50 px-3 py-2 text-xs">
          <p class="font-bold text-slate-950">{{ restaurant.deliveryTime }}</p>
          <p class="mt-0.5 text-slate-500">ETA</p>
        </div>
        <div class="rounded-lg bg-slate-50 px-3 py-2 text-xs">
          <p class="font-bold text-slate-950">$ {{ restaurant.deliveryFee }}</p>
          <p class="mt-0.5 text-slate-500">Fee</p>
        </div>
      </div>

      <div class="mt-auto border-t border-slate-100 pt-4">
        <div class="flex items-center justify-between text-sm">
          <p class="text-slate-500">{{ branchSummary }}</p>
          <span class="text-xs font-semibold text-emerald-600">Open</span>
        </div>
      </div>

      <div class="mt-5">
        <div class="w-full rounded-lg bg-brand-500 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition group-hover:bg-brand-600">
          View menu
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

const cuisineText = computed(() => props.restaurant.cuisine.join(' / '));

const branchSummary = computed(() => {
  const count = props.restaurant.branches.length;
  return `${count} ${count === 1 ? 'branch' : 'branches'} nearby`;
});
</script>