<template>
  <div class="surface-card overflow-hidden">
    <div class="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div class="min-w-0">
        <p class="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Delivery Rider</p>
        <h3 class="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">{{ active ? 'Online and dispatchable' : 'Offline' }}</h3>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{{ active ? 'You can receive pickup and delivery tasks now.' : 'Go online when you are ready to accept deliveries.' }}</p>
      </div>
      <div class="flex shrink-0 flex-col gap-3 sm:items-end">
        <StatusBadge :status="active ? 'ONLINE' : 'OFFLINE'" />
        <button class="btn-primary w-full px-6 sm:w-auto" :disabled="saving" @click="$emit('toggle')">
          {{ saving ? 'Updating...' : active ? 'Go Offline' : 'Go Online' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import StatusBadge from '@/components/common/StatusBadge.vue';

defineEmits<{
  toggle: [];
}>();

defineProps<{
  active: boolean;
  saving?: boolean;
}>();
</script>
