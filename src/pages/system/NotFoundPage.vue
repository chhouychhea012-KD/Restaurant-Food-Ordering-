<template>
  <div class="flex min-h-screen items-center justify-center p-6">
    <div class="surface-card max-w-lg p-8 text-center">
      <p class="text-xs font-bold uppercase tracking-[0.3em] text-brand-500">Route Boundary</p>
      <h1 class="mt-3 text-3xl font-bold text-slate-900">Page not found</h1>
      <p class="mt-3 text-sm leading-6 text-slate-600">
        The route you requested does not exist in the current milestone build. Use the main navigation to continue.
      </p>
      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <RouterLink class="btn-primary" to="/">Go to storefront</RouterLink>
        <RouterLink class="btn-secondary" to="/auth/login">Open login</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>
