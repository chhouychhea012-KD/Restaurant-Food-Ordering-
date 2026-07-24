<template>
  <div class="space-y-6">
    <SectionCard eyebrow="Rider Profile" title="Availability and delivery profile" description="Manage your rider identity, shift status, and delivery workspace shortcuts.">
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div class="surface-muted p-5">
          <p class="text-sm font-semibold text-slate-900">Name</p>
          <p class="mt-2 text-sm text-slate-600">{{ authStore.user?.name }}</p>
        </div>
        <div class="surface-muted p-5">
          <p class="text-sm font-semibold text-slate-900">Shift status</p>
          <p class="mt-2 text-sm text-slate-600">{{ authStore.user?.shiftActive ? 'Online and dispatchable' : 'Offline' }}</p>
        </div>
        <div class="surface-muted p-5">
          <p class="text-sm font-semibold text-slate-900">Workspace</p>
          <p class="mt-2 text-sm text-slate-600">Delivery Rider</p>
        </div>
        <div class="surface-muted p-5">
          <p class="text-sm font-semibold text-slate-900">Performance rating</p>
          <p class="mt-2 text-sm text-slate-600">4.9 / 5.0</p>
        </div>
      </div>

      <div class="mt-6 flex flex-wrap gap-3">
        <RouterLink class="btn-primary" to="/rider/deliveries">Open deliveries</RouterLink>
        <RouterLink class="btn-secondary" to="/notifications">Notifications</RouterLink>
      </div>
    </SectionCard>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import SectionCard from '@/components/common/SectionCard.vue';
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
</script>