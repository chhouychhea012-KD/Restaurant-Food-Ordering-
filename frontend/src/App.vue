<template>
  <div ref="appRoot">
    <RouterView />
    <AppDialogHost />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RouterView } from 'vue-router';
import AppDialogHost from '@/components/common/AppDialogHost.vue';
import { useAutoTranslate } from '@/composables/useI18n';

const appRoot = ref<HTMLElement | null>(null);

useAutoTranslate(appRoot);
</script>