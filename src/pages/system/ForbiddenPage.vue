<template>
  <div class="flex min-h-screen items-center justify-center p-6">
    <div class="surface-card max-w-md p-8 text-center">
      <p class="text-xs font-bold uppercase tracking-[0.3em] text-brand-500">Permission Guard</p>
      <h1 class="mt-3 text-2xl font-bold text-slate-900">Access denied</h1>
      <p class="mt-3 text-sm leading-6 text-slate-600">
        {{ message }}
      </p>
      <p v-if="nextAllowedAt" class="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        Next allowed window: {{ nextAllowedAt }}
      </p>
      <RouterLink class="btn-primary mt-6" :to="returnTarget">Return to your workspace</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { formatPreciseDateTime } from '@/utils/format';

const authStore = useAuthStore();
const route = useRoute();

const reason = computed(() => (typeof route.query.reason === 'string' ? route.query.reason : 'permission'));
const detail = computed(() => (typeof route.query.detail === 'string' ? route.query.detail : ''));
const status = computed(() => (typeof route.query.status === 'string' ? route.query.status : ''));
const nextAllowedAt = computed(() => {
  const value = authStore.accessEvaluation.nextAllowedAt;
  return value ? formatPreciseDateTime(value) : '';
});

const message = computed(() => {
  switch (reason.value) {
    case 'account-status':
      return status.value
        ? `Your account is currently ${status.value.toLowerCase()}. Contact a platform administrator to restore access.`
        : 'Your account is not currently active.';
    case 'access-window':
      return detail.value || authStore.accessEvaluation.message;
    case 'workspace':
      return 'Your current role assignment does not include this workspace.';
    case 'permission':
    default:
      return 'Your current role or permission set does not allow this route right now.';
  }
});

const returnTarget = computed(() => authStore.defaultWorkspaceRoute);
</script>
