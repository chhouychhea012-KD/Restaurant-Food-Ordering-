<template>
  <footer class="mt-10 border-t border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.35),rgba(255,255,255,0.92)),radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_28%)]">
    <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div class="grid gap-6 xl:grid-cols-[1.25fr_0.75fr_0.75fr]">
        <section class="surface-card overflow-hidden p-6 sm:p-7">
          <div class="flex flex-wrap items-start gap-4">
            <AppLogo />
          </div>
          <p class="mt-6 max-w-2xl text-sm leading-7 text-slate-600">
            Flavor Fleet connects customers, restaurants, kitchen teams, and riders in one fast frontend workflow with protected auth, live order handling, and admin catalog control.
          </p>
          <div class="mt-6 grid gap-3 sm:grid-cols-3">
            <div class="rounded-[1.5rem] border border-slate-200 bg-slate-50/85 px-4 py-4">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Coverage</p>
              <p class="mt-2 text-lg font-bold text-slate-950">City-wide</p>
              <p class="mt-1 text-xs text-slate-500">Restaurants, riders, and dispatch flow</p>
            </div>
            <div class="rounded-[1.5rem] border border-slate-200 bg-slate-50/85 px-4 py-4">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Checkout</p>
              <p class="mt-2 text-lg font-bold text-slate-950">Secure MVP</p>
              <p class="mt-1 text-xs text-slate-500">Protected cart, address, and order tracking</p>
            </div>
            <div class="rounded-[1.5rem] border border-slate-200 bg-slate-50/85 px-4 py-4">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Admin</p>
              <p class="mt-2 text-lg font-bold text-slate-950">Full CRUD</p>
              <p class="mt-1 text-xs text-slate-500">Users, roles, products, categories, and orders</p>
            </div>
          </div>
        </section>

        <section class="surface-card p-6 sm:p-7">
          <p class="text-xs font-semibold uppercase tracking-[0.22em] text-brand-500">Explore</p>
          <div class="mt-5 grid gap-3">
            <RouterLink
              v-for="link in primaryLinks"
              :key="link.to"
              :to="link.to"
              class="group relative rounded-[1.25rem] border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold transition"
              :class="isActiveLink(link.to) ? 'text-slate-950 shadow-sm' : 'text-slate-700 hover:-translate-y-0.5 hover:border-brand-300 hover:text-slate-950'"
            >
              <span>{{ link.label }}</span>
              <span
                class="absolute inset-x-4 bottom-2 h-[3px] rounded-full transition-all duration-300"
                :class="isActiveLink(link.to) ? 'bg-gradient-to-r from-brand-500 via-orange-400 to-amber-300 opacity-100' : 'bg-slate-300 opacity-0 group-hover:opacity-100'"
              />
            </RouterLink>
          </div>
        </section>

        <section class="surface-card p-6 sm:p-7">
          <p class="text-xs font-semibold uppercase tracking-[0.22em] text-brand-500">Customer Flow</p>
          <div class="mt-5 space-y-4">
            <div class="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
              <p class="text-sm font-semibold text-slate-900">Order in minutes</p>
              <p class="mt-2 text-sm leading-6 text-slate-600">Browse restaurants, categories, add to cart, checkout, and follow delivery updates from one clean frontend experience.</p>
            </div>
            <div class="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
              <p class="text-sm font-semibold text-slate-900">Protected account routes</p>
              <p class="mt-2 text-sm leading-6 text-slate-600">Login, register, profile, addresses, dashboard, category filters, notifications, and order history stay connected through route validation.</p>
            </div>
          </div>
        </section>
      </div>

      <div class="mt-6 flex flex-col gap-3 rounded-[1.75rem] border border-slate-200/80 bg-white/85 px-5 py-4 text-sm text-slate-500 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p>© {{ currentYear }} Flavor Fleet. Frontend customer experience with full system workflow.</p>
        <div class="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          <span>Local JSON data</span>
          <span>Route protection</span>
          <span>Creative UI</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router';
import AppLogo from './AppLogo.vue';

const route = useRoute();
const currentYear = new Date().getFullYear();

const primaryLinks = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Restaurants', to: '/restaurants' },
  { label: 'Categories', to: '/categories' },
  { label: 'Notifications', to: '/notifications' },
  { label: 'Customer Dashboard', to: '/dashboard' },
  { label: 'Track Order', to: '/track-order' },
  { label: 'Login / Register', to: '/auth/login' },
];

function isActiveLink(target: string) {
  if (target === '/') {
    return route.path === '/';
  }

  if (target === '/auth/login') {
    return route.path.startsWith('/auth');
  }

  if (target === '/track-order') {
    return route.path === '/track-order';
  }

  return route.path === target || route.path.startsWith(`${target}/`);
}
</script>
