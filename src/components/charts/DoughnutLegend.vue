<template>
  <div class="grid gap-3">
    <div v-for="(item, index) in items" :key="item.zone" class="rounded-xl border border-slate-200 bg-white/80 p-4">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <span class="h-3 w-3 rounded-full" :style="{ backgroundColor: colors[index % colors.length] }" />
          <span class="text-sm font-semibold text-slate-800">{{ item.zone }}</span>
        </div>
        <span class="text-sm font-medium text-slate-500">{{ item.value }} orders</span>
      </div>
      <div class="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div class="h-full rounded-full" :style="{ width: `${toPercent(item.value)}%`, backgroundColor: colors[index % colors.length] }" />
      </div>
      <p class="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">{{ toPercent(item.value).toFixed(0) }}% of tracked zone load</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  items: Array<{ zone: string; value: number }>;
}>();

const colors = ['#f97316', '#0ea5e9', '#10b981', '#a855f7'];

function toPercent(value: number) {
  const total = props.items.reduce((sum, item) => sum + item.value, 0);
  if (!total) {
    return 0;
  }
  return (value / total) * 100;
}
</script>
