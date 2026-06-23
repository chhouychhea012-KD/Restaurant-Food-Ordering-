<template>
  <div class="flex min-h-screen items-center justify-center p-4 sm:p-6">
    <div class="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <section class="hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-orange-600 to-amber-400 p-10 text-white shadow-glow lg:block">
        <p class="text-xs font-bold uppercase tracking-[0.35em] text-orange-100">Full Frontend MVP</p>
        <h1 class="mt-5 text-5xl font-extrabold leading-tight">One platform for every food delivery role.</h1>
        <p class="mt-5 max-w-xl text-base leading-8 text-orange-50">
          Demo auth, protected routes, local JSON data, customer checkout, admin monitoring, kitchen queue, and rider dispatch views are all wired together in a single frontend build.
        </p>
        <div class="mt-8 grid grid-cols-2 gap-4">
          <div class="rounded-3xl bg-white/10 p-5">
            <p class="text-3xl font-bold">5</p>
            <p class="mt-1 text-sm text-orange-100">Role-based workspaces</p>
          </div>
          <div class="rounded-3xl bg-white/10 p-5">
            <p class="text-3xl font-bold">JSON</p>
            <p class="mt-1 text-sm text-orange-100">Mock persistent data layer</p>
          </div>
        </div>
      </section>
      <div class="surface-card p-6 sm:p-8">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>
