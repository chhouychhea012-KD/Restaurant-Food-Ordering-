<template>
  <div class="relative isolate min-h-screen overflow-x-hidden bg-slate-100 lg:h-screen lg:overflow-hidden">
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_rgba(241,245,249,0.92)_48%,_rgba(226,232,240,0.88))]"></div>
      <div class="absolute left-[8%] top-[12%] h-64 w-64 rounded-full bg-orange-200/45 blur-3xl"></div>
      <div class="absolute bottom-[8%] right-[10%] h-72 w-72 rounded-full bg-sky-200/40 blur-3xl"></div>
    </div>

    <div class="relative z-10 min-h-screen w-full px-4 py-8 sm:px-6 lg:h-screen lg:px-0 lg:py-0">
      <section class="mb-8 flex flex-col items-center gap-5 lg:hidden">
        <RouterLink
          to="/"
          class="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur transition hover:border-brand-200 hover:text-brand-600"
        >
          <span aria-hidden="true" class="text-lg leading-none">&larr;</span>
          <span>Back to home</span>
        </RouterLink>

        <div class="w-full max-w-3xl p-2 sm:p-4">
          <img :src="currentScene.image" :alt="currentScene.alt" class="mx-auto max-h-[280px] w-full max-w-xs object-contain sm:max-w-sm" />
        </div>
      </section>

      <div class="lg:grid lg:h-full lg:grid-cols-[500px_minmax(460px,1fr)] lg:gap-4 lg:pl-10 xl:grid-cols-[540px_minmax(480px,1fr)] xl:gap-6 xl:pl-14">
        <section class="relative hidden lg:flex lg:min-h-0 lg:flex-col lg:pt-6 lg:pb-2">
          <RouterLink
            to="/"
            class="inline-flex w-fit items-center gap-2 rounded-full border border-white/80 bg-white/75 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur transition hover:border-brand-200 hover:text-brand-600"
          >
            <span aria-hidden="true" class="text-lg leading-none">&larr;</span>
            <span>Back to home</span>
          </RouterLink>

          <div class="mt-4 flex flex-1 items-end">
            <div class="w-full max-w-[360px] xl:max-w-[420px]">
              <img
                :src="currentScene.image"
                :alt="currentScene.alt"
                class="h-auto max-h-[calc(100vh-190px)] w-full object-contain object-left-bottom"
              />
            </div>
          </div>
        </section>

        <section class="auth-form-scroll lg:h-screen lg:overflow-y-auto lg:overscroll-contain lg:[scrollbar-gutter:stable]">
          <div class="mx-auto w-full max-w-md pb-8 lg:mx-0 lg:mr-auto lg:flex lg:min-h-screen lg:flex-col lg:justify-center lg:py-8 lg:pl-4 lg:pr-8 xl:pl-8 xl:pr-10">
            <img src="/image/logo.png" alt="Flavor Fleet" class="mx-auto h-24 w-auto sm:h-28" />

            <div class="surface-card mt-6 border border-white/80 bg-white/95 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.10)] sm:p-8">
              <RouterView />
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';

const route = useRoute();

const scenes = {
  login: {
    image: '/image/login.png',
    alt: 'Login illustration',
    eyebrow: 'Secure Access',
    title: 'Manage orders and restaurant operations in one place.',
    description: 'Sign in to continue tracking orders, customers, deliveries, and your restaurant dashboard with a faster, cleaner workspace.',
  },
  register: {
    image: '/image/register.png',
    alt: 'Register illustration',
    eyebrow: 'Create Account',
    title: 'Start ordering from your favorite restaurants in minutes.',
    description: 'Set up your customer account to browse menus, save addresses, track deliveries, and reorder your go-to meals anytime.',
  },
  'forgot-password': {
    image: '/image/forgot.png',
    alt: 'Password recovery illustration',
    eyebrow: 'Password Recovery',
    title: 'Recover access and get back to your account smoothly.',
    description: 'Request a reset link, confirm your identity, and continue where you left off without losing your saved order history.',
  },
} as const;

const currentScene = computed(() => {
  const sceneKey = typeof route.name === 'string' ? route.name : 'login';
  return scenes[sceneKey as keyof typeof scenes] ?? scenes.login;
});
</script>

<style scoped>
.auth-form-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.7) transparent;
}

.auth-form-scroll::-webkit-scrollbar {
  width: 8px;
}

.auth-form-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.auth-form-scroll::-webkit-scrollbar-thumb {
  border: 2px solid transparent;
  border-radius: 9999px;
  background-clip: padding-box;
  background-color: rgba(148, 163, 184, 0.7);
}

.auth-form-scroll::-webkit-scrollbar-thumb:hover {
  background-color: rgba(100, 116, 139, 0.82);
}
</style>




