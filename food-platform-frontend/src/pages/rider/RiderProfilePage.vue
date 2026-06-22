<template>
  <SectionCard eyebrow="Rider Profile" title="Availability and earnings snapshot" description="A compact rider workspace that keeps the mobile operational context visible.">
    <div class="grid gap-4 md:grid-cols-2">
      <div class="surface-muted p-5">
        <p class="text-sm font-semibold text-slate-900">Name</p>
        <p class="mt-2 text-sm text-slate-600">{{ authStore.user?.name }}</p>
      </div>
      <div class="surface-muted p-5">
        <p class="text-sm font-semibold text-slate-900">Shift status</p>
        <p class="mt-2 text-sm text-slate-600">{{ authStore.user?.shiftActive ? 'Online' : 'Offline' }}</p>
      </div>
      <div class="surface-muted p-5">
        <p class="text-sm font-semibold text-slate-900">Today's estimated earnings</p>
        <p class="mt-2 text-sm text-slate-600">฿640</p>
      </div>
      <div class="surface-muted p-5">
        <p class="text-sm font-semibold text-slate-900">Performance rating</p>
        <p class="mt-2 text-sm text-slate-600">4.9 / 5.0</p>
      </div>
    </div>
  </SectionCard>
</template>

<script setup lang="ts">
import SectionCard from '@/components/common/SectionCard.vue';
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
</script>
