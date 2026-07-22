<template>
  <section class="surface-card p-5 sm:p-6">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p data-i18n-ignore class="text-xs font-bold uppercase tracking-[0.18em] text-brand-500">{{ t(eyebrow) }}</p>
        <h2 data-i18n-ignore class="mt-1.5 text-xl font-bold text-slate-950 sm:text-2xl">{{ t(title) }}</h2>
        <p v-if="description" data-i18n-ignore class="mt-1.5 max-w-xl text-sm text-slate-500">{{ t(description) }}</p>
      </div>
      <div v-if="$slots.actions" class="flex items-center gap-3">
        <slot name="actions" />
      </div>
    </div>
    <div class="mt-5">
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