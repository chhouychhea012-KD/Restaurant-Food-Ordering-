<template>
  <section class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    <div class="px-5 py-4 sm:px-6">
      <h3 class="text-base font-semibold text-slate-900">{{ title }}</h3>
      <p v-if="subtitle" class="mt-1 text-sm text-slate-500">{{ subtitle }}</p>
    </div>

    <div class="border-t border-slate-100 p-5 sm:p-6">
      <div class="grid gap-6 sm:grid-cols-[220px_1fr] sm:items-center">
        <div class="relative mx-auto h-56 w-56" @mouseleave="clearHover">
          <svg class="h-full w-full -rotate-90" viewBox="0 0 220 220" role="img" :aria-label="title">
            <circle cx="110" cy="110" r="76" fill="none" stroke="#f1f5f9" stroke-width="30" />
            <circle
              v-for="(segment, index) in segments"
              :key="segment.label"
              class="cursor-pointer transition-opacity duration-150 focus:outline-none"
              cx="110"
              cy="110"
              r="76"
              fill="none"
              :stroke="segment.color"
              :stroke-width="activeIndex === index ? 34 : 30"
              :stroke-dasharray="`${segment.length} ${circumference - segment.length}`"
              :stroke-dashoffset="segment.offset"
              :opacity="activeIndex === null || activeIndex === index ? 1 : 0.35"
              stroke-linecap="butt"
              tabindex="0"
              @focus="activeIndex = index"
              @mouseenter="activeIndex = index"
            />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{{ activeItem?.label ?? centerLabel }}</p>
            <p class="mt-2 text-3xl font-bold text-slate-950">{{ formatValue(activeItem?.value ?? total) }}</p>
            <p v-if="activeItem" class="mt-1 text-xs font-semibold text-slate-400">{{ activeItem.percent.toFixed(0) }}% of total</p>
          </div>
          <div
            v-if="activeItem"
            class="pointer-events-none absolute right-0 top-3 z-20 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-left shadow-lg shadow-slate-200/80 backdrop-blur"
          >
            <p class="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: activeItem.color }" />
              {{ activeItem.label }}
            </p>
            <p class="mt-1 text-sm font-bold text-slate-950">{{ formatValue(activeItem.value) }}</p>
          </div>
        </div>

        <div class="space-y-3" @mouseleave="clearHover">
          <button
            v-for="(item, index) in normalizedItems"
            :key="item.label"
            class="w-full rounded-xl border p-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-200"
            :class="activeIndex === index ? 'border-slate-300 bg-white shadow-sm' : 'border-slate-100 bg-slate-50/70 hover:bg-white'"
            type="button"
            @focus="activeIndex = index"
            @mouseenter="activeIndex = index"
          >
            <div class="flex items-center justify-between gap-3">
              <span class="inline-flex min-w-0 items-center gap-3 text-sm font-semibold text-slate-700">
                <span class="h-2.5 w-2.5 shrink-0 rounded-full" :style="{ backgroundColor: item.color }" />
                <span class="truncate">{{ item.label }}</span>
              </span>
              <span class="text-sm font-bold text-slate-950">{{ formatValue(item.value) }}</span>
            </div>
            <div class="mt-3 h-2 overflow-hidden rounded-full bg-white">
              <div class="h-full rounded-full transition-all duration-300" :style="{ width: `${item.percent}%`, backgroundColor: item.color }" />
            </div>
            <p class="mt-2 text-xs font-medium text-slate-400">{{ item.percent.toFixed(0) }}% of total</p>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface DonutItem {
  label: string;
  value: number;
  color: string;
}

const props = withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    centerLabel?: string;
    items: DonutItem[];
    valuePrefix?: string;
  }>(),
  {
    subtitle: '',
    centerLabel: 'Total',
    valuePrefix: '',
  },
);

const activeIndex = ref<number | null>(null);
const radius = 76;
const circumference = 2 * Math.PI * radius;
const total = computed(() => props.items.reduce((sum, item) => sum + item.value, 0));
const normalizedItems = computed(() =>
  props.items.map((item) => ({
    ...item,
    percent: total.value ? (item.value / total.value) * 100 : 0,
  })),
);
const activeItem = computed(() => (activeIndex.value === null ? null : normalizedItems.value[activeIndex.value] ?? null));
const segments = computed(() => {
  let offset = 0;
  return normalizedItems.value.map((item) => {
    const length = (item.percent / 100) * circumference;
    const segment = {
      ...item,
      length,
      offset: -offset,
    };
    offset += length;
    return segment;
  });
});

function clearHover() {
  activeIndex.value = null;
}

function formatValue(value: number) {
  return `${props.valuePrefix}${value.toLocaleString()}`;
}
</script>