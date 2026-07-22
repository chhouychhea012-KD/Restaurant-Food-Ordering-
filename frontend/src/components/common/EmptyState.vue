<template>
  <div data-i18n-ignore class="surface-muted p-8 text-center">
    <p class="text-lg font-semibold text-slate-900">{{ t(title) }}</p>
    <p class="mt-2 text-sm text-slate-500">{{ t(message) }}</p>
  </div>
</template>

<script setup lang="ts">
import { translateText as t } from '@/composables/useI18n';

defineProps<{
  title: string;
  message: string;
}>();
</script>