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
      <div v-if="open" ref="modalRoot" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-8 backdrop-blur-sm" @click.self="emit('close')">
        <div class="w-full overflow-hidden rounded-[2rem] border border-white/40 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.28)]" :class="sizeClass">
          <div class="border-b border-slate-200/80 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.15),transparent_28%),linear-gradient(180deg,#ffffff,rgba(248,250,252,0.92))] px-6 py-5 sm:px-7">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p v-if="eyebrow" data-i18n-ignore class="text-xs font-bold uppercase tracking-[0.3em] text-brand-500">{{ t(eyebrow) }}</p>
                <h3 data-i18n-ignore class="mt-2 text-2xl font-bold text-slate-950">{{ t(title) }}</h3>
                <p v-if="description" data-i18n-ignore class="mt-2 max-w-2xl text-sm text-slate-600">{{ t(description) }}</p>
              </div>
              <button data-i18n-ignore class="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-900" type="button" @click="emit('close')">
                {{ t('Close') }}
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
import { computed, nextTick, ref, watch } from 'vue';
import { translateText as t, useAutoTranslate } from '@/composables/useI18n';

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
const modalRoot = ref<HTMLElement | null>(null);
const { refreshTranslations } = useAutoTranslate(modalRoot);

watch(
  () => props.open,
  () => {
    void nextTick(refreshTranslations);
  },
);

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
