<template>
  <Teleport to="body">
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-8 backdrop-blur-sm" @click.self="emit('close')">
        <div class="w-full overflow-hidden rounded-[2rem] border border-white/40 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.28)]" :class="sizeClass">
          <div class="border-b border-slate-200/80 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.15),transparent_28%),linear-gradient(180deg,#ffffff,rgba(248,250,252,0.92))] px-6 py-5 sm:px-7">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p v-if="eyebrow" class="text-xs font-bold uppercase tracking-[0.3em] text-brand-500">{{ eyebrow }}</p>
                <h3 class="mt-2 text-2xl font-bold text-slate-950">{{ title }}</h3>
                <p v-if="description" class="mt-2 max-w-2xl text-sm text-slate-600">{{ description }}</p>
              </div>
              <button class="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-900" type="button" @click="emit('close')">
                Close
              </button>
            </div>
          </div>
          <div class="max-h-[75vh] overflow-y-auto px-6 py-6 sm:px-7">
            <slot />
          </div>
          <div v-if="$slots.footer" class="border-t border-slate-200 bg-slate-50/80 px-6 py-4 sm:px-7">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    description?: string;
    eyebrow?: string;
    size?: 'md' | 'lg' | 'xl';
  }>(),
  {
    description: '',
    eyebrow: '',
    size: 'lg',
  },
);

const emit = defineEmits<{
  close: [];
}>();

const sizeClass = computed(() => {
  switch (props.size) {
    case 'md':
      return 'max-w-2xl';
    case 'xl':
      return 'max-w-6xl';
    case 'lg':
    default:
      return 'max-w-4xl';
  }
});
</script>
