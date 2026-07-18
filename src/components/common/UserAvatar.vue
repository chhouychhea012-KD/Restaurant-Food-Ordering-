<template>
  <div :class="avatarClass" :title="user?.name || 'Profile'">
    <img v-if="user?.avatarUrl" :src="user.avatarUrl" :alt="`${user.name} profile`" class="h-full w-full object-cover" />
    <span v-else>{{ initials }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { User } from '@/types';

const props = withDefaults(
  defineProps<{
    user?: User | null;
    size?: 'sm' | 'md' | 'lg' | 'xl';
  }>(),
  {
    user: null,
    size: 'md',
  },
);

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'h-10 w-10 text-sm rounded-lg';
    case 'lg':
      return 'h-16 w-16 text-xl rounded-xl';
    case 'xl':
      return 'h-24 w-24 text-3xl rounded-2xl';
    case 'md':
    default:
      return 'h-12 w-12 text-base rounded-xl';
  }
});

const avatarClass = computed(() => [
  'inline-flex shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-brand-500 to-orange-400 font-bold text-white shadow-sm ring-2 ring-white',
  sizeClass.value,
]);

const initials = computed(() => props.user?.avatar || props.user?.name?.charAt(0).toUpperCase() || 'U');
</script>