<template>
  <div class="grid min-h-screen gap-6 p-4 lg:h-screen lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:overflow-hidden lg:p-6">
    <SidebarNav :items="navItems" />

    <div class="relative flex min-h-0 flex-col gap-6 overflow-visible lg:h-[calc(100vh-3rem)]">
      <div class="surface-card relative z-20 shrink-0 overflow-visible px-5 py-5 sm:px-6 lg:px-7">
        <div class="flex min-h-[5.75rem] flex-wrap items-center justify-between gap-5">
          <div class="min-w-0">
            <p class="text-sm font-medium text-slate-500">Signed in as</p>
            <h1 class="truncate text-2xl font-bold text-slate-950">{{ authStore.user?.name }}</h1>
            <p class="text-sm capitalize text-slate-500">{{ authStore.user?.role }} workspace</p>
          </div>

          <div ref="menuRef" class="relative flex items-center gap-3 lg:ml-auto">
            <RouterLink
              v-if="authStore.user?.role === 'admin'"
              to="/admin/notifications"
              class="group relative flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.5rem] border bg-white text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:text-slate-950"
              :class="route.path === '/admin/notifications'
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
              <span v-if="notificationStore.unreadCount" class="absolute -right-2 -top-2 flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-brand-500 px-2 text-xs font-bold text-white shadow-lg shadow-brand-200">
                {{ compactCount }}
              </span>
            </RouterLink>

            <div class="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-4 py-3 text-right">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
              <p class="mt-1 text-sm font-semibold text-slate-900">Admin control center</p>
            </div>

            <button
              class="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.5rem] bg-brand-500 text-lg font-bold text-white shadow-lg shadow-brand-200 ring-offset-2 transition hover:scale-[1.02] hover:bg-brand-600"
              :class="isMenuOpen ? 'ring-2 ring-brand-300' : ''"
              type="button"
              @click="toggleMenu"
            >
              {{ authStore.user?.avatar }}
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
                v-if="isMenuOpen"
                class="absolute right-0 top-[calc(100%+1rem)] z-50 w-[320px] overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.18)]"
              >
                <div class="bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.14),transparent_30%),linear-gradient(180deg,#ffffff,rgba(248,250,252,0.96))] px-5 py-4">
                  <div class="flex items-center gap-3">
                    <div class="flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-brand-500 text-sm font-bold text-white shadow-lg shadow-brand-200">
                      {{ authStore.user?.avatar }}
                    </div>
                    <div class="min-w-0">
                      <p class="truncate text-base font-bold text-slate-950">{{ authStore.user?.name }}</p>
                      <p class="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{{ authStore.user?.role }} workspace</p>
                    </div>
                  </div>
                </div>

                <div class="space-y-3 px-4 py-4">
                  <RouterLink
                    :to="profileLink"
                    class="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-slate-950"
                    @click="closeMenu"
                  >
                    <span>Profile</span>
                    <span class="text-xs uppercase tracking-[0.18em] text-slate-400">Open</span>
                  </RouterLink>

                  <RouterLink
                    v-if="authStore.user?.role === 'admin'"
                    to="/admin/notifications"
                    class="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-slate-950"
                    @click="closeMenu"
                  >
                    <span>Notifications</span>
                    <span class="text-xs uppercase tracking-[0.18em] text-slate-400">{{ compactCount }}</span>
                  </RouterLink>

                  <RouterLink
                    to="/"
                    class="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-slate-950"
                    @click="closeMenu"
                  >
                    <span>Customer View</span>
                    <span class="text-xs uppercase tracking-[0.18em] text-slate-400">Home</span>
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

      <div class="relative z-0 min-h-0 flex-1 lg:overflow-y-auto lg:pr-2">
        <div class="pb-6 pt-1">
          <RouterView />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';
import SidebarNav from '@/components/common/SidebarNav.vue';
import { useAuthStore } from '@/stores/auth.store';
import { useNotificationStore } from '@/stores/notification.store';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const route = useRoute();
const router = useRouter();
const isMenuOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null);

const compactCount = computed(() => (notificationStore.unreadCount > 99 ? '99+' : String(notificationStore.unreadCount || 0)));
const notificationAriaLabel = computed(() => {
  const unreadCount = notificationStore.unreadCount;

  if (!unreadCount) {
    return 'Notifications';
  }

  return unreadCount === 1 ? 'Notifications, 1 unread item' : ('Notifications, ' + unreadCount + ' unread items');
});

const navItems = computed(() => {
  if (authStore.user?.role === 'admin') {
    return [
      { label: 'Overview', to: '/admin' },
      { label: 'Profile', to: '/admin/profile' },
      { label: 'Notifications', to: '/admin/notifications', badge: notificationStore.unreadCount ? compactCount.value : undefined },
      { label: 'Roles & Permissions', to: '/admin/roles' },
      { label: 'Users', to: '/admin/users' },
      { label: 'Restaurants', to: '/admin/restaurants' },
      { label: 'Products', to: '/admin/products' },
      { label: 'Categories', to: '/admin/categories' },
      { label: 'Orders', to: '/admin/orders' },
      { label: 'Analytics', to: '/admin/analytics' },
    ];
  }

  return [
    { label: 'Overview', to: '/restaurant' },
    { label: 'Menu', to: '/restaurant/menu' },
    { label: 'Orders', to: '/restaurant/orders' },
  ];
});

const profileLink = computed(() => {
  switch (authStore.user?.role) {
    case 'admin':
      return '/admin/profile';
    case 'rider':
      return '/rider/profile';
    default:
      return '/';
  }
});

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

function closeMenu() {
  isMenuOpen.value = false;
}

function handleClickOutside(event: MouseEvent) {
  if (!menuRef.value) {
    return;
  }

  const target = event.target;
  if (target instanceof Node && !menuRef.value.contains(target)) {
    closeMenu();
  }
}

function handleLogout() {
  closeMenu();
  authStore.performLogout();
  notificationStore.syncUser(null);
  void router.push('/');
}

onMounted(() => {
  notificationStore.initialize(authStore.user);
  window.addEventListener('click', handleClickOutside);
});

watch(
  () => authStore.user,
  (user) => {
    notificationStore.syncUser(user);
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  window.removeEventListener('click', handleClickOutside);
});
</script>




