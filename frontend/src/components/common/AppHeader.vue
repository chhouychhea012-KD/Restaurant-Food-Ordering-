<template>
  <header class="fixed inset-x-0 top-0 z-50 border-b border-slate-200/70 bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/82">
    <div class="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:h-24 sm:gap-4 sm:px-6 lg:px-8">
      <AppLogo />
      <button
        class="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 lg:hidden"
        type="button"
        :aria-expanded="isMobileMenuOpen ? 'true' : 'false'"
        aria-controls="mobile-customer-navigation"
        aria-label="Toggle navigation"
        @click="toggleMobileMenu"
      >
        <svg v-if="!isMobileMenuOpen" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
        <svg v-else class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
      <nav class="hidden items-center gap-1 text-sm font-medium lg:flex">
        <RouterLink
          v-for="item in navLinks"
          :key="item.to"
          :to="item.to"
          class="group relative rounded-xl px-4 py-2 transition"
          :class="isActiveLink(item.to) ? 'text-slate-950' : 'text-slate-600 hover:text-slate-950'"
        >
          <span>{{ item.label }}</span>
          <span
            class="absolute inset-x-4 -bottom-1 h-[3px] rounded-full transition-all duration-300"
            :class="isActiveLink(item.to) ? 'bg-gradient-to-r from-brand-500 via-orange-400 to-amber-300 opacity-100' : 'bg-slate-300 opacity-0 group-hover:opacity-100'"
          />
        </RouterLink>
      </nav>
      <div class="flex min-w-0 items-center gap-2 sm:gap-3">
        <LanguageSelect class="hidden sm:inline-flex" />
        <RouterLink
          v-if="authStore.isAuthenticated"
          to="/notifications"
          class="group relative flex h-12 w-12 items-center justify-center rounded-xl border bg-white text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:text-slate-950"
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
          v-if="canUseCustomerOrdering"
          to="/cart"
          class="btn-secondary group relative inline-flex items-center gap-2 px-3 sm:px-4"
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
          <span class="hidden sm:inline">Cart</span>
          <span v-if="cartItemCount" class="absolute -right-2 -top-2 flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-brand-500 px-2 text-xs font-bold text-white shadow-lg shadow-brand-200">
            {{ cartBadgeCount }}
          </span>
        </RouterLink>
        <RouterLink v-if="!authStore.isAuthenticated" to="/auth/login" class="btn-primary px-3 sm:px-4">
          Login
        </RouterLink>
        <div v-else ref="accountMenuRef" class="relative">
          <button
            class="flex h-12 w-12 items-center justify-center rounded-xl border bg-white p-1 shadow-sm ring-offset-2 transition hover:-translate-y-0.5"
            :class="isAccountMenuOpen
              ? 'border-brand-200 bg-brand-50 shadow-brand-100/70 ring-2 ring-brand-200'
              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'"
            type="button"
            aria-haspopup="menu"
            :aria-expanded="isAccountMenuOpen ? 'true' : 'false'"
            :aria-label="accountButtonLabel"
            title="Profile"
            @click="toggleAccountMenu"
          >
            <UserAvatar :user="authStore.user" size="sm" />
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
              class="absolute right-0 top-[calc(100%+0.85rem)] z-50 w-[290px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.18)]"
            >
              <div class="bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.14),transparent_32%),linear-gradient(180deg,#ffffff,rgba(248,250,252,0.96))] px-5 py-4">
                <div class="flex min-w-0 items-center gap-2 sm:gap-3">
                  <UserAvatar :user="authStore.user" size="md" />
                  <div class="min-w-0">
                    <p class="truncate text-base font-bold text-slate-950">{{ authStore.user?.name }}</p>
                    <p class="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{{ accountMenuEyebrow }}</p>
                  </div>
                </div>
              </div>

              <div class="space-y-3 px-4 py-4">
                <RouterLink
                  :to="profileLink"
                  class="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-slate-950"
                  @click="closeAccountMenu"
                >
                  <span>View Profile</span>
                  <span class="text-xs uppercase tracking-[0.18em] text-slate-400">Open</span>
                </RouterLink>

                <RouterLink
                  :to="dashboardLink"
                  class="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-slate-950"
                  @click="closeAccountMenu"
                >
                  <span>{{ dashboardMenuLabel }}</span>
                  <span class="text-xs uppercase tracking-[0.18em] text-slate-400">Open</span>
                </RouterLink>

                <button
                  class="flex w-full items-center justify-between rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
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
    <transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="-translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="-translate-y-2 opacity-0"
    >
      <nav
        v-if="isMobileMenuOpen"
        id="mobile-customer-navigation"
        class="border-t border-slate-100 bg-white/95 px-4 py-3 shadow-sm backdrop-blur lg:hidden"
      >
        <div class="mx-auto grid max-w-7xl gap-2 sm:grid-cols-2">
          <RouterLink
            v-for="item in navLinks"
            :key="`mobile-${item.to}`"
            :to="item.to"
            class="rounded-lg px-4 py-3 text-sm font-semibold transition"
            :class="isActiveLink(item.to) ? 'bg-brand-500 text-white shadow-sm' : 'bg-slate-50 text-slate-700 hover:bg-orange-50 hover:text-brand-700'"
            @click="closeMobileMenu"
          >
            {{ item.label }}
          </RouterLink>
        </div>
      </nav>
    </transition>
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
import UserAvatar from './UserAvatar.vue';

const authStore = useAuthStore();
const cartStore = useCartStore();
const notificationStore = useNotificationStore();
const route = useRoute();
const router = useRouter();
const isAccountMenuOpen = ref(false);
const isMobileMenuOpen = ref(false);
const accountMenuRef = ref<HTMLElement | null>(null);

const customerLinks = [
  { label: 'Home', to: '/' },
  { label: 'Restaurants', to: '/restaurants' },
  { label: 'Track Order', to: '/track-order' },
  { label: 'About Us', to: '/about' },
];

const navLinks = computed(() => {
  if (authStore.user?.role === 'kitchen') {
    return [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Kitchen Queue', to: '/kitchen' },
      { label: 'Restaurants', to: '/restaurants' },
      { label: 'Notifications', to: '/notifications' },
    ];
  }

  if (authStore.user?.role === 'rider') {
    return [
      { label: 'Rider Home', to: '/rider' },
      { label: 'Deliveries', to: '/rider/deliveries' },
      { label: 'Notifications', to: '/notifications' },
    ];
  }

  return customerLinks;
});

const dashboardLink = computed(() => {
  switch (authStore.user?.role) {
    case 'admin':
      return '/admin';
    case 'owner':
      return '/restaurant';
    case 'kitchen':
      return '/dashboard';
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
    case 'kitchen':
      return '/profile';
    case 'customer':
    default:
      return '/profile';
  }
});

const compactCount = computed(() => (notificationStore.unreadCount > 99 ? '99+' : String(notificationStore.unreadCount)));
const canUseCustomerOrdering = computed(() => !authStore.isAuthenticated || authStore.hasPermission('orders.create'));
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
const accountButtonLabel = computed(() => (authStore.user ? `Profile menu for ${authStore.user.name}` : 'Profile menu'));
const accountMenuEyebrow = computed(() => {
  if (!authStore.user) {
    return 'Account';
  }

  return authStore.user.role === 'customer' ? 'Customer Account' : `${authStore.user.role} Workspace`;
});
const dashboardMenuLabel = computed(() => {
  if (authStore.user?.role === 'kitchen') {
    return 'Kitchen dashboard';
  }
  if (authStore.user?.role === 'rider') {
    return 'Rider dashboard';
  }
  return authStore.user?.role === 'customer' ? 'Dashboard' : 'Workspace';
});

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false;
}

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

  if (route.path === target) {
    return true;
  }

  if (!route.path.startsWith(`${target}/`)) {
    return false;
  }

  return !navLinks.value.some((item) => {
    if (item.to === target || !item.to.startsWith(`${target}/`)) {
      return false;
    }

    return route.path === item.to || route.path.startsWith(`${item.to}/`);
  });
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
