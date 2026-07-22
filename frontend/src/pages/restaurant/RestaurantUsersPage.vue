<template>
  <SectionCard eyebrow="Restaurant Staff" title="Team access" description="Kitchen and branch users assigned to your restaurant only.">
    <template #actions>
      <button class="btn-primary" type="button" @click="openCreateModal">Create staff user</button>
    </template>

    <div v-if="restaurant" class="space-y-4">
      <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <label class="sr-only" for="staff-search">Search staff</label>
        <input id="staff-search" v-model="query" class="field-input bg-white" type="search" placeholder="Search name, email, phone, or role" />
      </div>

      <div v-if="filteredUsers.length" class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="thin-scrollbar overflow-x-auto">
          <table class="w-full min-w-[760px] text-left text-sm">
            <thead class="bg-slate-50 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              <tr>
                <th class="px-5 py-4">User</th>
                <th class="px-5 py-4">Role</th>
                <th class="px-5 py-4">Status</th>
                <th class="px-5 py-4">Access</th>
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
                <td class="px-5 py-4"><span class="pill" :class="user.shiftActive ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'">{{ user.shiftActive ? 'Active' : 'Paused' }}</span></td>
                <td class="px-5 py-4">
                  <div class="relative flex justify-end">
                    <button class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-900" type="button" @click.stop="toggleActionMenu(user.id)">
                      <MoreVertical :size="18" />
                    </button>
                    <div v-if="openActionMenuUserId === user.id" class="absolute right-0 top-11 z-30 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
                      <button class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50" type="button" @click="editFromMenu(user.id)"><Pencil :size="15" /> Edit</button>
                      <button class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50" type="button" @click="deleteFromMenu(user.id)"><Trash2 :size="15" /> Delete</button>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <EmptyState v-else title="No staff users" message="Create a kitchen or branch user for this restaurant." />
    </div>

    <EmptyState v-else title="No assigned restaurant" message="This owner account does not currently have a restaurant assignment." />

    <p v-if="message" class="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ message }}</p>
    <p v-if="error" class="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{{ error }}</p>
  </SectionCard>

  <AppModal
    :open="isModalOpen"
    eyebrow="Restaurant Staff"
    :title="editingId ? 'Edit staff user' : 'Create staff user'"
    :description="restaurant ? `Access is scoped to ${restaurant.name}.` : 'Access is scoped to your restaurant.'"
    size="lg"
    @close="closeModal"
  >
    <form class="space-y-5" @submit.prevent="submitUser">
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-orange-400 text-2xl font-bold text-white shadow-sm ring-4 ring-white">
            <img v-if="form.avatarUrl" :src="form.avatarUrl" alt="Staff profile preview" class="h-full w-full object-cover" />
            <span v-else>{{ previewInitials }}</span>
          </div>
          <div class="min-w-0 flex-1">
            <label class="btn-secondary cursor-pointer" for="staff-profile-photo">Upload photo</label>
            <input id="staff-profile-photo" class="sr-only" type="file" accept="image/*" @change="onAvatarFileChange" />
            <button v-if="form.avatarUrl" class="btn-secondary ml-2" type="button" @click="removeAvatar">Remove</button>
            <p class="mt-2 text-xs text-slate-500">JPG, PNG, or WebP. Max 1.5 MB.</p>
          </div>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label class="field-label" for="staff-name">Full name</label>
          <input id="staff-name" v-model="form.name" class="field-input" type="text" minlength="3" required />
        </div>
        <div>
          <label class="field-label" for="staff-email">Email</label>
          <input id="staff-email" v-model="form.email" class="field-input" type="email" required />
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <div>
          <label class="field-label" for="staff-phone">Phone</label>
          <input id="staff-phone" v-model="form.phone" class="field-input" type="tel" required />
        </div>
        <div>
          <label class="field-label" for="staff-role">Role</label>
          <select id="staff-role" v-model="form.role" class="field-input">
            <option value="kitchen">Kitchen Staff</option>
            <option value="branch_manager">Branch Manager</option>
          </select>
        </div>
        <div>
          <label class="field-label" for="staff-status">Account status</label>
          <select id="staff-status" v-model="form.status" class="field-input">
            <option value="active">Active</option>
            <option value="invited">Invited</option>
            <option value="suspended">Suspended</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      </div>

      <label class="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <input v-model="form.shiftActive" type="checkbox" />
        Operational access active
      </label>

      <div class="flex flex-wrap gap-3 pt-2">
        <button class="btn-primary" :disabled="saving || !restaurant">{{ saving ? 'Saving...' : editingId ? 'Update user' : 'Create user' }}</button>
        <button class="btn-secondary" type="button" @click="closeModal">Cancel</button>
      </div>
    </form>
  </AppModal>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { MoreVertical, Pencil, Trash2 } from 'lucide-vue-next';
import type { Restaurant, User, UserRole, UserStatus } from '@/types';
import AppModal from '@/components/common/AppModal.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import SectionCard from '@/components/common/SectionCard.vue';
import UserAvatar from '@/components/common/UserAvatar.vue';
import { useAppDialog } from '@/composables/useAppDialog';
import { getRestaurantById } from '@/services/restaurant.service';
import { createUser, deleteUser, listUsers, updateUser } from '@/services/user.service';
import { useAuthStore } from '@/stores/auth.store';
import { getPrimaryRestaurantId } from '@/utils/access';
import { readProfileImageFile } from '@/utils/avatar';

const { confirmDialog } = useAppDialog();
const authStore = useAuthStore();
const restaurant = ref<Restaurant | null>(null);
const users = ref<User[]>([]);
const query = ref('');
const editingId = ref<string | null>(null);
const saving = ref(false);
const message = ref('');
const error = ref('');
const isModalOpen = ref(false);
const openActionMenuUserId = ref<string | null>(null);

const editableRoles: UserRole[] = ['kitchen', 'branch_manager'];
const blankForm = () => ({
  name: '',
  email: '',
  phone: '',
  role: 'kitchen' as UserRole,
  status: 'active' as UserStatus,
  shiftActive: true,
  avatarUrl: null as string | null,
});
const form = reactive(blankForm());

const restaurantId = computed(() => getPrimaryRestaurantId(authStore.user));
const restaurantUsers = computed(() => users.value.filter((user) => user.restaurantId === restaurantId.value && editableRoles.includes(user.role)));
const filteredUsers = computed(() => {
  const term = query.value.trim().toLowerCase();
  if (!term) {
    return restaurantUsers.value;
  }
  return restaurantUsers.value.filter((user) => [user.name, user.email, user.phone, roleLabel(user.role), statusLabel(user.status)].join(' ').toLowerCase().includes(term));
});
const previewInitials = computed(() => form.name.split(' ').filter(Boolean).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('') || 'U');

async function load() {
  restaurant.value = restaurantId.value ? await getRestaurantById(restaurantId.value) : null;
  users.value = await listUsers();
}

onMounted(() => {
  void load();
  window.addEventListener('click', closeActionMenu);
});

onBeforeUnmount(() => {
  window.removeEventListener('click', closeActionMenu);
});

function resetForm() {
  editingId.value = null;
  Object.assign(form, blankForm());
}

function openCreateModal() {
  resetForm();
  message.value = '';
  error.value = '';
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
  resetForm();
}

function toggleActionMenu(userId: string) {
  openActionMenuUserId.value = openActionMenuUserId.value === userId ? null : userId;
}

function closeActionMenu() {
  openActionMenuUserId.value = null;
}

function editFromMenu(userId: string) {
  closeActionMenu();
  const user = restaurantUsers.value.find((entry) => entry.id === userId);
  if (!user) {
    return;
  }
  editingId.value = userId;
  Object.assign(form, {
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: editableRoles.includes(user.role) ? user.role : 'kitchen',
    status: user.status,
    shiftActive: user.shiftActive,
    avatarUrl: user.avatarUrl ?? null,
  });
  message.value = '';
  error.value = '';
  isModalOpen.value = true;
}

function deleteFromMenu(userId: string) {
  closeActionMenu();
  void removeUser(userId);
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

function roleLabel(role: string) {
  return role === 'branch_manager' ? 'Branch Manager' : role === 'kitchen' ? 'Kitchen Staff' : role;
}

function statusLabel(status: UserStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function statusPillClass(status: UserStatus) {
  if (status === 'active') return 'bg-emerald-100 text-emerald-700';
  if (status === 'invited') return 'bg-amber-100 text-amber-700';
  if (status === 'suspended') return 'bg-rose-100 text-rose-700';
  return 'bg-slate-200 text-slate-700';
}

async function submitUser() {
  if (!restaurantId.value) {
    error.value = 'No assigned restaurant found.';
    return;
  }

  saving.value = true;
  message.value = '';
  error.value = '';
  try {
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      role: form.role,
      status: form.status,
      shiftActive: form.shiftActive,
      restaurantId: restaurantId.value,
      accessWindow: null,
      avatarUrl: form.avatarUrl,
    };

    if (!editableRoles.includes(payload.role)) {
      throw new Error('Restaurant owners can only manage kitchen and branch staff users.');
    }

    if (editingId.value) {
      await updateUser(editingId.value, payload);
      message.value = 'Staff user updated.';
    } else {
      await createUser(payload);
      message.value = 'Staff user created.';
    }

    await load();
    closeModal();
  } catch (incoming) {
    error.value = incoming instanceof Error ? incoming.message : 'Unable to save staff user.';
  } finally {
    saving.value = false;
  }
}

async function removeUser(userId: string) {
  const user = restaurantUsers.value.find((entry) => entry.id === userId);
  if (!user) {
    return;
  }

  const confirmed = await confirmDialog({
    title: 'Delete staff user',
    message: `Delete ${user.name} from this restaurant workspace?`,
    confirmLabel: 'Delete user',
    tone: 'danger',
  });
  if (!confirmed) {
    return;
  }

  try {
    await deleteUser(userId);
    message.value = 'Staff user deleted.';
    await load();
  } catch (incoming) {
    error.value = incoming instanceof Error ? incoming.message : 'Unable to delete staff user.';
  }
}
</script>