<template>
  <aside class="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:self-start">
    <div class="surface-card flex h-full min-h-0 flex-col overflow-hidden p-4">
      <div class="mb-5 shrink-0">
        <AppLogo :to="homePath" />
      </div>
      <nav class="thin-scrollbar -mr-1 min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1 [scrollbar-gutter:stable]">
        <RouterLink
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          class="flex items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold transition"
          :class="isActive(item.to) ? 'bg-brand-500 text-white shadow-sm shadow-orange-100' : 'text-slate-600 hover:bg-orange-50 hover:text-brand-700'"
          :aria-current="isActive(item.to) ? 'page' : undefined"
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

function isActive(target: string) {
  return route.path === target || (target !== homePath.value && route.path.startsWith(`${target}/`));
}
</script>
