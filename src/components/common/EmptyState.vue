<template>
  <div class="surface-muted p-8 text-center">
    <p class="text-lg font-semibold text-slate-900">{{ title }}</p>
    <p class="mt-2 text-sm text-slate-500">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  message: string;
}>();
</script>
