<template>
  <aside class="lg:sticky lg:top-6 lg:self-start">
    <div class="surface-card flex h-full flex-col p-4 lg:h-[calc(100vh-3rem)] lg:overflow-hidden">
      <div class="mb-6 shrink-0">
        <AppLogo :to="homePath" />
      </div>
      <nav class="space-y-2 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1">
        <RouterLink
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          class="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition"
          :class="route.path === item.to ? 'bg-slate-900 text-white shadow-lg shadow-slate-200/60' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'"
        >
          <span>{{ item.label }}</span>
          <span v-if="item.badge" class="rounded-full bg-white/10 px-2 py-1 text-xs">{{ item.badge }}</span>
        </RouterLink>
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import AppLogo from './AppLogo.vue';

interface Item {
  label: string;
  to: string;
  badge?: string;
}

const props = defineProps<{
  items: Item[];
}>();

const route = useRoute();
const homePath = computed(() => props.items[0]?.to ?? '/');
</script>
