<template>
  <div class="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-sm">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p class="text-sm font-semibold text-slate-900">{{ title }}</p>
        <p v-if="subtitle" class="mt-1 text-sm text-slate-500">{{ subtitle }}</p>
      </div>
      <div class="text-right">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{{ activeLabel }}</p>
        <p class="mt-2 text-3xl font-bold text-slate-950">{{ displayValue(activeValue) }}</p>
        <p class="mt-1 text-xs font-semibold uppercase tracking-[0.2em]" :class="trendToneClass">{{ trendLabel }}</p>
      </div>
    </div>

    <div class="mt-6 grid gap-4 lg:grid-cols-[56px_1fr]">
      <div class="flex h-56 flex-col justify-between text-xs text-slate-400">
        <span>{{ displayValue(maxValue) }}</span>
        <span>{{ displayValue(midValue) }}</span>
        <span>{{ displayValue(minValue) }}</span>
      </div>

      <div>
        <div
          ref="chartAreaRef"
          class="relative h-56 cursor-crosshair overflow-hidden rounded-[1.5rem] bg-[linear-gradient(180deg,rgba(248,250,252,0.95),rgba(241,245,249,0.6))] touch-none"
          @mousemove="handlePointerMove"
          @mouseleave="clearHover"
          @touchmove.passive="handleTouchMove"
          @touchend="clearHover"
        >
          <div class="absolute inset-0 grid grid-rows-4">
            <div v-for="line in 4" :key="line" class="border-b border-dashed border-slate-200/80" />
          </div>

          <div
            v-if="activePoint"
            class="pointer-events-none absolute top-3 z-20 rounded-2xl border border-slate-200 bg-white/95 px-3 py-2 shadow-lg shadow-slate-200/80 backdrop-blur"
            :class="tooltipAlignmentClass"
            :style="{ left: `${activePoint.x}%` }"
          >
            <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{{ activeLabel }}</p>
            <p class="mt-1 text-sm font-bold text-slate-950">{{ displayValue(activeValue) }}</p>
          </div>

          <div
            v-if="activePoint"
            class="pointer-events-none absolute bottom-0 top-0 z-10 w-px bg-slate-300/90"
            :style="{ left: `${activePoint.x}%` }"
          />

          <svg class="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient :id="gradientId" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" :stop-color="fillStart" stop-opacity="0.42" />
                <stop offset="100%" :stop-color="fillEnd" stop-opacity="0.02" />
              </linearGradient>
            </defs>
            <path :d="areaPath" :fill="`url(#${gradientId})`" />
            <path :d="linePath" fill="none" :stroke="strokeColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
            <circle
              v-for="(point, index) in points"
              :key="`${title}-${index}`"
              :cx="point.x"
              :cy="point.y"
              :r="index === activeIndex ? 3.5 : 2.1"
              :fill="strokeColor"
              :opacity="index === activeIndex ? 1 : 0.78"
              class="drop-shadow-sm transition-all duration-200"
            />
          </svg>

          <div
            v-if="activePoint"
            class="pointer-events-none absolute z-20 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-[0_8px_20px_rgba(15,23,42,0.18)]"
            :style="{ left: `${activePoint.x}%`, top: `${activePoint.y}%`, backgroundColor: strokeColor }"
          />
        </div>

        <div class="mt-4 grid gap-2 text-xs text-slate-500" :style="{ gridTemplateColumns: `repeat(${safeLabels.length}, minmax(0, 1fr))` }">
          <span
            v-for="(label, index) in safeLabels"
            :key="`${title}-${label}-${index}`"
            class="text-center font-medium transition"
            :class="index === activeIndex ? 'text-slate-900' : 'text-slate-500'"
          >
            {{ label }}
          </span>
        </div>

        <div class="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] bg-slate-50/80 px-4 py-3 text-xs text-slate-500">
          <span>Move over the graph to inspect each point dynamically.</span>
          <span class="font-semibold text-slate-700">Focused point: {{ activeLabel }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    values: number[];
    labels: string[];
    valuePrefix?: string;
    strokeColor?: string;
    fillStart?: string;
    fillEnd?: string;
  }>(),
  {
    subtitle: '',
    valuePrefix: '',
    strokeColor: '#f97316',
    fillStart: '#fb923c',
    fillEnd: '#ffffff',
  },
);

const chartHeight = 100;
const chartWidth = 100;
const chartTop = 12;
const chartBottom = 88;
const gradientId = `chart-gradient-${Math.random().toString(36).slice(2, 9)}`;
const chartAreaRef = ref<HTMLElement | null>(null);
const hoveredIndex = ref<number | null>(null);

const safeValues = computed(() => (props.values.length ? props.values : [0]));
const safeLabels = computed(() => safeValues.value.map((_, index) => props.labels[index] ?? `P${index + 1}`));
const maxValue = computed(() => Math.max(...safeValues.value, 0));
const minValue = computed(() => Math.min(...safeValues.value, 0));
const midValue = computed(() => Math.round((maxValue.value + minValue.value) / 2));
const defaultIndex = computed(() => Math.max(safeValues.value.length - 1, 0));
const activeIndex = computed(() => hoveredIndex.value ?? defaultIndex.value);
const activeValue = computed(() => safeValues.value[activeIndex.value] ?? 0);
const firstValue = computed(() => safeValues.value[0] ?? 0);
const activeLabel = computed(() => safeLabels.value[activeIndex.value] ?? 'Point');
const comparisonValue = computed(() => {
  if (hoveredIndex.value === null) {
    return firstValue.value;
  }
  if (activeIndex.value === 0) {
    return activeValue.value;
  }
  return safeValues.value[activeIndex.value - 1] ?? activeValue.value;
});
const trendDelta = computed(() => activeValue.value - comparisonValue.value);
const trendLabel = computed(() => {
  if (hoveredIndex.value === null) {
    return `${formatDelta(trendDelta.value)} vs start`;
  }
  if (activeIndex.value === 0) {
    return 'Starting point';
  }
  return `${formatDelta(trendDelta.value)} vs previous`;
});
const trendToneClass = computed(() => (trendDelta.value >= 0 ? 'text-emerald-600' : 'text-rose-500'));

const points = computed(() => {
  const values = safeValues.value;
  const span = Math.max(maxValue.value - minValue.value, 1);

  return values.map((value, index) => {
    const x = values.length === 1 ? 50 : (index / (values.length - 1)) * chartWidth;
    const normalized = (value - minValue.value) / span;
    const y = chartBottom - normalized * (chartBottom - chartTop);
    return { x, y, value, label: safeLabels.value[index] };
  });
});

const activePoint = computed(() => points.value[activeIndex.value] ?? null);
const tooltipAlignmentClass = computed(() => {
  const x = activePoint.value?.x ?? 50;
  if (x <= 14) {
    return 'translate-x-0';
  }
  if (x >= 86) {
    return '-translate-x-full';
  }
  return '-translate-x-1/2';
});

const linePath = computed(() => buildSmoothPath(points.value));
const areaPath = computed(() => {
  if (!points.value.length) {
    return '';
  }

  const first = points.value[0];
  const last = points.value[points.value.length - 1];
  return `${buildSmoothPath(points.value)} L ${last.x} ${chartHeight} L ${first.x} ${chartHeight} Z`;
});

function updateHoveredIndex(clientX: number) {
  if (!chartAreaRef.value || !safeValues.value.length) {
    return;
  }

  const rect = chartAreaRef.value.getBoundingClientRect();
  const offsetX = Math.min(Math.max(clientX - rect.left, 0), rect.width);
  const ratio = rect.width ? offsetX / rect.width : 0;
  const index = Math.round(ratio * (safeValues.value.length - 1));
  hoveredIndex.value = Math.min(Math.max(index, 0), safeValues.value.length - 1);
}

function handlePointerMove(event: MouseEvent) {
  updateHoveredIndex(event.clientX);
}

function handleTouchMove(event: TouchEvent) {
  const touch = event.touches[0];
  if (!touch) {
    return;
  }
  updateHoveredIndex(touch.clientX);
}

function clearHover() {
  hoveredIndex.value = null;
}

function displayValue(value: number) {
  return `${props.valuePrefix}${value.toLocaleString()}`;
}

function formatDelta(value: number) {
  return `${value >= 0 ? '+' : ''}${value.toLocaleString()}`;
}

function buildSmoothPath(pointsList: Array<{ x: number; y: number }>) {
  if (!pointsList.length) {
    return '';
  }
  if (pointsList.length === 1) {
    const point = pointsList[0];
    return `M ${point.x} ${point.y}`;
  }

  let path = `M ${pointsList[0].x} ${pointsList[0].y}`;

  for (let index = 1; index < pointsList.length; index += 1) {
    const previous = pointsList[index - 1];
    const current = pointsList[index];
    const controlPoint1X = previous.x + (current.x - previous.x) / 3;
    const controlPoint1Y = previous.y;
    const controlPoint2X = current.x - (current.x - previous.x) / 3;
    const controlPoint2Y = current.y;

    path += ` C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${current.x} ${current.y}`;
  }

  return path;
}
</script>
