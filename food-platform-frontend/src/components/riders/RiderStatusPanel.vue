<template>
  <div class="surface-card p-5">
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-sm font-medium text-slate-500">Availability</p>
        <h3 class="mt-2 text-2xl font-bold text-slate-950">{{ active ? 'Online and dispatchable' : 'Offline' }}</h3>
      </div>
      <StatusBadge :status="active ? 'ONLINE' : 'OFFLINE'" />
    </div>
    <button class="btn-primary mt-5 w-full" @click="$emit('toggle')">
      {{ active ? 'Go Offline' : 'Go Online' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import StatusBadge from '@/components/common/StatusBadge.vue';

defineEmits<{
  toggle: [];
}>();

defineProps<{
  active: boolean;
}>();
</script>
