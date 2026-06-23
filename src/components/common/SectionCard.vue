<template>
  <section class="surface-card p-6">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.25em] text-brand-500">{{ eyebrow }}</p>
        <h2 class="mt-2 text-2xl font-bold text-slate-950">{{ title }}</h2>
        <p v-if="description" class="mt-2 max-w-2xl text-sm text-slate-600">{{ description }}</p>
      </div>
      <div v-if="$slots.actions" class="flex items-center gap-3">
        <slot name="actions" />
      </div>
    </div>
    <div class="mt-6">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  eyebrow: string;
  title: string;
  description?: string;
}>();
</script>
