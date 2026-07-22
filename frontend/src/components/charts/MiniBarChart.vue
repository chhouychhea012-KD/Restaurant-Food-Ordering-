<template>
  <div class="overflow-hidden rounded-xl border border-slate-200 bg-white/80 p-4">
    <div class="grid h-64 grid-cols-8 items-end gap-3 rounded-xl bg-[linear-gradient(180deg,rgba(248,250,252,0.95),rgba(241,245,249,0.6))] px-4 py-5">
      <div v-for="(value, index) in values" :key="`${label}-${index}`" class="flex h-full flex-col justify-end gap-3">
        <div class="relative flex-1 rounded-full bg-white/60">
          <div class="absolute inset-x-0 bottom-0 rounded-full bg-gradient-to-t from-brand-500 via-orange-400 to-amber-300 shadow-[0_10px_30px_rgba(249,115,22,0.35)]" :style="{ height: `${Math.max((value / maxValue) * 100, 12)}%` }" />
        </div>
        <div class="text-center">
          <p class="text-sm font-semibold text-slate-700">{{ value }}</p>
          <p class="text-xs text-slate-400">{{ index + 9 }}h</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  label: string;
  values: number[];
}>();

const maxValue = computed(() => Math.max(...props.values, 1));
</script>
