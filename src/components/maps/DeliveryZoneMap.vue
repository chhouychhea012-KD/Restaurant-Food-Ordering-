<template>
  <div class="surface-muted h-72 overflow-hidden p-4">
    <div class="flex h-full flex-col rounded-xl bg-[linear-gradient(135deg,#dbeafe,#ecfccb)] p-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-semibold text-slate-800">Dispatch Coverage</p>
          <p class="text-xs text-slate-500">Radius-based preview for Bangkok delivery zones</p>
        </div>
        <span class="pill bg-white/70 text-slate-700">Mock Map</span>
      </div>
      <div class="relative mt-4 flex-1 rounded-xl bg-white/60">
        <div class="absolute left-[18%] top-[24%] h-24 w-24 rounded-full border-8 border-brand-300/80 bg-brand-300/20" />
        <div class="absolute left-[52%] top-[18%] h-20 w-20 rounded-full border-8 border-sky-300/80 bg-sky-300/20" />
        <div class="absolute left-[36%] top-[48%] h-28 w-28 rounded-full border-8 border-emerald-300/80 bg-emerald-300/20" />
        <div class="absolute left-[29%] top-[40%] h-4 w-4 rounded-full bg-slate-900 shadow-lg shadow-slate-400" />
        <div class="absolute left-[56%] top-[37%] h-4 w-4 rounded-full bg-slate-900 shadow-lg shadow-slate-400" />
      </div>
    </div>
  </div>
</template>
