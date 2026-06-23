<template>
  <div class="group surface-card relative overflow-hidden p-4 xl:p-4.5">
    <div class="absolute right-0 top-0 h-20 w-20 rounded-full bg-brand-100/40 blur-2xl transition duration-300 group-hover:scale-110" />

    <div class="relative flex min-w-0 flex-col gap-3">
      <div class="flex items-start justify-between gap-2">
        <p class="min-w-0 pr-1 text-[13px] font-semibold leading-5 text-slate-500 break-words">{{ title }}</p>
        <div class="shrink-0 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold leading-none" :class="toneClass">
          {{ tone }}
        </div>
      </div>

      <div class="min-w-0">
        <p class="break-words text-[1.7rem] font-bold leading-tight text-slate-950">{{ value }}</p>
        <p class="mt-2 break-words text-xs leading-5 text-slate-500">{{ subtitle }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  title: string;
  value: string | number;
  subtitle: string;
  tone: string;
}>();

const toneClass = computed(() => {
  if (props.tone.startsWith('+')) {
    return 'bg-emerald-100 text-emerald-700';
  }
  if (props.tone.startsWith('-')) {
    return 'bg-rose-100 text-rose-700';
  }
  return 'bg-slate-100 text-slate-700';
});
</script>
