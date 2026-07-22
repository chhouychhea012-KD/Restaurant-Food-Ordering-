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
      <div
        v-if="dialogState.active"
        class="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/45 px-4 py-8 backdrop-blur-sm"
        @click.self="cancelDialog"
      >
        <form
          class="w-full max-w-lg overflow-hidden rounded-xl border border-white/50 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.28)]"
          @submit.prevent="confirmActiveDialog"
        >
          <div class="bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_30%),linear-gradient(180deg,#ffffff,rgba(248,250,252,0.95))] px-6 py-6">
            <div class="flex gap-4">
              <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" :class="iconToneClass">
                <AlertTriangle v-if="dialogState.active.tone === 'danger'" :size="22" />
                <CheckCircle2 v-else-if="dialogState.active.tone === 'success'" :size="22" />
                <Info v-else :size="22" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-xs font-bold uppercase tracking-[0.18em] text-brand-500">Action Required</p>
                <h2 class="mt-2 text-xl font-bold text-slate-950">{{ dialogState.active.title }}</h2>
                <p class="mt-2 text-sm leading-6 text-slate-600">{{ dialogState.active.message }}</p>
              </div>
            </div>

            <div v-if="dialogState.active.mode === 'prompt'" class="mt-5">
              <label class="field-label" for="app-dialog-input">{{ dialogState.active.inputLabel ?? 'Details' }}</label>
              <input
                id="app-dialog-input"
                v-model="dialogState.inputValue"
                class="field-input bg-white"
                type="text"
                :placeholder="dialogState.active.inputPlaceholder ?? ''"
                autofocus
              />
            </div>
          </div>

          <div class="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
            <button class="btn-secondary justify-center" type="button" @click="cancelDialog">
              {{ dialogState.active.cancelLabel }}
            </button>
            <button class="justify-center rounded-lg px-5 py-3 text-sm font-bold text-white shadow-sm transition" :class="confirmButtonClass" type="submit">
              {{ dialogState.active.confirmLabel }}
            </button>
          </div>
        </form>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-vue-next';
import { useAppDialog } from '@/composables/useAppDialog';

const { dialogState, cancelDialog, confirmActiveDialog } = useAppDialog();

const iconToneClass = computed(() => {
  if (dialogState.active?.tone === 'danger') {
    return 'bg-rose-100 text-rose-600';
  }
  if (dialogState.active?.tone === 'success') {
    return 'bg-emerald-100 text-emerald-600';
  }
  return 'bg-orange-100 text-brand-600';
});

const confirmButtonClass = computed(() => {
  if (dialogState.active?.tone === 'danger') {
    return 'bg-rose-500 hover:bg-rose-600';
  }
  if (dialogState.active?.tone === 'success') {
    return 'bg-emerald-600 hover:bg-emerald-700';
  }
  return 'bg-brand-500 hover:bg-brand-600';
});
</script>