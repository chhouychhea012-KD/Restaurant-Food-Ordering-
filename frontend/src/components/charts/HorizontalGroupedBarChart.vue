<template>
  <section class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    <div class="flex flex-wrap items-start justify-between gap-4 px-5 py-4 sm:px-6">
      <div>
        <h3 class="text-base font-semibold text-slate-900">{{ title }}</h3>
        <p v-if="subtitle" class="mt-1 text-sm text-slate-500">{{ subtitle }}</p>
      </div>
      <div class="flex flex-wrap gap-3">
        <span v-for="entry in series" :key="entry.name" class="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
          <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: entry.color }" />
          {{ entry.name }}
        </span>
      </div>
    </div>

    <div class="border-t border-slate-100 p-5 sm:p-6">
      <div class="relative rounded-xl bg-white px-1 py-2" @mouseleave="clearHover">
        <div
          v-if="activeDatum"
          class="pointer-events-none absolute z-30 min-w-44 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-lg shadow-slate-200/80 backdrop-blur"
          :class="activeDatum.percent > 76 ? '-translate-x-full' : ''"
          :style="{ left: `${Math.max(activeDatum.percent, 12)}%`, top: `${activeDatum.top}px` }"
        >
          <p class="text-xs font-semibold text-slate-500">{{ activeDatum.label }}</p>
          <p class="mt-2 inline-flex items-center gap-2 text-sm font-bold text-slate-950">
            <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: activeDatum.color }" />
            {{ activeDatum.name }}: {{ formatValue(activeDatum.value) }}
          </p>
          <p class="mt-1 text-xs text-slate-400">{{ activeDatum.percent.toFixed(0) }}% of chart max</p>
        </div>

        <div class="pointer-events-none absolute inset-x-[calc(108px+1rem)] bottom-10 top-2 hidden grid-cols-5 sm:grid">
          <div v-for="tick in 5" :key="tick" class="border-r border-slate-100 last:border-r-0" />
        </div>

        <div class="relative space-y-5">
          <div v-for="(label, labelIndex) in labels" :key="label" class="grid gap-3 sm:grid-cols-[108px_1fr] sm:items-center">
            <div>
              <p class="text-sm font-semibold text-slate-700">{{ label }}</p>
              <p class="mt-1 text-xs text-slate-400">{{ rowTotal(labelIndex).toLocaleString() }} combined</p>
            </div>
            <div class="space-y-2">
              <button
                v-for="(entry, seriesIndex) in series"
                :key="`${label}-${entry.name}`"
                class="group grid w-full grid-cols-[1fr_54px] items-center gap-3 text-left focus:outline-none"
                type="button"
                @focus="setHover(labelIndex, seriesIndex)"
                @mouseenter="setHover(labelIndex, seriesIndex)"
              >
                <span class="relative h-3 overflow-hidden rounded-full bg-slate-100 ring-offset-2 transition group-focus-visible:ring-2 group-focus-visible:ring-brand-200">
                  <span
                    class="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                    :class="isActive(labelIndex, seriesIndex) ? 'shadow-[0_8px_24px_rgba(70,95,255,0.25)]' : ''"
                    :style="{ width: `${barPercent(entry.values[labelIndex] ?? 0)}%`, backgroundColor: entry.color }"
                  />
                </span>
                <span class="text-right text-xs font-bold transition" :class="isActive(labelIndex, seriesIndex) ? 'text-slate-950' : 'text-slate-700'">
                  {{ formatValue(entry.values[labelIndex] ?? 0) }}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div class="mt-6 grid grid-cols-5 border-t border-slate-100 pt-3 text-xs font-medium text-slate-400">
          <span v-for="tick in xTicks" :key="tick" class="text-right first:text-left">{{ formatValue(tick) }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface BarSeries {
  name: string;
  values: number[];
  color: string;
}

const props = withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    labels: string[];
    series: BarSeries[];
    valuePrefix?: string;
  }>(),
  {
    subtitle: '',
    valuePrefix: '',
  },
);

const activeBar = ref<{ labelIndex: number; seriesIndex: number } | null>(null);
const maxValue = computed(() => Math.max(...props.series.flatMap((entry) => entry.values), 1));
const xTicks = computed(() => Array.from({ length: 5 }, (_, index) => Math.round((maxValue.value / 4) * index)));
const activeDatum = computed(() => {
  if (!activeBar.value) return null;
  const entry = props.series[activeBar.value.seriesIndex];
  const label = props.labels[activeBar.value.labelIndex];
  if (!entry || !label) return null;
  const value = entry.values[activeBar.value.labelIndex] ?? 0;
  return {
    label,
    name: entry.name,
    value,
    color: entry.color,
    percent: barPercent(value),
    top: activeBar.value.labelIndex * 68 + activeBar.value.seriesIndex * 20 + 8,
  };
});

function setHover(labelIndex: number, seriesIndex: number) {
  activeBar.value = { labelIndex, seriesIndex };
}

function clearHover() {
  activeBar.value = null;
}

function isActive(labelIndex: number, seriesIndex: number) {
  return activeBar.value?.labelIndex === labelIndex && activeBar.value?.seriesIndex === seriesIndex;
}

function barPercent(value: number) {
  return Math.max((value / maxValue.value) * 100, value > 0 ? 3 : 0);
}

function rowTotal(index: number) {
  return props.series.reduce((sum, entry) => sum + (entry.values[index] ?? 0), 0);
}

function formatValue(value: number) {
  return `${props.valuePrefix}${value.toLocaleString()}`;
}
</script>