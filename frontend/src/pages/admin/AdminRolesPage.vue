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

      <div v-if="roles.length" class="space-y-5">
        <div class="grid gap-3 md:grid-cols-4">
          <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Total roles</p>
            <p class="mt-2 text-2xl font-bold text-slate-950">{{ roles.length }}</p>
          </div>
          <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">System roles</p>
            <p class="mt-2 text-2xl font-bold text-slate-950">{{ systemRoleCount }}</p>
          </div>
          <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Custom roles</p>
            <p class="mt-2 text-2xl font-bold text-slate-950">{{ customRoleCount }}</p>
          </div>
          <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Assigned users</p>
            <p class="mt-2 text-2xl font-bold text-slate-950">{{ totalAssignedUsers }}</p>
          </div>
        </div>

        <div class="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div class="min-w-0 flex-1">
            <label class="sr-only" for="role-search">Search roles</label>
            <input id="role-search" v-model="roleSearch" class="field-input bg-white" type="search" placeholder="Search role name, key, permission, or description" />
          </div>
          <select v-model="roleTypeFilter" class="field-input min-w-44 bg-white lg:w-auto">
            <option value="all">All roles</option>
            <option value="system">System only</option>
            <option value="custom">Custom only</option>
          </select>
        </div>

        <div class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div class="thin-scrollbar overflow-x-auto">
            <table class="w-full min-w-[760px] text-left text-sm">
              <thead class="bg-slate-50 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                <tr>
                  <th class="px-5 py-4">Role</th>
                  <th class="px-5 py-4">Type</th>
                  <th class="px-5 py-4">Users</th>
                  <th class="px-5 py-4">Permissions</th>
                  <th class="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="role in filteredRoleRows" :key="role.id" class="align-top transition hover:bg-orange-50/40">
                  <td class="px-5 py-5">
                    <div class="max-w-md">
                      <p class="text-base font-bold text-slate-950">{{ role.label }}</p>
                      <p class="mt-1 font-mono text-xs text-slate-500">{{ role.name }}</p>
                    </div>
                  </td>
                  <td class="px-5 py-5">
                    <span class="pill" :class="role.system ? 'bg-sky-100 text-sky-700' : 'bg-emerald-100 text-emerald-700'">
                      {{ role.system ? 'System' : 'Custom' }}
                    </span>
                  </td>
                  <td class="px-5 py-5">
                    <p class="text-lg font-bold text-slate-950">{{ role.assignedUsers }}</p>
                  </td>
                  <td class="px-5 py-5">
                    <p class="font-bold text-slate-950">{{ role.permissions.length }}</p>
                    <p class="mt-1 text-xs text-slate-500">permissions</p>
                  </td>
                  <td class="px-5 py-5">
                    <div class="relative flex justify-end">
                      <button
                        class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                        type="button"
                        :aria-label="`Actions for ${role.label}`"
                        :aria-expanded="openActionMenuRoleId === role.id ? 'true' : 'false'"
                        aria-haspopup="menu"
                        @click.stop="toggleActionMenu(role.id)"
                      >
                        <MoreVertical :size="18" />
                      </button>

                      <div
                        v-if="openActionMenuRoleId === role.id"
                        class="absolute right-0 top-11 z-30 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-[0_18px_50px_rgba(15,23,42,0.16)]"
                        role="menu"
                      >
                        <button
                          class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          type="button"
                          role="menuitem"
                          :disabled="!canUpdateRole"
                          @click="openEditFromMenu(role.id)"
                        >
                          <Pencil :size="15" />
                          Edit
                        </button>
                        <button
                          class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                          type="button"
                          role="menuitem"
                          :disabled="!canDeleteRole || role.system"
                          @click="deleteFromMenu(role.id)"
                        >
                          <Trash2 :size="15" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <EmptyState
          v-if="!filteredRoleRows.length"
          title="No matching roles"
          message="Adjust the search or role type filter to view more access templates."
        />
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

        <div class="flex flex-wrap gap-3 pt-2">
          <button class="btn-primary" :disabled="saving || !canSaveRole">{{ saving ? 'Saving...' : editingRoleId ? 'Update role' : 'Create role' }}</button>
          <button type="button" class="btn-secondary" @click="closeModal">Cancel</button>
        </div>
      </form>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { MoreVertical, Pencil, Plus, Trash2 } from 'lucide-vue-next';
import type { PermissionKey, RoleDefinition, RoleInput, User } from '@/types';
import AppModal from '@/components/common/AppModal.vue';
import { useAppDialog } from '@/composables/useAppDialog';
import EmptyState from '@/components/common/EmptyState.vue';
import SectionCard from '@/components/common/SectionCard.vue';
import { createRole, deleteRole, listRolePermissions, listRoles, updateRole } from '@/services/role.service';
import { listUsers } from '@/services/user.service';
import { useAuthStore } from '@/stores/auth.store';
import { isCoreRole } from '@/utils/permissions';

const { confirmDialog } = useAppDialog();
const authStore = useAuthStore();
const roles = ref<RoleDefinition[]>([]);
const users = ref<User[]>([]);
const permissions = ref<PermissionKey[]>([]);
const editingRoleId = ref<string | null>(null);
const saving = ref(false);
const message = ref('');
const error = ref('');
const isModalOpen = ref(false);
const roleSearch = ref('');
const roleTypeFilter = ref<'all' | 'system' | 'custom'>('all');
const openActionMenuRoleId = ref<string | null>(null);

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
const systemRoleCount = computed(() => roles.value.filter((role) => isCoreRole(role.name)).length);
const customRoleCount = computed(() => roles.value.length - systemRoleCount.value);
const totalAssignedUsers = computed(() => roleRows.value.reduce((sum, role) => sum + role.assignedUsers, 0));
const roleRows = computed(() =>
  roles.value.map((role) => {
    const permissionGroups = [...new Set(role.permissions.map((permission) => permission.split('.')[0] ?? 'general'))]
      .map((group) => formatPermission(group))
      .sort();

    return {
      ...role,
      system: isCoreRole(role.name),
      assignedUsers: countAssignedUsers(role.name),
      permissionGroups,
    };
  }),
);
const filteredRoleRows = computed(() => {
  const query = roleSearch.value.trim().toLowerCase();

  return roleRows.value.filter((role) => {
    if (roleTypeFilter.value === 'system' && !role.system) {
      return false;
    }
    if (roleTypeFilter.value === 'custom' && role.system) {
      return false;
    }
    if (!query) {
      return true;
    }

    return [role.label, role.name, role.description ?? '', ...role.permissions, ...role.permissionGroups]
      .join(' ')
      .toLowerCase()
      .includes(query);
  });
});
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
  roles.value = await listRoles();
  permissions.value = await listRolePermissions();
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
function toggleActionMenu(roleId: string) {
  openActionMenuRoleId.value = openActionMenuRoleId.value === roleId ? null : roleId;
}

function closeActionMenu() {
  openActionMenuRoleId.value = null;
}

function openEditFromMenu(roleId: string) {
  closeActionMenu();
  openEditModal(roleId);
}

function deleteFromMenu(roleId: string) {
  closeActionMenu();
  void removeRole(roleId);
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
      await updateRole(editingRoleId.value, payload);
      message.value = 'Role updated successfully.';
    } else {
      await createRole(payload);
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

  const confirmed = await confirmDialog({
    title: 'Delete role',
    message: 'Delete this role?',
    confirmLabel: 'Delete role',
    tone: 'danger',
  });
  if (!confirmed) {
    return;
  }

  try {
    await deleteRole(roleId);
    authStore.refreshRolePermissions();
    message.value = 'Role deleted successfully.';
    await load();
  } catch (incoming) {
    error.value = incoming instanceof Error ? incoming.message : 'Failed to delete role.';
  }
}
</script>