<template>
  <transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="translate-y-3 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-3 opacity-0"
  >
    <div
      v-if="canInstall"
      class="fixed bottom-4 left-4 right-4 z-[70] mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.18)] sm:left-auto sm:right-5"
      role="status"
    >
      <div class="flex items-start gap-3">
        <img src="/image/logo.png" alt="" class="h-11 w-11 rounded-lg object-cover" />
        <div class="min-w-0 flex-1">
          <p class="text-sm font-bold text-slate-950">Golden Land Restaurant</p>
          <p v-if="canInstallIos" class="mt-1 text-sm leading-5 text-slate-500">
            Install on iPhone or iPad from Safari for a full-screen app experience.
          </p>
          <p v-else class="mt-1 text-sm leading-5 text-slate-500">
            Install for quicker access to orders, delivery, and kitchen updates.
          </p>
        </div>
      </div>

      <div v-if="canInstallIos" class="mt-4 space-y-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
        <div class="flex items-center gap-2">
          <Share2 class="h-4 w-4 text-brand-600" aria-hidden="true" />
          <span>Tap Safari Share.</span>
        </div>
        <div class="flex items-center gap-2">
          <PlusSquare class="h-4 w-4 text-brand-600" aria-hidden="true" />
          <span>Choose Add to Home Screen.</span>
        </div>
      </div>

      <div class="mt-4 flex gap-2">
        <button class="btn-secondary flex-1" type="button" @click="dismissInstallPrompt">Later</button>
        <button v-if="canNativeInstall" class="btn-primary flex-1" type="button" @click="installApp">Install</button>
        <button v-else class="btn-primary flex-1" type="button" @click="dismissInstallPrompt">Got it</button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { PlusSquare, Share2 } from 'lucide-vue-next';
import { useInstallPrompt } from '@/pwa/installPrompt';

const { canInstall, canInstallIos, canNativeInstall, dismissInstallPrompt, installApp } = useInstallPrompt();
</script>