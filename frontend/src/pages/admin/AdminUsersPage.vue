<template>
  <SectionCard eyebrow="Users" title="Team access">
    <template #actions>
      <button v-if="canManageUsers" class="btn-primary" type="button" @click="openCreateModal">Create user</button>
    </template>

    <div v-if="loading" class="space-y-4">
      <div v-for="index in 3" :key="index" class="surface-muted animate-pulse p-5">
        <div class="h-5 w-48 rounded bg-slate-200"></div>
        <div class="mt-3 h-4 w-64 rounded bg-slate-200"></div>
        <div class="mt-5 h-20 rounded bg-slate-200"></div>
      </div>
    </div>

    <div v-else-if="users.length" class="space-y-4">
      <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <label class="sr-only" for="user-search">Search users</label>
        <input id="user-search" v-model="query" class="field-input bg-white" type="search" placeholder="Search name, email, phone, or role" />
      </div>

      <div class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="thin-scrollbar overflow-x-auto">
          <table class="w-full min-w-[860px] text-left text-sm">
            <thead class="bg-slate-50 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              <tr>
                <th class="px-5 py-4">User</th>
                <th class="px-5 py-4">Role</th>
                <th class="px-5 py-4">Status</th>
                <th class="px-5 py-4">Access</th>
                <th class="px-5 py-4">Scope</th>
                <th class="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="user in filteredUsers" :key="user.id" class="transition hover:bg-orange-50/40">
                <td class="px-5 py-4">
                  <div class="flex min-w-0 items-center gap-3">
                    <UserAvatar :user="user" size="sm" />
                    <div class="min-w-0">
                      <p class="truncate font-bold text-slate-950">{{ user.name }}</p>
                      <p class="mt-1 truncate text-xs text-slate-500">{{ user.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-4"><span class="pill bg-slate-100 text-slate-700">{{ roleLabel(user.role) }}</span></td>
                <td class="px-5 py-4"><span class="pill" :class="statusPillClass(user.status)">{{ statusLabel(user.status) }}</span></td>
                <td class="px-5 py-4"><span class="pill" :class="accessPillClass(user)">{{ accessStateLabel(user) }}</span></td>
                <td class="px-5 py-4 text-sm font-semibold text-slate-700">{{ restaurantName(primaryRestaurantId(user)) }}</td>
                <td class="px-5 py-4">
                  <div v-if="canManageUsers" class="relative flex justify-end">
                    <button class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-900" type="button" @click.stop="toggleActionMenu(user.id)">
                      <MoreVertical :size="18" />
                    </button>
                    <div v-if="openActionMenuUserId === user.id" class="absolute right-0 top-11 z-30 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
                      <button class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50" type="button" @click="editFromMenu(user.id)"><Pencil :size="15" /> Edit</button>
                      <button class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50" type="button" :disabled="user.id === authStore.user?.id" @click="deleteFromMenu(user.id)"><Trash2 :size="15" /> Delete</button>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <EmptyState
      v-else
      title="No platform users yet"
      message="Create your first operational or storefront user to seed access for the next workflow."
    />

    <p v-if="message" class="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ message }}</p>
    <p v-if="error" class="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{{ error }}</p>
  </SectionCard>

  <AppModal
    :open="isModalOpen"
    eyebrow="Admin User Management"
    :title="editingId ? 'Edit platform user' : 'Create platform user'"
    description="Roles, scope, and access windows."
    size="xl"
    @close="closeModal"
  >
    <form class="space-y-5" @submit.prevent="submitUser">
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-orange-400 text-2xl font-bold text-white shadow-sm ring-4 ring-white">
            <img v-if="form.avatarUrl" :src="form.avatarUrl" alt="User profile preview" class="h-full w-full object-cover" />
            <span v-else>{{ previewInitials }}</span>
          </div>
          <div class="min-w-0 flex-1">
            <label class="btn-secondary cursor-pointer" for="user-profile-photo">Upload photo</label>
            <input id="user-profile-photo" class="sr-only" type="file" accept="image/*" @change="onAvatarFileChange" />
            <button v-if="form.avatarUrl" class="btn-secondary ml-2" type="button" @click="removeAvatar">Remove</button>
            <p class="mt-2 text-xs text-slate-500">JPG, PNG, or WebP. Max 1.5 MB.</p>
          </div>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label class="field-label" for="user-name">Full name</label>
          <input id="user-name" v-model="form.name" class="field-input" type="text" minlength="3" required />
        </div>
        <div>
          <label class="field-label" for="user-email">Email</label>
          <input id="user-email" v-model="form.email" class="field-input" type="email" required />
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <div>
          <label class="field-label" for="user-phone">Phone</label>
          <input id="user-phone" v-model="form.phone" class="field-input" type="tel" required />
        </div>
        <div>
          <label class="field-label" for="user-role">Role</label>
          <select id="user-role" v-model="form.role" class="field-input">
            <option v-for="role in roles" :key="role.id" :value="role.name">{{ role.label }}</option>
          </select>
        </div>
        <div>
          <label class="field-label" for="user-status">Account status</label>
          <select id="user-status" v-model="form.status" class="field-input">
            <option v-for="status in userStatuses" :key="status" :value="status">{{ statusLabel(status) }}</option>
          </select>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div v-if="roleNeedsRestaurantScope">
          <label class="field-label" for="restaurant-id">Restaurant</label>
          <select id="restaurant-id" v-model="form.restaurantId" class="field-input">
            <option value="">Select a restaurant</option>
            <option v-for="restaurant in restaurants" :key="restaurant.id" :value="restaurant.id">{{ restaurant.name }}</option>
          </select>
        </div>
        <label class="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700 md:self-end">
          <input v-model="form.shiftActive" type="checkbox" />
          Operational shift active
        </label>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-base font-semibold text-slate-950">Time-sensitive access</p>
            <p class="text-sm text-slate-500">Optional scheduling window for operational workspaces.</p>
          </div>
          <label class="flex items-center gap-3 text-sm font-medium text-slate-700">
            <input v-model="form.accessWindowEnabled" type="checkbox" />
            Enable access window
          </label>
        </div>

        <div v-if="form.accessWindowEnabled" class="mt-5 space-y-4">
          <div class="grid gap-4 md:grid-cols-3">
            <div>
              <label class="field-label" for="window-timezone">Timezone</label>
              <input id="window-timezone" v-model="form.timezone" class="field-input" type="text" placeholder="Asia/Phnom_Penh" />
            </div>
            <div>
              <label class="field-label" for="window-valid-from">Valid from</label>
              <input id="window-valid-from" v-model="form.validFrom" class="field-input" type="datetime-local" />
            </div>
            <div>
              <label class="field-label" for="window-valid-until">Valid until</label>
              <input id="window-valid-until" v-model="form.validUntil" class="field-input" type="datetime-local" />
            </div>
          </div>

          <div>
            <p class="field-label">Allowed days</p>
            <div class="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <label
                v-for="day in weekdayOptions"
                :key="day.value"
                class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
              >
                <input v-model="form.allowedDays" :value="day.value" type="checkbox" />
                {{ day.label }}
              </label>
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="field-label" for="window-start-time">Start time</label>
              <input id="window-start-time" v-model="form.startTime" class="field-input" type="time" />
            </div>
            <div>
              <label class="field-label" for="window-end-time">End time</label>
              <input id="window-end-time" v-model="form.endTime" class="field-input" type="time" />
            </div>
          </div>
        </div>
      </div>

      <p class="text-xs text-slate-500">New users receive the seeded password for their system role, or `Welcome@123` for custom roles.</p>
      <div class="flex flex-wrap gap-3 pt-2">
        <button class="btn-primary" :disabled="saving">{{ saving ? 'Saving...' : editingId ? 'Update user' : 'Create user' }}</button>
        <button class="btn-secondary" type="button" @click="closeModal">Cancel</button>
      </div>
    </form>
  </AppModal>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { MoreVertical, Pencil, Trash2 } from 'lucide-vue-next';
import type { AccessWindow, RoleDefinition, User, UserRole, UserStatus } from '@/types';
import AppModal from '@/components/common/AppModal.vue';
import { useAppDialog } from '@/composables/useAppDialog';
import EmptyState from '@/components/common/EmptyState.vue';
import SectionCard from '@/components/common/SectionCard.vue';
import UserAvatar from '@/components/common/UserAvatar.vue';
import { appEnv } from '@/config/env';
import { listRestaurants } from '@/services/restaurant.service';
import { listRoles } from '@/services/role.service';
import { createUser, deleteUser, listUsers, updateUser } from '@/services/user.service';
import { useAuthStore } from '@/stores/auth.store';
import { evaluateUserOperationalAccess, getPrimaryAccessWindow, getPrimaryRestaurantId, getUserStatusLabel } from '@/utils/access';
import { formatPreciseDateTime } from '@/utils/format';
import { readProfileImageFile } from '@/utils/avatar';

const { confirmDialog } = useAppDialog();
const authStore = useAuthStore();
const users = ref<User[]>([]);
const roles = ref<RoleDefinition[]>([]);
const restaurants = ref<Array<{ id: string; name: string }>>([]);
const editingId = ref<string | null>(null);
const saving = ref(false);
const loading = ref(false);
const message = ref('');
const error = ref('');
const isModalOpen = ref(false);
const openActionMenuUserId = ref<string | null>(null);
const query = ref('');
const userStatuses: UserStatus[] = ['active', 'invited', 'suspended', 'disabled'];
const weekdayOptions = [
  { label: 'Sunday', value: 0 },
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
];

const blankForm = () => ({
  name: '',
  email: '',
  phone: '',
  role: 'customer' as UserRole,
  status: 'active' as UserStatus,
  shiftActive: true,
  restaurantId: '',
  accessWindowEnabled: false,
  avatarUrl: null as string | null,
  timezone: appEnv.defaultTimezone,
  validFrom: '',
  validUntil: '',
  allowedDays: [] as number[],
  startTime: '',
  endTime: '',
});

const form = reactive(blankForm());

const canManageUsers = computed(() => authStore.hasPermission('users.manage'));
const roleNeedsRestaurantScope = computed(() => ['owner', 'kitchen', 'branch_manager'].includes(form.role));
const filteredUsers = computed(() => {
  const term = query.value.trim().toLowerCase();
  if (!term) {
    return users.value;
  }
  return users.value.filter((user) =>
    [user.name, user.email, user.phone, roleLabel(user.role), statusLabel(user.status)]
      .join(' ')
      .toLowerCase()
      .includes(term),
  );
});
const previewInitials = computed(() =>
  form.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'U',
);

async function load() {
  loading.value = true;
  try {
    users.value = await listUsers();
    roles.value = await listRoles();
    restaurants.value = (await listRestaurants()).map((restaurant) => ({ id: restaurant.id, name: restaurant.name }));
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void load();
  window.addEventListener('click', closeActionMenu);
});

onBeforeUnmount(() => {
  window.removeEventListener('click', closeActionMenu);
});

function toggleActionMenu(userId: string) {
  openActionMenuUserId.value = openActionMenuUserId.value === userId ? null : userId;
}

function closeActionMenu() {
  openActionMenuUserId.value = null;
}

function editFromMenu(userId: string) {
  closeActionMenu();
  startEdit(userId);
}

function deleteFromMenu(userId: string) {
  closeActionMenu();
  void remove(userId);
}
function resetForm() {
  editingId.value = null;
  Object.assign(form, blankForm());
}

function openCreateModal() {
  resetForm();
  if (roles.value.length) {
    form.role = roles.value[0].name;
  }
  message.value = '';
  error.value = '';
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
  resetForm();
}

function startEdit(userId: string) {
  const user = users.value.find((entry) => entry.id === userId);
  if (!user) {
    return;
  }

  const accessWindow = getPrimaryAccessWindow(user);
  editingId.value = userId;
  Object.assign(form, {
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    shiftActive: user.shiftActive,
    avatarUrl: user.avatarUrl ?? null,
    restaurantId: primaryRestaurantId(user) ?? '',
    accessWindowEnabled: Boolean(accessWindow),
    timezone: accessWindow?.timezone ?? appEnv.defaultTimezone,
    validFrom: toDateTimeLocal(accessWindow?.validFrom),
    validUntil: toDateTimeLocal(accessWindow?.validUntil),
    allowedDays: accessWindow?.allowedDays ? [...accessWindow.allowedDays] : [],
    startTime: accessWindow?.startTime ?? '',
    endTime: accessWindow?.endTime ?? '',
  });
  message.value = '';
  error.value = '';
  isModalOpen.value = true;
}

async function onAvatarFileChange(event: Event) {
  const input = event.target instanceof HTMLInputElement ? event.target : null;
  const file = input?.files?.[0];
  if (!file) {
    return;
  }

  error.value = '';
  try {
    form.avatarUrl = await readProfileImageFile(file);
  } catch (incoming) {
    error.value = incoming instanceof Error ? incoming.message : 'Unable to upload this image.';
  } finally {
    if (input) {
      input.value = '';
    }
  }
}

function removeAvatar() {
  form.avatarUrl = null;
}

function primaryRestaurantId(user: User) {
  return getPrimaryRestaurantId(user);
}

function restaurantName(restaurantId: string | null) {
  if (!restaurantId) {
    return 'Platform-wide';
  }

  return restaurants.value.find((restaurant) => restaurant.id === restaurantId)?.name ?? 'Unknown restaurant';
}

function roleLabel(roleName: string) {
  return roles.value.find((role) => role.name === roleName)?.label ?? roleName;
}

function statusLabel(status: UserStatus) {
  return getUserStatusLabel(status);
}

function statusPillClass(status: UserStatus) {
  switch (status) {
    case 'active':
      return 'bg-emerald-100 text-emerald-700';
    case 'invited':
      return 'bg-amber-100 text-amber-700';
    case 'suspended':
      return 'bg-rose-100 text-rose-700';
    case 'disabled':
    default:
      return 'bg-slate-200 text-slate-700';
  }
}

function accessStateLabel(user: User) {
  return evaluateUserOperationalAccess(user).state.replace(/_/g, ' ');
}

function accessPillClass(user: User) {
  const state = evaluateUserOperationalAccess(user).state;
  if (state === 'active') {
    return 'bg-emerald-100 text-emerald-700';
  }
  if (state === 'scheduled') {
    return 'bg-sky-100 text-sky-700';
  }
  if (state === 'expired') {
    return 'bg-rose-100 text-rose-700';
  }
  return 'bg-amber-100 text-amber-700';
}

function accessMessage(user: User) {
  return evaluateUserOperationalAccess(user).message;
}

function scheduleSummary(user: User) {
  const accessWindow = getPrimaryAccessWindow(user);
  if (!accessWindow) {
    return user.shiftActive ? 'No schedule restriction' : 'Shift disabled';
  }

  const pieces = [accessWindow.timezone];
  if (accessWindow.startTime && accessWindow.endTime) {
    pieces.push(`${accessWindow.startTime}-${accessWindow.endTime}`);
  }
  if (accessWindow.validUntil) {
    pieces.push(`until ${formatPreciseDateTime(accessWindow.validUntil)}`);
  }
  return pieces.join(' | ');
}

function toDateTimeLocal(value?: string | null) {
  if (!value) {
    return '';
  }

  return value.slice(0, 16);
}

function buildAccessWindow() {
  if (!form.accessWindowEnabled) {
    return null;
  }

  const window: AccessWindow = {
    timezone: form.timezone.trim() || appEnv.defaultTimezone,
    validFrom: form.validFrom ? new Date(form.validFrom).toISOString() : null,
    validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : null,
    allowedDays: form.allowedDays.length ? [...form.allowedDays].sort((left, right) => left - right) : undefined,
    startTime: form.startTime || null,
    endTime: form.endTime || null,
  };

  if (window.validFrom && window.validUntil && new Date(window.validFrom) > new Date(window.validUntil)) {
    throw new Error('The access window end must be after the start.');
  }

  return window;
}

async function submitUser() {
  saving.value = true;
  message.value = '';
  error.value = '';
  try {
    if (roleNeedsRestaurantScope.value && !form.restaurantId) {
      throw new Error('Please select a restaurant for this role.');
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      role: form.role,
      status: form.status,
      shiftActive: form.shiftActive,
      restaurantId: roleNeedsRestaurantScope.value ? form.restaurantId || null : null,
      accessWindow: buildAccessWindow(),
      avatarUrl: form.avatarUrl,
    };

    if (editingId.value) {
      await updateUser(editingId.value, payload);
      message.value = 'User updated.';
    } else {
      await createUser(payload);
      message.value = 'User created.';
    }

    await load();
    authStore.refreshCurrentUser();
    closeModal();
  } catch (incoming) {
    error.value = incoming instanceof Error ? incoming.message : 'Unable to save user.';
  } finally {
    saving.value = false;
  }
}

async function remove(userId: string) {
  if (userId === authStore.user?.id) {
    error.value = 'You cannot delete the currently signed-in admin.';
    return;
  }

  const confirmed = await confirmDialog({
    title: 'Delete user',
    message: 'Delete this user from the frontend dataset?',
    confirmLabel: 'Delete user',
    tone: 'danger',
  });
  if (!confirmed) {
    return;
  }

  try {
    await deleteUser(userId);
    message.value = 'User deleted.';
    await load();
    if (editingId.value === userId) {
      closeModal();
    }
  } catch (incoming) {
    error.value = incoming instanceof Error ? incoming.message : 'Unable to delete user.';
  }
}
</script>