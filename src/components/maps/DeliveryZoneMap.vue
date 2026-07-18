<template>
  <div class="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-4">
    <div class="rounded-lg border border-white/80 bg-white p-4 shadow-sm">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p class="text-sm font-bold text-slate-950">Dispatch Coverage</p>
          <p class="mt-1 text-xs text-slate-500">Bangkok delivery radius and active branch flow</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <span class="pill bg-emerald-50 text-emerald-700">Live zones</span>
          <span class="pill bg-brand-50 text-brand-700">Mock map</span>
        </div>
      </div>

      <div class="relative mt-4 h-64 overflow-hidden rounded-lg border border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_42%,#f0fdf4_100%)]">
        <div class="absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.16)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div class="absolute left-[10%] top-[14%] h-28 w-28 rounded-full border-[10px] border-brand-300/70 bg-brand-200/20 shadow-[0_18px_60px_rgba(249,115,22,0.16)]" />
        <div class="absolute left-[55%] top-[12%] h-24 w-24 rounded-full border-[10px] border-sky-300/75 bg-sky-200/20 shadow-[0_18px_60px_rgba(56,189,248,0.14)]" />
        <div class="absolute left-[34%] top-[42%] h-32 w-32 rounded-full border-[10px] border-emerald-300/75 bg-emerald-200/20 shadow-[0_18px_60px_rgba(52,211,153,0.16)]" />

        <svg class="absolute inset-0 h-full w-full" viewBox="0 0 640 256" fill="none" aria-hidden="true">
          <path d="M108 154 C 180 95, 260 99, 326 140 S 456 186, 534 92" stroke="#fb923c" stroke-width="5" stroke-linecap="round" stroke-dasharray="10 12" />
          <path d="M108 154 C 180 95, 260 99, 326 140 S 456 186, 534 92" stroke="white" stroke-width="2" stroke-linecap="round" stroke-dasharray="10 12" />
        </svg>

        <div class="absolute left-[16%] top-[46%] h-5 w-5 rounded-full border-4 border-white bg-brand-500 shadow-lg shadow-brand-200" />
        <div class="absolute left-[49%] top-[56%] h-5 w-5 rounded-full border-4 border-white bg-emerald-500 shadow-lg shadow-emerald-200" />
        <div class="absolute left-[80%] top-[29%] h-5 w-5 rounded-full border-4 border-white bg-sky-500 shadow-lg shadow-sky-200" />

        <div class="absolute bottom-4 left-4 rounded-lg border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
          <p class="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Coverage</p>
          <p class="mt-1 text-lg font-bold text-slate-950">3 active zones</p>
        </div>
      </div>

      <div class="mt-4 grid gap-3 sm:grid-cols-3">
        <div v-for="zone in zones" :key="zone.name" class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
          <div class="flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded-full" :class="zone.dotClass" />
            <p class="text-sm font-bold text-slate-900">{{ zone.name }}</p>
          </div>
          <p class="mt-2 text-xs text-slate-500">{{ zone.detail }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const zones = [
  { name: 'Core', detail: '18 min avg', dotClass: 'bg-brand-500' },
  { name: 'East', detail: '22 min avg', dotClass: 'bg-emerald-500' },
  { name: 'North', detail: '25 min avg', dotClass: 'bg-sky-500' },
];
</script>