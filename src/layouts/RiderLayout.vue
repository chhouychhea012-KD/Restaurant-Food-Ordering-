<template>
  <div class="min-h-screen bg-slate-100 p-4 lg:p-6">
    <div class="mx-auto max-w-5xl space-y-6">
      <div class="surface-card flex items-center justify-between gap-4 px-5 py-4">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.3em] text-brand-500">Rider Console</p>
          <h1 class="mt-2 text-2xl font-bold text-slate-950">{{ authStore.user?.name }}</h1>
        </div>
        <div class="flex items-center gap-3">
          <RouterLink to="/" class="btn-secondary">Browse Customer App</RouterLink>
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
