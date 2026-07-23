<template>
  <aside class="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:self-start">
    <div class="surface-card flex h-full min-h-0 flex-col overflow-hidden p-3 sm:p-4">
      <div class="hidden shrink-0 lg:mb-5 lg:block">
        <AppLogo :to="homePath" />
      </div>
      <nav class="thin-scrollbar flex gap-2 overflow-x-auto pb-1 lg:-mr-1 lg:min-h-0 lg:flex-1 lg:flex-col lg:gap-0 lg:space-y-1.5 lg:overflow-y-auto lg:pb-0 lg:pr-1 lg:[scrollbar-gutter:stable]">
        <RouterLink
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          class="flex shrink-0 items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition sm:px-4 lg:w-full lg:shrink lg:px-4 lg:py-3"
          :class="isActive(item.to) ? 'bg-brand-500 text-white shadow-sm shadow-orange-100' : 'bg-slate-50 text-slate-600 hover:bg-orange-50 hover:text-brand-700 lg:bg-transparent'"
          :aria-current="isActive(item.to) ? 'page' : undefined"
        >
          <span class="whitespace-nowrap">{{ item.label }}</span>
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