<template>
  <SectionCard eyebrow="Access Control" title="Roles and role permissions" description="Create role templates, update permission sets, and manage access control rules from the admin dashboard.">
    <template #actions>
      <button class="btn-primary" type="button" @click="openCreateModal">Create role</button>
    </template>

    <div class="grid gap-4 xl:grid-cols-2">
      <div v-for="role in roles" :key="role.id" class="surface-muted p-5">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="text-xl font-bold text-slate-950">{{ role.label }}</h3>
              <span class="pill bg-slate-100 text-slate-700">{{ role.name }}</span>
              <span v-if="isCoreRole(role.name)" class="pill bg-sky-100 text-sky-700">Core role</span>
            </div>
            <p class="mt-2 text-sm text-slate-500">{{ role.description || 'No description added yet.' }}</p>
          </div>
          <div class="rounded-2xl bg-white px-4 py-3 text-right">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Assigned users</p>
            <p class="mt-1 text-2xl font-bold text-slate-950">{{ countAssignedUsers(role.name) }}</p>
          </div>
        </div>

        <div class="mt-5">
          <p class="text-sm font-semibold text-slate-900">Permissions</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <span v-for="permission in role.permissions" :key="permission" class="pill bg-brand-50 text-brand-700">
              {{ formatPermission(permission) }}
            </span>
          </div>
        </div>

        <div class="mt-5 flex flex-wrap gap-3">
          <button class="btn-secondary px-3 py-2" type="button" @click="openEditModal(role.id)">Edit</button>
          <button class="rounded-2xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100" type="button" :disabled="isCoreRole(role.name)" @click="removeRole(role.id)">
            Delete
          </button>
        </div>
      </div>
    </div>

    <p v-if="message" class="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ message }}</p>
    <p v-if="error" class="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{{ error }}</p>
  </SectionCard>

  <AppModal
    :open="isModalOpen"
    eyebrow="Roles and Permissions"
    :title="editingRoleId ? 'Edit role definition' : 'Create role definition'"
    description="Use this modal to manage labels, role keys, and the permission set used by the admin access model."
    size="xl"
    @close="closeModal"
  >
    <form class="space-y-5" @submit.prevent="submitRole">
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label class="field-label" for="role-label">Role label</label>
          <input id="role-label" v-model="form.label" class="field-input" type="text" placeholder="Operations Supervisor" required />
        </div>
        <div>
          <label class="field-label" for="role-name">Role key</label>
          <input id="role-name" v-model="form.name" class="field-input" type="text" :disabled="editingCoreRole" placeholder="operations_supervisor" required />
          <p class="mt-2 text-xs text-slate-500">{{ editingCoreRole ? 'Core role keys stay locked so the existing auth flow remains stable.' : 'Use a unique key. Spaces will be normalized automatically.' }}</p>
        </div>
      </div>

      <div>
        <label class="field-label" for="role-description">Description</label>
        <textarea id="role-description" v-model="form.description" class="field-input min-h-28" placeholder="Describe what this role can do across the admin workflow." />
      </div>

      <div class="rounded-3xl border border-slate-200 p-5">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-sm font-semibold text-slate-900">Permission assignment</p>
            <p class="text-xs text-slate-500">Select which actions this role can access in the frontend admin experience.</p>
          </div>
          <div class="flex gap-2">
            <button class="btn-secondary px-3 py-2" type="button" @click="selectAllPermissions">Select all</button>
            <button class="btn-secondary px-3 py-2" type="button" @click="clearPermissions">Clear</button>
          </div>
        </div>
        <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <label v-for="permission in permissions" :key="permission" class="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:border-brand-300 hover:bg-brand-50/40">
            <input v-model="form.permissions" :value="permission" class="mt-1" type="checkbox" />
            <span>
              <span class="block font-semibold text-slate-900">{{ formatPermission(permission) }}</span>
              <span class="mt-1 block text-xs text-slate-500">{{ permission }}</span>
            </span>
          </label>
        </div>
      </div>

      <div class="flex flex-wrap gap-3 pt-2">
        <button class="btn-primary" :disabled="saving">{{ saving ? 'Saving...' : editingRoleId ? 'Update role' : 'Create role' }}</button>
        <button class="btn-secondary" type="button" @click="closeModal">Cancel</button>
      </div>
    </form>
  </AppModal>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import type { RoleDefinition, RoleInput, User } from '@/types';
import AppModal from '@/components/common/AppModal.vue';
import SectionCard from '@/components/common/SectionCard.vue';
import { createRole, deleteRole, listRolePermissions, listRoles, updateRole } from '@/services/role.service';
import { listUsers } from '@/services/user.service';
import { useAuthStore } from '@/stores/auth.store';
import { isCoreRole } from '@/utils/permissions';

const authStore = useAuthStore();
const roles = ref<RoleDefinition[]>([]);
const users = ref<User[]>([]);
const permissions = ref<string[]>([]);
const editingRoleId = ref<string | null>(null);
const saving = ref(false);
const message = ref('');
const error = ref('');
const isModalOpen = ref(false);

const blankForm = (): RoleInput => ({
  name: '',
  label: '',
  description: '',
  permissions: [],
});

const form = reactive<RoleInput>(blankForm());
const editingRole = computed(() => roles.value.find((role) => role.id === editingRoleId.value) ?? null);
const editingCoreRole = computed(() => Boolean(editingRole.value && isCoreRole(editingRole.value.name)));

async function load() {
  roles.value = listRoles();
  permissions.value = listRolePermissions();
  users.value = await listUsers();
}

onMounted(load);

function resetForm() {
  editingRoleId.value = null;
  Object.assign(form, blankForm());
}

function formatPermission(permission: string) {
  return permission
    .replace(/\./g, ' ')
    .replace(/_/g, ' ')
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function countAssignedUsers(roleName: string) {
  return users.value.filter((user) => user.role === roleName).length;
}

function openCreateModal() {
  resetForm();
  message.value = '';
  error.value = '';
  isModalOpen.value = true;
}

function openEditModal(roleId: string) {
  const role = roles.value.find((entry) => entry.id === roleId);
  if (!role) {
    return;
  }

  editingRoleId.value = roleId;
  form.name = role.name;
  form.label = role.label;
  form.description = role.description ?? '';
  form.permissions = [...role.permissions];
  message.value = '';
  error.value = '';
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
  resetForm();
}

function selectAllPermissions() {
  form.permissions = [...permissions.value];
}

function clearPermissions() {
  form.permissions = [];
}

async function submitRole() {
  saving.value = true;
  message.value = '';
  error.value = '';

  try {
    if (!form.permissions.length) {
      throw new Error('Select at least one permission for this role.');
    }

    const payload: RoleInput = {
      name: form.name.trim(),
      label: form.label.trim(),
      description: form.description.trim(),
      permissions: [...form.permissions],
    };

    if (editingRoleId.value) {
      updateRole(editingRoleId.value, payload);
      message.value = 'Role updated successfully.';
    } else {
      createRole(payload);
      message.value = 'Role created successfully.';
    }

    authStore.refreshRolePermissions();
    await load();
    closeModal();
  } catch (incoming) {
    error.value = incoming instanceof Error ? incoming.message : 'Unable to save role.';
  } finally {
    saving.value = false;
  }
}

async function removeRole(roleId: string) {
  const confirmed = window.confirm('Delete this role from the local access control dataset?');
  if (!confirmed) {
    return;
  }

  try {
    deleteRole(roleId);
    authStore.refreshRolePermissions();
    message.value = 'Role deleted successfully.';
    await load();
    if (editingRoleId.value === roleId) {
      closeModal();
    }
  } catch (incoming) {
    error.value = incoming instanceof Error ? incoming.message : 'Unable to delete role.';
  }
}
</script>
