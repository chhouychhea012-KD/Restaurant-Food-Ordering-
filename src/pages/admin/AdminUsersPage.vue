<template>
  <SectionCard eyebrow="Users, Roles and Permissions" title="Admin user CRUD" description="Create, edit, and delete platform users while keeping role assignments and restaurant ownership associations on the frontend data layer.">
    <template #actions>
      <button class="btn-primary" type="button" @click="openCreateModal">Create user</button>
    </template>

    <div class="space-y-4">
      <div v-for="user in users" :key="user.id" class="surface-muted p-5">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-lg font-semibold text-slate-950">{{ user.name }}</p>
            <p class="mt-1 text-sm text-slate-500">{{ user.email }}</p>
            <p class="mt-1 text-sm text-slate-500">{{ user.phone }}</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <span class="pill bg-slate-100 text-slate-700">{{ roleLabel(user.role) }}</span>
            <span class="pill" :class="user.shiftActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'">
              {{ user.shiftActive ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </div>
        <p v-if="user.restaurantId" class="mt-3 text-sm text-slate-500">Restaurant link: {{ restaurantName(user.restaurantId) }}</p>
        <div class="mt-4 flex flex-wrap gap-3">
          <button class="btn-secondary px-3 py-2" type="button" @click="startEdit(user.id)">Edit</button>
          <button class="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100" type="button" :disabled="user.id === authStore.user?.id" @click="remove(user.id)">
            Delete
          </button>
        </div>
      </div>
    </div>

    <p v-if="message" class="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ message }}</p>
    <p v-if="error" class="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{{ error }}</p>
  </SectionCard>

  <AppModal
    :open="isModalOpen"
    eyebrow="Admin User Management"
    :title="editingId ? 'Edit platform user' : 'Create platform user'"
    description="Use the popup form to manage roles, operational access, and restaurant links."
    size="md"
    @close="closeModal"
  >
    <form class="space-y-4" @submit.prevent="submitUser">
      <div>
        <label class="field-label" for="user-name">Full name</label>
        <input id="user-name" v-model="form.name" class="field-input" type="text" minlength="3" required />
      </div>
      <div>
        <label class="field-label" for="user-email">Email</label>
        <input id="user-email" v-model="form.email" class="field-input" type="email" required />
      </div>
      <div>
        <label class="field-label" for="user-phone">Phone</label>
        <input id="user-phone" v-model="form.phone" class="field-input" type="tel" required />
      </div>
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label class="field-label" for="user-role">Role</label>
          <select id="user-role" v-model="form.role" class="field-input">
            <option v-for="role in roles" :key="role.id" :value="role.name">{{ role.label }}</option>
          </select>
        </div>
        <div v-if="form.role === 'owner' || form.role === 'kitchen'">
          <label class="field-label" for="restaurant-id">Restaurant</label>
          <select id="restaurant-id" v-model="form.restaurantId" class="field-input">
            <option value="">No restaurant linked</option>
            <option v-for="restaurant in restaurants" :key="restaurant.id" :value="restaurant.id">{{ restaurant.name }}</option>
          </select>
        </div>
      </div>
      <label class="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <input v-model="form.shiftActive" type="checkbox" />
        Operational access active
      </label>
      <p class="text-xs text-slate-500">New users receive the seeded password for their system role, or `Welcome@123` for custom roles.</p>
      <div class="flex flex-wrap gap-3 pt-2">
        <button class="btn-primary" :disabled="saving">{{ saving ? 'Saving...' : editingId ? 'Update user' : 'Create user' }}</button>
        <button class="btn-secondary" type="button" @click="closeModal">Cancel</button>
      </div>
    </form>
  </AppModal>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import type { RoleDefinition, User, UserRole } from '@/types';
import AppModal from '@/components/common/AppModal.vue';
import SectionCard from '@/components/common/SectionCard.vue';
import { listRestaurants } from '@/services/restaurant.service';
import { listRoles } from '@/services/role.service';
import { createUser, deleteUser, listUsers, updateUser } from '@/services/user.service';
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
const users = ref<User[]>([]);
const roles = ref<RoleDefinition[]>([]);
const restaurants = ref<Array<{ id: string; name: string }>>([]);
const editingId = ref<string | null>(null);
const saving = ref(false);
const message = ref('');
const error = ref('');
const isModalOpen = ref(false);

const blankForm = () => ({
  name: '',
  email: '',
  phone: '',
  role: 'customer' as UserRole,
  shiftActive: true,
  restaurantId: '',
});

const form = reactive(blankForm());

async function load() {
  users.value = await listUsers();
  roles.value = listRoles();
  restaurants.value = (await listRestaurants()).map((restaurant) => ({ id: restaurant.id, name: restaurant.name }));
}

onMounted(load);

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

  editingId.value = userId;
  Object.assign(form, {
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    shiftActive: user.shiftActive,
    restaurantId: user.restaurantId ?? '',
  });
  message.value = '';
  error.value = '';
  isModalOpen.value = true;
}

function restaurantName(restaurantId: string) {
  return restaurants.value.find((restaurant) => restaurant.id === restaurantId)?.name ?? 'Unknown restaurant';
}

function roleLabel(roleName: string) {
  return roles.value.find((role) => role.name === roleName)?.label ?? roleName;
}

async function submitUser() {
  saving.value = true;
  message.value = '';
  error.value = '';
  try {
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      role: form.role,
      shiftActive: form.shiftActive,
      restaurantId: form.role === 'owner' || form.role === 'kitchen' ? form.restaurantId || null : null,
    };

    if (editingId.value) {
      await updateUser(editingId.value, payload);
      message.value = 'User updated.';
    } else {
      await createUser(payload);
      message.value = 'User created.';
    }

    await load();
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

  const confirmed = window.confirm('Delete this user from the frontend dataset?');
  if (!confirmed) {
    return;
  }

  await deleteUser(userId);
  message.value = 'User deleted.';
  await load();
  if (editingId.value === userId) {
    closeModal();
  }
}
</script>
