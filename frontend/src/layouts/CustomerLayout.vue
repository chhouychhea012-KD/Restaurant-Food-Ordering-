<template>
  <div class="flex min-h-screen flex-col pt-20 sm:pt-24">
    <AppHeader />
    <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
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
