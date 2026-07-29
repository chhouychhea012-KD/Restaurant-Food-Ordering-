<template>
  <section class="surface-card p-4 sm:p-6">
    <div class="flex min-w-0 flex-col items-stretch gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="min-w-0">
        <p data-i18n-ignore class="text-xs font-bold uppercase tracking-[0.18em] text-brand-500">{{ t(eyebrow) }}</p>
        <h2 data-i18n-ignore class="mobile-text-wrap mt-1.5 text-xl font-bold text-slate-950 sm:text-2xl">{{ t(title) }}</h2>
        <p v-if="description" data-i18n-ignore class="mobile-text-wrap mt-1.5 max-w-xl text-sm text-slate-500">{{ t(description) }}</p>
      </div>
      <div v-if="$slots.actions" class="flex w-full min-w-0 flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
        <slot name="actions" />
      </div>
    </div>
    <div class="mt-5 min-w-0">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import { translateText as t } from '@/composables/useI18n';
defineProps<{
  eyebrow: string;
  title: string;
  description?: string;
}>();
</script>