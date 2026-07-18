<template>
  <div class="space-y-8">
    <!-- Hero Profile Section -->
    <div class="surface-card overflow-hidden rounded-xl">
      <div class="bg-gradient-to-br from-orange-50 via-white to-slate-50 p-8 lg:p-10">
        <div class="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex items-center gap-6">
            <!-- Avatar -->
            <UserAvatar :user="authStore.user" size="xl" />

            <div>
              <p class="text-sm font-semibold uppercase tracking-widest text-orange-600">Admin Profile</p>
              <h1 class="mt-2 text-4xl font-bold text-slate-900">{{ authStore.user?.name }}</h1>
              <p class="mt-1 text-slate-600">{{ authStore.user?.email }}</p>
            </div>
          </div>

          <button class="btn-primary flex items-center gap-2 text-base px-6 py-3" @click="openEditProfile">
            <Edit3 :size="20" />
            Edit Profile
          </button>
        </div>

        <!-- Quick Stats -->
        <div class="mt-10 grid gap-4 sm:grid-cols-3">
          <div class="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
            <p class="text-xs uppercase tracking-widest text-slate-400">Role</p>
            <p class="mt-2 text-3xl font-bold capitalize text-slate-900">{{ authStore.user?.role }}</p>
            <p class="text-sm text-slate-500 mt-1">Platform access</p>
          </div>

          <div class="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
            <p class="text-xs uppercase tracking-widest text-slate-400">Permissions</p>
            <p class="mt-2 text-3xl font-bold text-slate-900">{{ authStore.permissions.length }}</p>
            <p class="text-sm text-slate-500 mt-1">Active capabilities</p>
          </div>

          <div class="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
            <p class="text-xs uppercase tracking-widest text-slate-400">Status</p>
            <p class="mt-2 text-3xl font-bold text-emerald-600">
              {{ authStore.user?.shiftActive ? 'Active' : 'Paused' }}
            </p>
            <p class="text-sm text-slate-500 mt-1">Workspace access</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Shortcuts -->
    <SectionCard 
      eyebrow="Quick Access" 
      title="Admin Shortcuts" 
      description="Jump to key management areas"
    >
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <RouterLink 
          to="/admin/users"
          class="group rounded-xl border border-slate-200 bg-white p-6 transition hover:shadow-md hover:-translate-y-0.5"
        >
          <Users class="text-slate-400 group-hover:text-brand-500 transition" :size="28" />
          <p class="mt-4 font-semibold text-slate-900">Manage Users</p>
          <p class="text-sm text-slate-500 mt-1">Operators, customers &amp; staff</p>
        </RouterLink>

        <RouterLink 
          to="/admin/roles"
          class="group rounded-xl border border-slate-200 bg-white p-6 transition hover:shadow-md hover:-translate-y-0.5"
        >
          <Shield class="text-slate-400 group-hover:text-brand-500 transition" :size="28" />
          <p class="mt-4 font-semibold text-slate-900">Roles &amp; Permissions</p>
          <p class="text-sm text-slate-500 mt-1">Control access levels</p>
        </RouterLink>

        <RouterLink 
          to="/admin/products"
          class="group rounded-xl border border-slate-200 bg-white p-6 transition hover:shadow-md hover:-translate-y-0.5"
        >
          <Package class="text-slate-400 group-hover:text-brand-500 transition" :size="28" />
          <p class="mt-4 font-semibold text-slate-900">Products &amp; Categories</p>
          <p class="text-sm text-slate-500 mt-1">Catalog management</p>
        </RouterLink>

        <RouterLink 
          to="/admin/analytics"
          class="group rounded-xl border border-slate-200 bg-white p-6 transition hover:shadow-md hover:-translate-y-0.5"
        >
          <BarChart3 class="text-slate-400 group-hover:text-brand-500 transition" :size="28" />
          <p class="mt-4 font-semibold text-slate-900">Analytics</p>
          <p class="text-sm text-slate-500 mt-1">Platform performance</p>
        </RouterLink>
      </div>
    </SectionCard>

    <!-- Account & Security -->
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Account Details -->
      <SectionCard eyebrow="Account Details" title="Administrator Information">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="rounded-xl bg-slate-50 p-5">
            <p class="text-sm text-slate-500">Full Name</p>
            <p class="mt-1 font-medium">{{ authStore.user?.name }}</p>
          </div>
          <div class="rounded-xl bg-slate-50 p-5">
            <p class="text-sm text-slate-500">Email</p>
            <p class="mt-1 font-medium break-all">{{ authStore.user?.email }}</p>
          </div>
          <div class="rounded-xl bg-slate-50 p-5">
            <p class="text-sm text-slate-500">Phone</p>
            <p class="mt-1 font-medium">{{ authStore.user?.phone }}</p>
          </div>
          <div class="rounded-xl bg-slate-50 p-5">
            <p class="text-sm text-slate-500">Profile image</p>
            <p class="mt-1 font-medium">{{ authStore.user?.avatarUrl ? 'Uploaded' : 'Initials fallback' }}</p>
          </div>
        </div>
      </SectionCard>

      <!-- Security -->
      <SectionCard eyebrow="Security" title="Protected Access">
        <div class="space-y-5">
          <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
            <div class="flex items-center gap-3">
              <ShieldCheck class="text-emerald-600" :size="26" />
              <div>
                <p class="font-semibold text-emerald-800">Route Protection Active</p>
                <p class="text-sm text-emerald-700 mt-1">This session has full access to protected dashboard modules.</p>
              </div>
            </div>
          </div>

          <div class="rounded-xl border border-slate-200 bg-white p-6">
            <p class="font-semibold text-slate-900 mb-3">Permission Coverage</p>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="permission in authStore.permissions.slice(0, 10)" 
                :key="permission" 
                class="rounded-full bg-slate-100 px-4 py-1.5 text-xs font-medium text-slate-700"
              >
                {{ permission }}
              </span>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>

    <p v-if="message" class="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ message }}</p>
    <p v-if="error" class="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{{ error }}</p>
  </div>

  <!-- Edit Modal -->
  <AppModal
    :open="isModalOpen"
    eyebrow="Edit Profile"
    title="Update Administrator"
    description="Modify your admin identity and contact details."
    size="md"
    @close="closeModal"
  >
    <form class="space-y-5" @submit.prevent="saveProfile">
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-orange-400 text-2xl font-bold text-white shadow-sm ring-4 ring-white">
            <img v-if="form.avatarUrl" :src="form.avatarUrl" alt="Profile preview" class="h-full w-full object-cover" />
            <span v-else>{{ previewInitials }}</span>
          </div>
          <div class="min-w-0 flex-1">
            <label class="btn-secondary cursor-pointer" for="admin-profile-photo">Upload photo</label>
            <input id="admin-profile-photo" class="sr-only" type="file" accept="image/*" @change="onAvatarFileChange" />
            <button v-if="form.avatarUrl" class="btn-secondary ml-2" type="button" @click="removeAvatar">Remove</button>
            <p class="mt-2 text-xs text-slate-500">JPG, PNG, or WebP. Max 1.5 MB.</p>
          </div>
        </div>
      </div>
      <div>
        <label class="field-label" for="admin-name">Full name</label>
        <input id="admin-name" v-model="form.name" class="field-input" type="text" required />
      </div>
      <div>
        <label class="field-label" for="admin-email">Email address</label>
        <input id="admin-email" v-model="form.email" class="field-input" type="email" required />
      </div>
      <div>
        <label class="field-label" for="admin-phone">Phone number</label>
        <input id="admin-phone" v-model="form.phone" class="field-input" type="tel" required />
      </div>

      <div class="flex flex-wrap gap-3 pt-2">
        <button class="btn-primary" :disabled="saving">
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
        <button type="button" class="btn-secondary" @click="closeModal">Cancel</button>
      </div>
    </form>
  </AppModal>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { Edit3, Users, Shield, Package, BarChart3, ShieldCheck } from 'lucide-vue-next';

import AppModal from '@/components/common/AppModal.vue';
import SectionCard from '@/components/common/SectionCard.vue';
import UserAvatar from '@/components/common/UserAvatar.vue';
import { updateUser } from '@/services/user.service';
import { useAuthStore } from '@/stores/auth.store';
import { readProfileImageFile } from '@/utils/avatar';

const authStore = useAuthStore();
const saving = ref(false);
const message = ref('');
const error = ref('');
const isModalOpen = ref(false);

const form = reactive({
  name: '',
  email: '',
  phone: '',
  avatarUrl: null as string | null,
});

const previewInitials = computed(() =>
  form.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'U',
);

watch(() => authStore.user, (user) => {
  form.name = user?.name ?? '';
  form.email = user?.email ?? '';
  form.phone = user?.phone ?? '';
  form.avatarUrl = user?.avatarUrl ?? null;
}, { immediate: true });

function openEditProfile() {
  message.value = '';
  error.value = '';
  form.avatarUrl = authStore.user?.avatarUrl ?? null;
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

function closeModal() {
  isModalOpen.value = false;
}

async function saveProfile() {
  if (!authStore.user) return;

  saving.value = true;
  message.value = '';
  error.value = '';

  try {
    const updatedUser = await updateUser(authStore.user.id, {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      role: authStore.user.role,
      status: authStore.user.status,
      shiftActive: authStore.user.shiftActive,
      restaurantId: authStore.user.restaurantId ?? null,
      accessWindow: authStore.user.roleAssignments[0]?.accessWindow ?? null,
      avatarUrl: form.avatarUrl,
    });

    if (updatedUser) {
      authStore.setCurrentUser(updatedUser);
      message.value = 'Profile updated successfully!';
      isModalOpen.value = false;
    }
  } catch (incoming) {
    error.value = incoming instanceof Error ? incoming.message : 'Failed to update profile.';
  } finally {
    saving.value = false;
  }
}
</script>
