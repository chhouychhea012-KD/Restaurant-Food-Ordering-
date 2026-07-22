<template>
  <div class="space-y-4">
    <div v-for="entry in timeline" :key="`${entry.status}-${entry.time}`" class="flex gap-4">
      <div class="flex flex-col items-center">
        <span class="mt-1 h-3 w-3 rounded-full bg-brand-500" />
        <span class="mt-2 h-full w-px bg-slate-200" />
      </div>
      <div class="pb-4">
        <p class="text-sm font-semibold text-slate-900">{{ entry.label }}</p>
        <p class="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">{{ entry.status }}</p>
        <p class="mt-1 text-sm text-slate-500">{{ entry.time }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TimelineEntry } from '@/types';

defineProps<{
  timeline: TimelineEntry[];
}>();
</script>
