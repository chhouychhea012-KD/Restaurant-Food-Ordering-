<template>
  <section class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    <div class="flex flex-wrap items-start justify-between gap-4 px-5 py-4 sm:px-6">
      <div>
        <h3 class="text-base font-semibold text-slate-900">{{ title }}</h3>
        <p v-if="subtitle" class="mt-1 text-sm text-slate-500">{{ subtitle }}</p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <button
          v-for="entry in normalizedSeries"
          :key="entry.name"
          class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600"
          type="button"
          @click="activeSeriesName = entry.name"
        >
          <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: entry.color }" />
          {{ entry.name }}
        </button>
      </div>
    </div>

    <div class="border-t border-slate-100 p-4 sm:p-6">
      <div class="custom-scrollbar max-w-full overflow-x-auto">
        <div class="min-w-[720px]">
          <div class="grid gap-4 lg:grid-cols-[52px_1fr]">
            <div class="flex h-[325px] flex-col justify-between pt-1 text-right text-xs font-medium text-slate-400">
              <span v-for="tick in yTicks" :key="tick">{{ formatValue(tick) }}</span>
            </div>

            <div
              ref="chartAreaRef"
              class="relative h-[325px] cursor-crosshair overflow-hidden rounded-xl bg-white touch-none"
              @mousemove="handlePointerMove"
              @mouseleave="clearHover"
              @touchmove.passive="handleTouchMove"
              @touchend="clearHover"
            >
              <div class="absolute inset-0 grid grid-rows-5">
                <div v-for="line in 5" :key="line" class="border-b border-slate-100" />
              </div>
              <div class="absolute inset-0 grid" :style="{ gridTemplateColumns: `repeat(${safeLabels.length}, minmax(0, 1fr))` }">
                <div v-for="label in safeLabels" :key="label" class="border-r border-slate-50 last:border-r-0" />
              </div>

              <div
                v-if="activePoint"
                class="pointer-events-none absolute bottom-0 top-0 z-10 w-px bg-slate-300"
                :style="{ left: `${activePoint.x}%` }"
              />

              <div
                v-if="activePoint"
                class="pointer-events-none absolute top-4 z-30 min-w-36 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-lg shadow-slate-200/80 backdrop-blur"
                :class="tooltipAlignmentClass"
                :style="{ left: `${activePoint.x}%` }"
              >
                <p class="text-xs font-semibold text-slate-500">{{ activeLabel }}</p>
                <div class="mt-2 space-y-1.5">
                  <p v-for="entry in tooltipRows" :key="entry.name" class="flex items-center justify-between gap-4 text-xs text-slate-600">
                    <span class="inline-flex items-center gap-2">
                      <span class="h-2 w-2 rounded-full" :style="{ backgroundColor: entry.color }" />
                      {{ entry.name }}
                    </span>
                    <span class="font-bold text-slate-950">{{ formatValue(entry.value) }}</span>
                  </p>
                </div>
              </div>

              <svg class="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient v-for="entry in normalizedSeries" :id="entry.gradientId" :key="entry.gradientId" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" :stop-color="entry.fillStart" stop-opacity="0.5" />
                    <stop offset="100%" :stop-color="entry.fillEnd" stop-opacity="0" />
                  </linearGradient>
                </defs>

                <g v-for="entry in seriesGeometry" :key="entry.name">
                  <path :d="entry.areaPath" :fill="`url(#${entry.gradientId})`" />
                  <path :d="entry.linePath" fill="none" :stroke="entry.color" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" />
                </g>

                <g v-for="entry in seriesGeometry" :key="`${entry.name}-points`">
                  <circle
                    v-for="(point, index) in entry.points"
                    :key="`${entry.name}-${index}`"
                    :cx="point.x"
                    :cy="point.y"
                    :r="index === activeIndex ? 2.3 : 0"
                    :fill="entry.color"
                    stroke="#ffffff"
                    stroke-width="1.5"
                  />
                </g>
              </svg>
            </div>
          </div>

          <div class="ml-[68px] mt-3 grid gap-2 text-xs font-medium text-slate-500" :style="{ gridTemplateColumns: `repeat(${safeLabels.length}, minmax(0, 1fr))` }">
            <span v-for="(label, index) in safeLabels" :key="`${label}-${index}`" class="text-center" :class="index === activeIndex ? 'text-slate-900' : ''">{{ label }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface ChartSeries {
  name: string;
  values: number[];
  color: string;
  fillStart?: string;
  fillEnd?: string;
}

const props = withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    labels: string[];
    series: ChartSeries[];
    valuePrefix?: string;
  }>(),
  {
    subtitle: '',
    valuePrefix: '',
  },
);

const chartAreaRef = ref<HTMLElement | null>(null);
const hoveredIndex = ref<number | null>(null);
const activeSeriesName = ref('');
const chartTop = 8;
const chartBottom = 86;

const normalizedSeries = computed(() =>
  props.series.map((entry, index) => ({
    ...entry,
    fillStart: entry.fillStart ?? entry.color,
    fillEnd: entry.fillEnd ?? '#ffffff',
    gradientId: `area-${slugify(props.title)}-${index}`,
  })),
);
const pointCount = computed(() => Math.max(...normalizedSeries.value.map((entry) => entry.values.length), props.labels.length, 1));
const safeLabels = computed(() => Array.from({ length: pointCount.value }, (_, index) => props.labels[index] ?? `P${index + 1}`));
const allValues = computed(() => normalizedSeries.value.flatMap((entry) => entry.values));
const maxValue = computed(() => Math.max(...allValues.value, 1));
const minValue = computed(() => Math.min(...allValues.value, 0));
const yTicks = computed(() => {
  const span = maxValue.value - minValue.value;
  return Array.from({ length: 6 }, (_, index) => Math.round(maxValue.value - (span / 5) * index));
});
const activeIndex = computed(() => hoveredIndex.value ?? Math.max(pointCount.value - 1, 0));
const activeLabel = computed(() => safeLabels.value[activeIndex.value] ?? 'Point');

const seriesGeometry = computed(() =>
  normalizedSeries.value.map((entry) => {
    const points = entry.values.map((value, index) => toPoint(value, index, entry.values.length));
    const linePath = buildSmoothPath(points);
    const first = points[0];
    const last = points[points.length - 1];
    return {
      ...entry,
      points,
      linePath,
      areaPath: points.length ? `${linePath} L ${last.x} 100 L ${first.x} 100 Z` : '',
    };
  }),
);
const activeSeries = computed(() => seriesGeometry.value.find((entry) => entry.name === activeSeriesName.value) ?? seriesGeometry.value[0]);
const activePoint = computed(() => activeSeries.value?.points[activeIndex.value] ?? null);
const tooltipRows = computed(() => normalizedSeries.value.map((entry) => ({ ...entry, value: entry.values[activeIndex.value] ?? 0 })));
const tooltipAlignmentClass = computed(() => {
  const x = activePoint.value?.x ?? 50;
  if (x <= 12) return 'translate-x-0';
  if (x >= 88) return '-translate-x-full';
  return '-translate-x-1/2';
});

function toPoint(value: number, index: number, total: number) {
  const span = Math.max(maxValue.value - minValue.value, 1);
  const x = total === 1 ? 50 : (index / (total - 1)) * 100;
  const normalized = (value - minValue.value) / span;
  const y = chartBottom - normalized * (chartBottom - chartTop);
  return { x, y, value };
}

function updateHoveredIndex(clientX: number) {
  if (!chartAreaRef.value || pointCount.value <= 0) return;
  const rect = chartAreaRef.value.getBoundingClientRect();
  const offsetX = Math.min(Math.max(clientX - rect.left, 0), rect.width);
  const ratio = rect.width ? offsetX / rect.width : 0;
  hoveredIndex.value = Math.min(Math.max(Math.round(ratio * (pointCount.value - 1)), 0), pointCount.value - 1);
}

function handlePointerMove(event: MouseEvent) {
  updateHoveredIndex(event.clientX);
}

function handleTouchMove(event: TouchEvent) {
  const touch = event.touches[0];
  if (touch) updateHoveredIndex(touch.clientX);
}

function clearHover() {
  hoveredIndex.value = null;
}

function formatValue(value: number) {
  return `${props.valuePrefix}${value.toLocaleString()}`;
}

function buildSmoothPath(pointsList: Array<{ x: number; y: number }>) {
  if (!pointsList.length) return '';
  if (pointsList.length === 1) return `M ${pointsList[0].x} ${pointsList[0].y}`;

  let path = `M ${pointsList[0].x} ${pointsList[0].y}`;
  for (let index = 1; index < pointsList.length; index += 1) {
    const previous = pointsList[index - 1];
    const current = pointsList[index];
    const cp1x = previous.x + (current.x - previous.x) / 3;
    const cp2x = current.x - (current.x - previous.x) / 3;
    path += ` C ${cp1x} ${previous.y}, ${cp2x} ${current.y}, ${current.x} ${current.y}`;
  }
  return path;
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}
</script>