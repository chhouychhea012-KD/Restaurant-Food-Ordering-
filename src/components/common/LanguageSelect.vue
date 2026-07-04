<template>
  <div ref="menuRef" data-i18n-ignore class="relative inline-flex">
    <button
      class="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-200"
      type="button"
      :aria-label="t('Language')"
      :title="t('Language')"
      aria-haspopup="listbox"
      :aria-expanded="isOpen ? 'true' : 'false'"
      @click="toggleMenu"
    >
      <span class="flex h-5 w-7 shrink-0 overflow-hidden rounded-md ring-1 ring-slate-200">
        <img
          v-if="currentLanguage.flagUrl && !failedImages[currentLanguage.code]"
          class="h-full w-full object-cover"
          :src="currentLanguage.flagUrl"
          :alt="currentLanguage.name"
          @error="markImageFailed(currentLanguage.code)"
        />
        <span v-else class="flex h-full w-full items-center justify-center text-sm">{{ currentLanguage.flag }}</span>
      </span>
      <span class="hidden sm:inline">{{ currentLanguage.nativeName }}</span>
      <svg class="h-4 w-4 text-slate-400 transition" :class="isOpen ? 'rotate-180' : ''" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clip-rule="evenodd" />
      </svg>
    </button>

    <transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="translate-y-1 opacity-0 scale-[0.98]"
      enter-to-class="translate-y-0 opacity-100 scale-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="translate-y-0 opacity-100 scale-100"
      leave-to-class="translate-y-1 opacity-0 scale-[0.98]"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 shadow-[0_18px_50px_rgba(15,23,42,0.16)]"
        role="listbox"
        :aria-label="t('Language')"
      >
        <button
          v-for="language in languages"
          :key="language.code"
          class="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold transition hover:bg-slate-50"
          :class="language.code === locale ? 'bg-brand-50 text-brand-700' : 'text-slate-700'"
          type="button"
          role="option"
          :aria-selected="language.code === locale ? 'true' : 'false'"
          @click="chooseLanguage(language.code)"
        >
          <span class="flex h-6 w-8 shrink-0 overflow-hidden rounded-md ring-1 ring-slate-200">
            <img
              v-if="language.flagUrl && !failedImages[language.code]"
              class="h-full w-full object-cover"
              :src="language.flagUrl"
              :alt="language.name"
              @error="markImageFailed(language.code)"
            />
            <span v-else class="flex h-full w-full items-center justify-center text-sm">{{ language.flag }}</span>
          </span>
          <span class="flex min-w-0 flex-col leading-tight">
            <span class="truncate">{{ language.nativeName }}</span>
            <span class="text-xs font-medium text-slate-400">{{ language.name }}</span>
          </span>
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useI18n, type LocaleCode } from '@/composables/useI18n';

const { currentLanguage, languages, locale, setLocale, t } = useI18n();
const isOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null);
const failedImages = reactive<Partial<Record<LocaleCode, boolean>>>({});

function toggleMenu() {
  isOpen.value = !isOpen.value;
}

function chooseLanguage(code: LocaleCode) {
  setLocale(code);
  isOpen.value = false;
}

function markImageFailed(code: LocaleCode) {
  failedImages[code] = true;
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target;
  if (target instanceof Node && menuRef.value && !menuRef.value.contains(target)) {
    isOpen.value = false;
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    isOpen.value = false;
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
  window.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('click', handleClickOutside);
  window.removeEventListener('keydown', handleKeydown);
});
</script>