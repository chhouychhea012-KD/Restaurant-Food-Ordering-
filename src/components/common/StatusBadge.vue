<template>
  <span :class="badgeClass" data-i18n-ignore class="pill">
    <span class="mr-2 h-2 w-2 rounded-full bg-current/70" />
    {{ translatedLabel }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { translateText } from '@/composables/useI18n';

const props = defineProps<{
  status: string;
  label?: string;
}>();

const colorMap: Record<string, string> = {
  OPEN: 'bg-emerald-100 text-emerald-700',
  OPENED: 'bg-emerald-100 text-emerald-700',
  BUSY: 'bg-amber-100 text-amber-700',
  ON_THE_WAY: 'bg-sky-100 text-sky-700',
  PREPARING: 'bg-orange-100 text-orange-700',
  PLACED: 'bg-violet-100 text-violet-700',
  DELIVERED: 'bg-slate-200 text-slate-700',
  READY_FOR_PICKUP: 'bg-teal-100 text-teal-700',
  ONLINE: 'bg-emerald-100 text-emerald-700',
  OFFLINE: 'bg-slate-200 text-slate-700',
};

const label = computed(() => props.label ?? props.status.replace(/_/g, ' '));
const translatedLabel = computed(() => translateText(label.value));
const badgeClass = computed(() => colorMap[props.status.toUpperCase()] ?? 'bg-slate-100 text-slate-700');
</script>