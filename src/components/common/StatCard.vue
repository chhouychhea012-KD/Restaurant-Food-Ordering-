<template>
  <div data-i18n-ignore class="surface-card p-4">
    <div class="flex min-w-0 flex-col gap-3">
      <div class="flex items-start justify-between gap-2">
        <p class="min-w-0 pr-1 break-words text-[13px] font-semibold leading-5 text-slate-500">{{ t(title) }}</p>
        <div class="shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold leading-none" :class="toneClass">
          {{ t(tone) }}
        </div>
      </div>

      <div class="min-w-0">
        <p class="break-words text-[1.7rem] font-bold leading-tight text-slate-950">{{ value }}</p>
        <p class="mt-2 break-words text-xs leading-5 text-slate-500">{{ t(subtitle) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { translateText as t } from '@/composables/useI18n';

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