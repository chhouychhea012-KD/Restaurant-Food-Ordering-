<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader />
    <main class="mx-auto flex-1 w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
