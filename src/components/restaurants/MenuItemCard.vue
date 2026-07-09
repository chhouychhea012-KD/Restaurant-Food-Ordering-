<template>
  <div class="surface-card overflow-hidden">
    <div class="grid gap-4 p-4 md:grid-cols-[1.3fr_1fr]">
      <div>
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.3em] text-brand-500">{{ category }}</p>
            <h3 class="mt-2 text-lg font-bold text-slate-950">{{ item.name }}</h3>
          </div>
          <StatusBadge :status="item.available ? 'OPEN' : 'OFFLINE'" :label="item.available ? 'Available' : 'Paused'" />
        </div>
        <p class="mt-3 text-sm leading-6 text-slate-600">{{ item.description }}</p>
        <div class="mt-4 flex flex-wrap gap-2">
          <span v-for="modifier in item.modifiers" :key="modifier" class="pill bg-slate-100 text-slate-600">{{ modifier }}</span>
        </div>
        <div class="mt-5 flex items-center justify-between">
          <div>
            <p class="text-xl font-bold text-slate-950">${{ item.price }}</p>
            <p class="text-sm text-slate-500">{{ item.prepTime }} min prep</p>
          </div>
          <slot />
        </div>
      </div>
      <img :src="item.image" :alt="item.name" class="h-52 w-full rounded-xl object-cover" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MenuItem } from '@/types';
import StatusBadge from '@/components/common/StatusBadge.vue';

defineProps<{
  category: string;
  item: MenuItem;
}>();
</script>
