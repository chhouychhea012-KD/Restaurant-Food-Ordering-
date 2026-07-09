<template>
  <div class="space-y-8">
    <!-- Hero Profile Section -->
    <div class="surface-card overflow-hidden rounded-xl">
      <div class="bg-gradient-to-br from-orange-50 via-white to-slate-50 p-8 lg:p-10">
        <div class="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex items-center gap-6">
            <!-- Avatar -->
            <div class="flex h-24 w-24 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-5xl font-bold text-white shadow-xl shadow-orange-200 ring-8 ring-white">
              {{ authStore.user?.avatar || authStore.user?.name?.charAt(0) || '👤' }}
            </div>

            <div>
              <p class="text-sm font-semibold uppercase tracking-widest text-orange-600">Admin Profile</p>
              <h1 class="mt-2 text-4xl font-bold text-slate-900">{{ authStore.user?.name }}</h1>
              <p class="mt-1 text-slate-600">{{ authStore.user?.email }}</p>
            </div>
          </div>

          <button @click="openEditProfile" class="btn-primary flex items-center gap-2 text-base px-6 py-3">
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
            <p class="text-sm text-slate-500">Avatar Code</p>
            <p class="mt-1 font-mono text-slate-600">{{ authStore.user?.avatar }}</p>
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

      <div class="flex gap-3 pt-4">
        <button class="btn-primary flex-1" :disabled="saving">
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
        <button type="button" class="btn-secondary flex-1" @click="closeModal">Cancel</button>
      </div>
    </form>
  </AppModal>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { Edit3, Users, Shield, Package, BarChart3, ShieldCheck } from 'lucide-vue-next';

import AppModal from '@/components/common/AppModal.vue';
import SectionCard from '@/components/common/SectionCard.vue';
import { updateUser } from '@/services/user.service';
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
const saving = ref(false);
const message = ref('');
const error = ref('');
const isModalOpen = ref(false);

const form = reactive({
  name: '',
  email: '',
  phone: '',
});

watch(() => authStore.user, (user) => {
  form.name = user?.name ?? '';
  form.email = user?.email ?? '';
  form.phone = user?.phone ?? '';
}, { immediate: true });

function openEditProfile() {
  message.value = '';
  error.value = '';
  isModalOpen.value = true;
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
      shiftActive: authStore.user.shiftActive,
      restaurantId: authStore.user.restaurantId ?? null,
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