<template>
  <div class="grid min-h-screen gap-4 bg-slate-50/80 p-3 sm:p-4 lg:h-screen lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start lg:gap-5 lg:overflow-hidden lg:p-6 xl:grid-cols-[260px_minmax(0,1fr)]">
    <SidebarNav :items="navItems" />

    <div class="relative flex min-h-0 flex-col gap-4 overflow-visible lg:h-[calc(100vh-3rem)]">
      <div class="surface-card relative z-20 shrink-0 overflow-visible px-5 py-4 sm:px-6 lg:px-7">
        <div class="flex min-h-[4.5rem] flex-wrap items-center justify-between gap-4">
          <div class="min-w-0">
            <p class="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{{ workspaceLabel }}</p>
            <h1 class="mt-1 truncate text-2xl font-bold text-slate-950">{{ authStore.user?.name }}</h1>
          </div>

          <div ref="menuRef" class="relative flex shrink-0 items-center gap-3 lg:ml-auto">
            <LanguageSelect />
            <RouterLink
              v-if="showWorkspaceNotifications"
              :to="notificationsLink"
              class="group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border bg-white text-slate-600 shadow-sm transition hover:text-slate-950"
              :class="route.path === notificationsLink
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

            <button
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white p-1 shadow-sm ring-offset-2 transition hover:border-brand-200 hover:bg-brand-50"
              :class="isMenuOpen ? 'ring-2 ring-brand-300' : ''"
              type="button"
              :aria-label="accountButtonLabel"
              title="Profile"
              @click="toggleMenu"
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
                v-if="isMenuOpen"
                class="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[300px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.18)]"
              >
                <div class="bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.14),transparent_30%),linear-gradient(180deg,#ffffff,rgba(248,250,252,0.96))] px-5 py-4">
                  <div class="flex items-center gap-3">
                    <UserAvatar :user="authStore.user" size="md" />
                    <div class="min-w-0">
                      <p class="truncate text-base font-bold text-slate-950">{{ authStore.user?.name }}</p>
                      <p class="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{{ roleCaption }}</p>
                    </div>
                  </div>
                </div>

                <div class="space-y-3 px-4 py-4">
                  <RouterLink
                    :to="profileLink"
                    class="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-slate-950"
                    @click="closeMenu"
                  >
                    <span>Profile</span>
                    <span class="text-xs uppercase tracking-[0.18em] text-slate-400">Open</span>
                  </RouterLink>

                  <RouterLink
                    v-if="showWorkspaceNotifications"
              :to="notificationsLink"
                    class="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-slate-950"
                    @click="closeMenu"
                  >
                    <span>Notifications</span>
                    <span class="text-xs uppercase tracking-[0.18em] text-slate-400">{{ compactCount }}</span>
                  </RouterLink>

                  <RouterLink
                    to="/"
                    class="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-slate-950"
                    @click="closeMenu"
                  >
                    <span>Customer View</span>
                    <span class="text-xs uppercase tracking-[0.18em] text-slate-400">Home</span>
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

      <div class="thin-scrollbar relative z-0 min-h-0 flex-1 overflow-visible lg:overflow-y-auto lg:pr-1 lg:[scrollbar-gutter:stable]">
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
import LanguageSelect from '@/components/common/LanguageSelect.vue';
import UserAvatar from '@/components/common/UserAvatar.vue';
import { useAuthStore } from '@/stores/auth.store';
import { useNotificationStore } from '@/stores/notification.store';
import { titleCase } from '@/utils/format';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const route = useRoute();
const router = useRouter();
const isMenuOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null);

const accountButtonLabel = computed(() => (authStore.user ? `Profile menu for ${authStore.user.name}` : 'Profile menu'));
const compactCount = computed(() => (notificationStore.unreadCount > 99 ? '99+' : String(notificationStore.unreadCount || 0)));
const showWorkspaceNotifications = computed(() => ['admin', 'partner'].includes(authStore.workspaceArea));
const notificationsLink = computed(() => (authStore.workspaceArea === 'partner' ? '/partner/notifications' : '/admin/notifications'));

const notificationAriaLabel = computed(() => {
  const unreadCount = notificationStore.unreadCount;

  if (!unreadCount) {
    return 'Notifications';
  }

  return unreadCount === 1 ? 'Notifications, 1 unread item' : `Notifications, ${unreadCount} unread items`;
});

const workspaceLabel = computed(() => {
  switch (authStore.workspaceArea) {
    case 'admin':
      return 'Admin control center';
    case 'partner':
      return 'Restaurant workspace';
    case 'kitchen':
      return 'Kitchen operations';
    case 'rider':
      return 'Rider workspace';
    default:
      return 'Customer account';
  }
});

const roleCaption = computed(() => {
  const role = authStore.primaryRole;
  if (!role) {
    return workspaceLabel.value;
  }

  return `${titleCase(role)} in ${workspaceLabel.value.toLowerCase()}`;
});

const navItems = computed(() => {
  const itemsByWorkspace = {
    admin: [
      { label: 'Overview', to: '/admin', permissions: ['analytics.read'] },
      { label: 'Notifications', to: '/admin/notifications', permissions: ['analytics.read'], badge: notificationStore.unreadCount ? compactCount.value : undefined },
      { label: 'Roles & Permissions', to: '/admin/roles', permissions: ['roles.read'] },
      { label: 'Users', to: '/admin/users', permissions: ['users.manage'] },
      { label: 'Restaurants', to: '/admin/restaurants', permissions: ['restaurants.read'] },
      { label: 'Products', to: '/admin/products', permissions: ['menus.read'] },
      { label: 'Categories', to: '/admin/categories', permissions: ['menus.read'] },
      { label: 'Orders', to: '/admin/orders', permissions: ['orders.read'] },
      { label: 'Activity Log', to: '/admin/activity-log', permissions: ['activity_logs.read'] },
      { label: 'Analytics', to: '/admin/analytics', permissions: ['analytics.read'] },
    ],
    partner: [
      { label: 'Restaurant', to: '/partner', permissions: ['restaurants.read'] },
      { label: 'Products', to: '/partner/products', permissions: ['menus.read'] },
      { label: 'Orders', to: '/partner/orders', permissions: ['orders.read'] },
      { label: 'Staff Users', to: '/partner/users', permissions: ['users.manage'] },
    ],
    kitchen: [
      { label: 'Kitchen Queue', to: '/kitchen', permissions: ['orders.read'] },
    ],
    rider: [
      { label: 'Overview', to: '/rider', permissions: ['dispatch.read'] },
      { label: 'Deliveries', to: '/rider/deliveries', permissions: ['dispatch.read'] },
    ],
    customer: [],
  } as const;

  return itemsByWorkspace[authStore.workspaceArea].filter((item) => authStore.hasAllPermissions(item.permissions));
});

const profileLink = computed(() => {
  switch (authStore.workspaceArea) {
    case 'admin':
      return '/admin/profile';
    case 'partner':
      return '/partner';
    case 'kitchen':
      return '/kitchen';
    case 'rider':
      return '/rider/profile';
    default:
      return '/customer/profile';
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
