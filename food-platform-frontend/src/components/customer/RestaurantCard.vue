<template>
  <RouterLink
    :to="`/restaurants/${restaurant.slug}`"
    class="group surface-card flex h-full flex-col overflow-hidden border-slate-200/80 transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
  >
    <div class="relative h-72 overflow-hidden">
      <div
        class="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-110"
        :style="{ backgroundImage: `url(${restaurant.coverImage})` }"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

      <div class="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
        <span class="pill bg-white/90 text-slate-700 shadow-sm backdrop-blur">
          {{ restaurant.verified ? 'Verified kitchen' : 'New partner' }}
        </span>
        <StatusBadge :status="restaurant.status" :label="restaurant.status" />
      </div>

      <div class="absolute inset-x-0 bottom-0 p-5 text-white">
        <p class="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">Featured restaurant</p>
        <h3 class="mt-2 text-2xl font-bold leading-tight">{{ restaurant.name }}</h3>
        <p class="mt-3 text-sm text-white/80">{{ cuisineText }}</p>
      </div>
    </div>

    <div class="flex min-h-[14.5rem] flex-1 flex-col p-5">
      <div class="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
        <div class="min-w-0">
          <p class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Service status</p>
          <p class="mt-1 text-sm font-medium leading-6 text-slate-600">{{ branchSummary }}</p>
        </div>
        <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Fast lane</span>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div class="min-w-0 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-center shadow-sm shadow-slate-200/40">
          <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Rating</p>
          <p class="mt-2 truncate text-lg font-bold leading-none text-slate-950">{{ restaurant.rating.toFixed(1) }}</p>
          <p class="mt-1 text-[11px] text-slate-500">Top reviews</p>
        </div>
        <div class="min-w-0 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-center shadow-sm shadow-slate-200/40">
          <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Delivery</p>
          <p class="mt-2 break-words text-sm font-bold leading-5 text-slate-950">{{ restaurant.deliveryTime }}</p>
          <p class="mt-1 text-[11px] text-slate-500">Estimated</p>
        </div>
        <div class="min-w-0 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center shadow-sm shadow-slate-200/40 col-span-2">
          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0 text-left">
              <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Delivery fee</p>
              <p class="mt-1 text-sm font-medium text-slate-500">Local area pricing</p>
            </div>
            <p class="shrink-0 text-base font-bold text-slate-950">THB {{ restaurant.deliveryFee }}</p>
          </div>
        </div>
      </div>

      <div class="mt-auto pt-4">
        <div class="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-sm">
          <div class="min-w-0">
            <p class="font-semibold text-slate-900">Explore the full menu</p>
            <p class="text-xs text-slate-500">Meals, add-ons, and delivery options</p>
          </div>
          <span class="shrink-0 rounded-full bg-brand-500 px-3 py-2 text-xs font-semibold text-white transition group-hover:translate-x-1 group-hover:bg-brand-600">
            View menu
          </span>
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

const cuisineText = computed(() => props.restaurant.cuisine.join(' · '));
const branchSummary = computed(() => `${props.restaurant.branches.length} ${props.restaurant.branches.length === 1 ? 'branch' : 'branches'} ready`);
</script>
