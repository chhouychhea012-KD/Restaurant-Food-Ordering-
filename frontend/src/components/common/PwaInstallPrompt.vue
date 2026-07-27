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
          <p class="mt-1 text-sm leading-5 text-slate-500">Install for quicker access to orders, delivery, and kitchen updates.</p>
        </div>
      </div>
      <div class="mt-4 flex gap-2">
        <button class="btn-secondary flex-1" type="button" @click="dismissInstallPrompt">Later</button>
        <button class="btn-primary flex-1" type="button" @click="installApp">Install</button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { useInstallPrompt } from '@/pwa/installPrompt';

const { canInstall, dismissInstallPrompt, installApp } = useInstallPrompt();
</script>
