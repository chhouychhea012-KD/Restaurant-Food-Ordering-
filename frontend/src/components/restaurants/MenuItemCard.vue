<template>
  <article class="surface-card overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
    <div class="grid gap-5 p-5 md:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.8fr)] md:items-stretch sm:p-6">
      <div class="flex min-w-0 flex-col">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-xs font-bold uppercase tracking-[0.18em] text-brand-500">{{ category }}</p>
            <h3 class="mt-2 text-xl font-bold text-slate-950">{{ item.name }}</h3>
          </div>
          <StatusBadge :status="item.available ? 'OPEN' : 'OFFLINE'" :label="item.available ? 'Available' : 'Paused'" />
        </div>

        <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{{ item.description }}</p>

        <div class="mt-4 flex flex-wrap gap-2">
          <span v-for="modifier in item.modifiers" :key="modifier" class="pill bg-slate-100 text-slate-600">{{ modifier }}</span>
        </div>

        <div class="mt-auto flex flex-wrap items-end justify-between gap-4 pt-6">
          <div>
            <p class="text-2xl font-bold text-slate-950">${{ item.price }}</p>
            <p class="mt-1 text-sm text-slate-500">{{ item.prepTime }} min prep</p>
          </div>
          <slot />
        </div>
      </div>

      <img :src="item.image" :alt="item.name" class="h-56 w-full rounded-xl object-cover md:h-full md:min-h-56" />
    </div>
  </article>
</template>

<script setup lang="ts">
import type { MenuItem } from '@/types';
import StatusBadge from '@/components/common/StatusBadge.vue';

defineProps<{
  category: string;
  item: MenuItem;
}>();
</script>