<template>
  <header class="sticky top-0 z-20 border-b border-white/60 bg-white/80 backdrop-blur">
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
      <AppLogo />
      <nav class="hidden items-center gap-1 text-sm font-medium lg:flex">
        <RouterLink
          v-for="item in links"
          :key="item.to"
          :to="item.to"
          class="group relative rounded-2xl px-4 py-2 transition"
          :class="isActiveLink(item.to) ? 'text-slate-950' : 'text-slate-600 hover:text-slate-950'"
        >
          <span>{{ item.label }}</span>
          <span
            class="absolute inset-x-4 -bottom-1 h-[3px] rounded-full transition-all duration-300"
            :class="isActiveLink(item.to) ? 'bg-gradient-to-r from-brand-500 via-orange-400 to-amber-300 opacity-100' : 'bg-slate-300 opacity-0 group-hover:opacity-100'"
          />
        </RouterLink>
      </nav>
      <div class="flex items-center gap-3">
        <LanguageSelect class="hidden sm:inline-flex" />
        <RouterLink
          v-if="authStore.user?.role === 'customer'"
          to="/notifications"
          class="group relative flex h-12 w-12 items-center justify-center rounded-2xl border bg-white text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:text-slate-950"
          :class="isActiveLink('/notifications')
            ? 'border-brand-200 bg-brand-50 text-brand-600 shadow-brand-100/70'
            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'"
          :aria-label="notificationAriaLabel"
          title="Notifications"
        >
          <svg
            class="h-5 w-5 transition-transform group-hover:scale-105"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
            <path d="M9.5 17a2.5 2.5 0 0 0 5 0" />
          </svg>
          <span class="sr-only">Notifications</span>
          <span v-if="notificationStore.unreadCount" class="absolute -right-1.5 -top-1.5 flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-brand-500 px-2 text-xs font-bold text-white shadow-lg shadow-brand-200">
            {{ compactCount }}
          </span>
        </RouterLink>
        <RouterLink
          to="/cart"
          class="btn-secondary group relative inline-flex items-center gap-2"
          :aria-label="cartAriaLabel"
          title="Cart"
        >
          <svg
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="9" cy="20" r="1.5" />
            <circle cx="18" cy="20" r="1.5" />
            <path d="M3 4h2l2.3 10.1a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 8H7" />
          </svg>
          <span>Cart</span>
          <span v-if="cartItemCount" class="absolute -right-2 -top-2 flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-brand-500 px-2 text-xs font-bold text-white shadow-lg shadow-brand-200">
            {{ cartBadgeCount }}
          </span>
        </RouterLink>
        <RouterLink v-if="!authStore.isAuthenticated" to="/auth/login" class="btn-primary">
          Login
        </RouterLink>
        <div v-else ref="accountMenuRef" class="relative">
          <button
            class="flex items-center gap-3 rounded-2xl border bg-white px-3 py-2 text-left shadow-sm ring-offset-2 transition hover:-translate-y-0.5"
            :class="isAccountMenuOpen
              ? 'border-brand-200 bg-brand-50 shadow-brand-100/70 ring-2 ring-brand-200'
              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'"
            type="button"
            aria-haspopup="menu"
            :aria-expanded="isAccountMenuOpen ? 'true' : 'false'"
            @click="toggleAccountMenu"
          >
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500 text-sm font-bold text-white shadow-lg shadow-brand-200">
              {{ authStore.user?.avatar }}
            </div>
            <div class="hidden min-w-0 sm:block">
              <p class="truncate text-sm font-semibold text-slate-900">{{ authStore.user?.name }}</p>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-400">{{ accountMenuEyebrow }}</p>
            </div>
            <svg
              class="h-4 w-4 text-slate-400 transition-transform sm:block"
              :class="isAccountMenuOpen ? 'rotate-180' : ''"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clip-rule="evenodd" />
            </svg>
          </button>

          <transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="translate-y-2 opacity-0 scale-[0.98]"
            enter-to-class="translate-y-0 opacity-100 scale-100"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="translate-y-0 opacity-100 scale-100"
            leave-to-class="translate-y-2 opacity-0 scale-[0.98]"
          >
            <div
              v-if="isAccountMenuOpen"
              class="absolute right-0 top-[calc(100%+0.85rem)] z-50 w-[290px] overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.18)]"
            >
              <div class="bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.14),transparent_32%),linear-gradient(180deg,#ffffff,rgba(248,250,252,0.96))] px-5 py-4">
                <div class="flex items-center gap-3">
                  <div class="flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-brand-500 text-sm font-bold text-white shadow-lg shadow-brand-200">
                    {{ authStore.user?.avatar }}
                  </div>
                  <div class="min-w-0">
                    <p class="truncate text-base font-bold text-slate-950">{{ authStore.user?.name }}</p>
                    <p class="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{{ accountMenuEyebrow }}</p>
                  </div>
                </div>
              </div>

              <div class="space-y-3 px-4 py-4">
                <RouterLink
                  :to="profileLink"
                  class="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-slate-950"
                  @click="closeAccountMenu"
                >
                  <span>View Profile</span>
                  <span class="text-xs uppercase tracking-[0.18em] text-slate-400">Open</span>
                </RouterLink>

                <RouterLink
                  :to="dashboardLink"
                  class="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-slate-950"
                  @click="closeAccountMenu"
                >
                  <span>{{ dashboardMenuLabel }}</span>
                  <span class="text-xs uppercase tracking-[0.18em] text-slate-400">Open</span>
                </RouterLink>

                <button
                  class="flex w-full items-center justify-between rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
                  type="button"
                  @click="handleLogout"
                >
                  <span>Logout</span>
                  <span class="text-xs uppercase tracking-[0.18em] text-white/70">Exit</span>
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { useNotificationStore } from '@/stores/notification.store';
import AppLogo from './AppLogo.vue';
import LanguageSelect from './LanguageSelect.vue';

const authStore = useAuthStore();
const cartStore = useCartStore();
const notificationStore = useNotificationStore();
const route = useRoute();
const router = useRouter();
const isAccountMenuOpen = ref(false);
const accountMenuRef = ref<HTMLElement | null>(null);

const links = [
  { label: 'Home', to: '/' },
  { label: 'Restaurants', to: '/restaurants' },
  // { label: 'Categories', to: '/categories' },
  { label: 'Track Order', to: '/track-order' },
  { label: 'About Us', to: '/about' },

];

const dashboardLink = computed(() => {
  switch (authStore.user?.role) {
    case 'admin':
      return '/admin';
    case 'owner':
      return '/restaurant';
    case 'kitchen':
      return '/kitchen';
    case 'rider':
      return '/rider';
    case 'customer':
    default:
      return '/dashboard';
  }
});

const profileLink = computed(() => {
  switch (authStore.user?.role) {
    case 'admin':
      return '/admin/profile';
    case 'rider':
      return '/rider/profile';
    case 'customer':
    default:
      return '/profile';
  }
});

const compactCount = computed(() => (notificationStore.unreadCount > 99 ? '99+' : String(notificationStore.unreadCount)));
const cartItemCount = computed(() => cartStore.items.reduce((sum, item) => sum + item.quantity, 0));
const cartBadgeCount = computed(() => (cartItemCount.value > 99 ? '99+' : String(cartItemCount.value)));
const notificationAriaLabel = computed(() => {
  const unreadCount = notificationStore.unreadCount;

  if (!unreadCount) {
    return 'Notifications';
  }

  return unreadCount === 1 ? 'Notifications, 1 unread item' : `Notifications, ${unreadCount} unread items`;
});
const cartAriaLabel = computed(() => {
  if (!cartItemCount.value) {
    return 'Cart';
  }

  return cartItemCount.value === 1 ? 'Cart, 1 item' : `Cart, ${cartItemCount.value} items`;
});
const accountMenuEyebrow = computed(() => {
  if (!authStore.user) {
    return 'Account';
  }

  return authStore.user.role === 'customer' ? 'Customer Account' : `${authStore.user.role} Workspace`;
});
const dashboardMenuLabel = computed(() => (authStore.user?.role === 'customer' ? 'Dashboard' : 'Workspace'));

function toggleAccountMenu() {
  isAccountMenuOpen.value = !isAccountMenuOpen.value;
}

function closeAccountMenu() {
  isAccountMenuOpen.value = false;
}

function handleClickOutside(event: MouseEvent) {
  if (!accountMenuRef.value) {
    return;
  }

  const target = event.target;
  if (target instanceof Node && !accountMenuRef.value.contains(target)) {
    closeAccountMenu();
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeAccountMenu();
  }
}

onMounted(() => {
  notificationStore.initialize(authStore.user);
  window.addEventListener('click', handleClickOutside);
  window.addEventListener('keydown', handleKeydown);
});

watch(
  () => authStore.user,
  (user) => {
    notificationStore.syncUser(user);
    if (!user) {
      closeAccountMenu();
    }
  },
  { immediate: true },
);

watch(
  () => route.fullPath,
  () => {
    closeAccountMenu();
  },
);

function isActiveLink(target: string) {
  if (target === '/') {
    return route.path === '/';
  }

  if (target === '/track-order') {
    return route.path === '/track-order';
  }

  return route.path === target || route.path.startsWith(`${target}/`);
}

function handleLogout() {
  closeAccountMenu();
  authStore.performLogout();
  notificationStore.syncUser(null);
  void router.push('/');
}

onBeforeUnmount(() => {
  window.removeEventListener('click', handleClickOutside);
  window.removeEventListener('keydown', handleKeydown);
});
</script>
