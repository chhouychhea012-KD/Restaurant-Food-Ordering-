<template>
  <div class="flex min-h-screen flex-col pt-20 sm:pt-24">
    <AppHeader />
    <main class="page-shell flex-1">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import AppFooter from '@/components/common/AppFooter.vue';
import AppHeader from '@/components/common/AppHeader.vue';
</script>
