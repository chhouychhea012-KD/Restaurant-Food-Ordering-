<template>
  <RouterLink :to="to" data-i18n-ignore class="flex min-w-0 items-center gap-3 sm:gap-4">
    <div class="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white shadow-lg shadow-brand-200 ring-1 ring-slate-200 sm:h-14 sm:w-14 sm:rounded-xl lg:h-16 lg:w-16">
      <img src="/image/logo.png" :alt="t('Golden Land Restaurant logo')" class="h-full w-full object-cover" />
    </div>
    <div class="min-w-0">
      <p class="truncate text-sm font-semibold uppercase tracking-[0.08em] text-brand-500 sm:text-base sm:tracking-[0.12em]">Golden Land Restaurant</p>
      <p class="hidden text-sm font-medium text-slate-600 sm:block">{{ t('Restaurant platform') }}</p>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { translateText as t } from '@/composables/useI18n';

withDefaults(
  defineProps<{
    to?: string;
  }>(),
  {
    to: '/',
  },
);
</script>