<template>
  <div class="space-y-8">
    <SectionCard 
      eyebrow="Access Control" 
      title="Roles & Permissions" 
      description="Manage role templates and define what each role can access in the admin dashboard."
    >
      <template #actions>
        <button class="btn-primary flex items-center gap-2" @click="openCreateModal">
          <Plus :size="18" />
          Create New Role
        </button>
      </template>

      <!-- Roles Grid -->
      <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <div 
          v-for="role in roles" 
          :key="role.id" 
          class="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-xl hover:-translate-y-1"
        >
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-2xl font-bold text-slate-900">{{ role.label }}</h3>
              <div class="flex items-center gap-2 mt-2">
                <span class="pill bg-slate-100 text-slate-700 font-medium">{{ role.name }}</span>
                <span v-if="isCoreRole(role.name)" class="pill bg-sky-100 text-sky-700 text-xs">Core</span>
              </div>
            </div>
            
            <div class="text-right">
              <p class="text-xs text-slate-400">Users</p>
              <p class="text-3xl font-bold text-slate-900">{{ countAssignedUsers(role.name) }}</p>
            </div>
          </div>

          <p class="mt-4 text-sm text-slate-600 line-clamp-2">{{ role.description || 'No description provided.' }}</p>

          <!-- Permissions -->
          <div class="mt-6">
            <p class="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Permissions • {{ role.permissions.length }}</p>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="(perm, i) in role.permissions.slice(0, 5)" 
                :key="perm" 
                class="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700"
              >
                {{ formatPermission(perm) }}
              </span>
              <span v-if="role.permissions.length > 5" class="text-xs text-slate-400 self-center">
                +{{ role.permissions.length - 5 }} more
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-8 flex gap-3">
            <button 
              class="btn-secondary flex-1 flex items-center justify-center gap-2" 
              @click="openEditModal(role.id)"
            >
              <Edit3 :size="17" /> Edit
            </button>
            <button 
              class="flex-1 rounded-2xl bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-100 transition disabled:opacity-50"
              :disabled="isCoreRole(role.name)"
              @click="removeRole(role.id)"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <p v-if="message" class="mt-6 rounded-2xl bg-emerald-50 px-5 py-4 text-sm text-emerald-700">{{ message }}</p>
      <p v-if="error" class="mt-6 rounded-2xl bg-rose-50 px-5 py-4 text-sm text-rose-600">{{ error }}</p>
    </SectionCard>

    <!-- Modal -->
    <AppModal
      :open="isModalOpen"
      eyebrow="Role Management"
      :title="editingRoleId ? 'Edit Role' : 'Create New Role'"
      description="Define role label, key and assign permissions."
      size="xl"
      @close="closeModal"
    >
      <form class="space-y-6" @submit.prevent="submitRole">
        <div class="grid gap-5 md:grid-cols-2">
          <div>
            <label class="field-label" for="role-label">Role Label</label>
            <input id="role-label" v-model="form.label" class="field-input" type="text" placeholder="Operations Supervisor" required />
          </div>
          <div>
            <label class="field-label" for="role-name">Role Key</label>
            <input 
              id="role-name" 
              v-model="form.name" 
              class="field-input" 
              type="text" 
              :disabled="editingCoreRole"
              placeholder="operations_supervisor" 
              required 
            />
            <p class="mt-2 text-xs text-slate-500">
              {{ editingCoreRole ? 'Core role keys cannot be changed.' : 'Use lowercase with underscores.' }}
            </p>
          </div>
        </div>

        <div>
          <label class="field-label" for="role-description">Description</label>
          <textarea 
            id="role-description" 
            v-model="form.description" 
            class="field-input min-h-24" 
            placeholder="Describe the responsibilities and access scope of this role..."
          />
        </div>

        <!-- Permissions Selector -->
        <div class="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <div class="flex items-center justify-between mb-5">
            <div>
              <p class="font-semibold text-slate-900">Permissions</p>
              <p class="text-sm text-slate-500">{{ form.permissions.length }} selected</p>
            </div>
            <div class="flex gap-3">
              <button type="button" class="btn-secondary text-sm" @click="selectAllPermissions">Select All</button>
              <button type="button" class="btn-secondary text-sm" @click="clearPermissions">Clear All</button>
            </div>
          </div>

          <div class="max-h-[420px] overflow-auto grid gap-3 md:grid-cols-2 xl:grid-cols-3 pr-2">
            <label 
              v-for="permission in permissions" 
              :key="permission" 
              class="group flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 hover:border-brand-300 transition cursor-pointer"
            >
              <input 
                v-model="form.permissions" 
                :value="permission" 
                type="checkbox" 
                class="mt-1 accent-brand-600"
              />
              <div>
                <p class="font-medium text-slate-900">{{ formatPermission(permission) }}</p>
                <p class="text-xs text-slate-500 mt-0.5">{{ permission }}</p>
              </div>
            </label>
          </div>
        </div>

        <div class="flex gap-4 pt-4">
          <button class="btn-primary flex-1" :disabled="saving">
            {{ saving ? 'Saving...' : editingRoleId ? 'Update Role' : 'Create Role' }}
          </button>
          <button type="button" class="btn-secondary flex-1" @click="closeModal">Cancel</button>
        </div>
      </form>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { Plus, Edit3 } from 'lucide-vue-next';

import type { RoleDefinition, RoleInput } from '@/types';
import AppModal from '@/components/common/AppModal.vue';
import SectionCard from '@/components/common/SectionCard.vue';
import { createRole, deleteRole, listRolePermissions, listRoles, updateRole } from '@/services/role.service';
import { listUsers } from '@/services/user.service';
import { useAuthStore } from '@/stores/auth.store';
import { isCoreRole } from '@/utils/permissions';

const authStore = useAuthStore();
const roles = ref<RoleDefinition[]>([]);
const users = ref<any[]>([]);
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
const editingRole = computed(() => roles.value.find(r => r.id === editingRoleId.value) ?? null);
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
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function countAssignedUsers(roleName: string) {
  return users.value.filter(u => u.role === roleName).length;
}

function openCreateModal() {
  resetForm();
  message.value = '';
  error.value = '';
  isModalOpen.value = true;
}

function openEditModal(roleId: string) {
  const role = roles.value.find(r => r.id === roleId);
  if (!role) return;

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
  // ... your existing logic (unchanged)
  saving.value = true;
  message.value = '';
  error.value = '';

  try {
    if (!form.permissions.length) throw new Error('Please select at least one permission.');

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
  if (!window.confirm('Delete this role?')) return;

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