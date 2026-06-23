<template>
  <RouterLink :to="to" class="flex items-center gap-4">
    <div class="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[1.75rem] bg-white shadow-lg shadow-brand-200 ring-1 ring-slate-200">
      <img src="/image/logo.png" alt="Flavor Fleet logo" class="h-full w-full object-cover" />
    </div>
    <div>
      <p class="text-base font-semibold uppercase tracking-[0.32em] text-brand-500">Flavor Fleet</p>
      <p class="text-sm font-medium text-slate-600">Restaurant platform</p>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    to?: string;
  }>(),
  {
    to: '/',
  },
);
</script>
