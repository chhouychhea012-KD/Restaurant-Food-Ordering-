<template>  <div class="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute left-1/2 top-0 h-72 w-72 -translate-x-[140%] rounded-full bg-orange-200/45 blur-3xl"></div>
      <div class="absolute bottom-0 right-1/2 h-80 w-80 translate-x-[135%] rounded-full bg-sky-200/55 blur-3xl"></div>
      <div class="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-white/70 to-transparent"></div>
    </div>

     <div class="relative z-10 flex w-full max-w-xl flex-col items-center">
      <RouterLink
        to="/"
        class="mb-5 inline-flex items-center gap-3 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:border-orange-200 hover:text-brand-600"
      >
        <span class="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-base font-bold text-white">F</span>
        <span>Flavor Fleet Platform</span>
      </RouterLink>

      <div class="surface-card w-full max-w-lg p-5 sm:p-6 lg:p-7">
       <RouterView />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
</script>
