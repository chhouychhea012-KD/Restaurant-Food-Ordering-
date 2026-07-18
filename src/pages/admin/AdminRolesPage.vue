<template>
  <div class="space-y-8">
    <SectionCard
      eyebrow="Access Control"
      title="Roles & Permissions"
      description="Permission templates and access rules."
    >
      <template #actions>
        <button v-if="canCreateRole" class="btn-primary flex items-center gap-2" type="button" @click="openCreateModal">
          <Plus :size="18" />
          Create new role
        </button>
      </template>

      <div v-if="roles.length" class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <div
          v-for="role in roles"
          :key="role.id"
          class="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="text-2xl font-bold text-slate-900">{{ role.label }}</h3>
              <div class="mt-2 flex items-center gap-2">
                <span class="pill bg-slate-100 text-slate-700 font-medium">{{ role.name }}</span>
                <span v-if="isCoreRole(role.name)" class="pill bg-sky-100 text-sky-700 text-xs">Core</span>
              </div>
            </div>

            <div class="text-right">
              <p class="text-xs text-slate-400">Users</p>
              <p class="text-3xl font-bold text-slate-900">{{ countAssignedUsers(role.name) }}</p>
            </div>
          </div>

          <p class="mt-4 text-sm text-slate-600">{{ role.description || 'No description provided.' }}</p>

          <div class="mt-6">
            <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Permissions - {{ role.permissions.length }}</p>
            <div class="flex flex-wrap gap-2">
              <span v-for="permission in role.permissions.slice(0, 6)" :key="permission" class="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700">
                {{ formatPermission(permission) }}
              </span>
              <span v-if="role.permissions.length > 6" class="self-center text-xs text-slate-400">+{{ role.permissions.length - 6 }} more</span>
            </div>
          </div>

          <div class="mt-8 flex gap-3">
            <button
              class="btn-secondary flex-1 flex items-center justify-center gap-2"
              type="button"
              :disabled="!canUpdateRole"
              @click="openEditModal(role.id)"
            >
              <Edit3 :size="17" /> Edit
            </button>
            <button
              class="flex-1 rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
              type="button"
              :disabled="!canDeleteRole || isCoreRole(role.name)"
              @click="removeRole(role.id)"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <EmptyState
        v-else
        title="No roles available"
        message="Create a custom role to tailor operational access beyond the default system roles."
      />

      <p v-if="message" class="mt-6 rounded-xl bg-emerald-50 px-5 py-4 text-sm text-emerald-700">{{ message }}</p>
      <p v-if="error" class="mt-6 rounded-xl bg-rose-50 px-5 py-4 text-sm text-rose-600">{{ error }}</p>
    </SectionCard>

    <AppModal
      :open="isModalOpen"
      eyebrow="Role Management"
      :title="editingRoleId ? 'Edit role' : 'Create new role'"
      description="Labels, keys, and permissions."
      size="xl"
      @close="closeModal"
    >
      <form class="space-y-6" @submit.prevent="submitRole">
        <div class="grid gap-5 md:grid-cols-2">
          <div>
            <label class="field-label" for="role-label">Role label</label>
            <input id="role-label" v-model="form.label" class="field-input" type="text" placeholder="Operations Supervisor" required />
          </div>
          <div>
            <label class="field-label" for="role-name">Role key</label>
            <input id="role-name" v-model="form.name" class="field-input" type="text" :disabled="editingCoreRole" placeholder="operations_supervisor" required />
            <p class="mt-2 text-xs text-slate-500">{{ editingCoreRole ? 'Core role keys cannot be changed.' : 'Use lowercase with underscores.' }}</p>
          </div>
        </div>

        <div>
          <label class="field-label" for="role-description">Description</label>
          <textarea id="role-description" v-model="form.description" class="field-input min-h-24" placeholder="Describe the responsibilities and access scope of this role..." />
        </div>

        <div class="rounded-xl border border-slate-200 bg-slate-50 p-6">
          <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="font-semibold text-slate-900">Permissions</p>
              <p class="text-sm text-slate-500">{{ form.permissions.length }} selected</p>
            </div>
            <div class="flex gap-3">
              <button type="button" class="btn-secondary text-sm" :disabled="!canAssignPermissions" @click="selectAllPermissions">Select all</button>
              <button type="button" class="btn-secondary text-sm" :disabled="!canAssignPermissions" @click="clearPermissions">Clear all</button>
            </div>
          </div>

          <p v-if="!canAssignPermissions" class="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Your current role can review permissions but cannot assign or revoke them.
          </p>

          <div class="max-h-[420px] space-y-5 overflow-auto pr-2">
            <section v-for="group in permissionGroups" :key="group.name" class="space-y-3">
              <div>
                <h4 class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">{{ group.label }}</h4>
              </div>
              <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <label
                  v-for="permission in group.items"
                  :key="permission"
                  class="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition"
                  :class="canAssignPermissions ? 'cursor-pointer hover:border-brand-300' : 'opacity-70'"
                >
                  <input v-model="form.permissions" :value="permission" type="checkbox" class="mt-1 accent-brand-600" :disabled="!canAssignPermissions" />
                  <div>
                    <p class="font-medium text-slate-900">{{ formatPermission(permission) }}</p>
                    <p class="mt-0.5 text-xs text-slate-500">{{ permission }}</p>
                  </div>
                </label>
              </div>
            </section>
          </div>
        </div>

        <div class="flex gap-4 pt-4">
          <button class="btn-primary flex-1" :disabled="saving || !canSaveRole">{{ saving ? 'Saving...' : editingRoleId ? 'Update role' : 'Create role' }}</button>
          <button type="button" class="btn-secondary flex-1" @click="closeModal">Cancel</button>
        </div>
      </form>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { Plus, Edit3 } from 'lucide-vue-next';
import type { PermissionKey, RoleDefinition, RoleInput, User } from '@/types';
import AppModal from '@/components/common/AppModal.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import SectionCard from '@/components/common/SectionCard.vue';
import { createRole, deleteRole, listRolePermissions, listRoles, updateRole } from '@/services/role.service';
import { listUsers } from '@/services/user.service';
import { useAuthStore } from '@/stores/auth.store';
import { isCoreRole } from '@/utils/permissions';

const authStore = useAuthStore();
const roles = ref<RoleDefinition[]>([]);
const users = ref<User[]>([]);
const permissions = ref<PermissionKey[]>([]);
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
const canCreateRole = computed(() => authStore.hasPermission('roles.create'));
const canUpdateRole = computed(() => authStore.hasPermission('roles.update'));
const canDeleteRole = computed(() => authStore.hasPermission('roles.delete'));
const canAssignPermissions = computed(() => authStore.hasPermission('permissions.assign'));
const canSaveRole = computed(() => (editingRoleId.value ? canUpdateRole.value : canCreateRole.value) && canAssignPermissions.value);
const permissionGroups = computed(() => {
  const groups = new Map<string, PermissionKey[]>();

  permissions.value.forEach((permission) => {
    const segment = permission.split('.')[0] ?? 'general';
    const bucket = groups.get(segment) ?? [];
    bucket.push(permission);
    groups.set(segment, bucket);
  });

  return [...groups.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, items]) => ({
      name,
      label: name.replace(/_/g, ' '),
      items: [...items].sort(),
    }));
});

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
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function countAssignedUsers(roleName: string) {
  return users.value.filter((user) => user.roleAssignments.some((assignment) => assignment.roleName === roleName) || user.role === roleName).length;
}

function openCreateModal() {
  if (!canCreateRole.value) {
    error.value = 'You do not have permission to create roles.';
    return;
  }

  resetForm();
  message.value = '';
  error.value = '';
  isModalOpen.value = true;
}

function openEditModal(roleId: string) {
  if (!canUpdateRole.value) {
    error.value = 'You do not have permission to update roles.';
    return;
  }

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
    if (!canSaveRole.value) {
      throw new Error('Your current role cannot save permission changes.');
    }

    if (!form.permissions.length) {
      throw new Error('Please select at least one permission.');
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
    error.value = incoming instanceof Error ? incoming.message : 'Failed to save role.';
  } finally {
    saving.value = false;
  }
}

async function removeRole(roleId: string) {
  if (!canDeleteRole.value) {
    error.value = 'You do not have permission to delete roles.';
    return;
  }

  if (!window.confirm('Delete this role?')) {
    return;
  }

  try {
    deleteRole(roleId);
    authStore.refreshRolePermissions();
    message.value = 'Role deleted successfully.';
    await load();
  } catch (incoming) {
    error.value = incoming instanceof Error ? incoming.message : 'Failed to delete role.';
  }
}
</script>
