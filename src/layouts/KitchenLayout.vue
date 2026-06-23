<template>
  <div class="min-h-screen bg-slate-950 p-4 text-white lg:p-6">
    <div class="mx-auto max-w-7xl">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p class="text-sm uppercase tracking-[0.3em] text-orange-300">Kitchen Dispatch Board</p>
          <h1 class="mt-2 text-3xl font-bold">{{ authStore.user?.name }}</h1>
        </div>
        <div class="flex items-center gap-3">
          <RouterLink to="/" class="btn-secondary border-white/10 bg-white/10 text-white hover:bg-white/20">Customer View</RouterLink>
          <button class="btn-primary" @click="handleLogout">Logout</button>
        </div>
      </div>
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
const router = useRouter();

function handleLogout() {
  authStore.performLogout();
  void router.push('/');
}
</script>
