<template>
  <div class="space-y-6">
    <section class="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
      <div class="surface-card overflow-hidden">
        <div class="bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.18),transparent_24%),linear-gradient(135deg,#fff7ed,#ffffff_42%,#f8fafc)] p-6 sm:p-8">
          <div class="flex flex-wrap items-start justify-between gap-6">
            <div class="flex items-center gap-4">
              <div class="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-brand-500 text-2xl font-bold text-white shadow-lg shadow-brand-200">
                {{ authStore.user?.avatar }}
              </div>
              <div>
                <p class="text-sm font-semibold uppercase tracking-[0.28em] text-brand-500">Admin Profile</p>
                <h2 class="mt-2 text-3xl font-bold text-slate-950">{{ authStore.user?.name }}</h2>
                <p class="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                  Manage the administrator identity that controls the protected dashboard, CRUD modules, permissions, and analytics views.
                </p>
              </div>
            </div>
            <button class="btn-primary" type="button" @click="openEditProfile">Edit profile</button>
          </div>

          <div class="mt-8 grid gap-4 sm:grid-cols-3">
            <div class="rounded-[1.5rem] border border-slate-200 bg-white/80 p-4 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Role</p>
              <p class="mt-2 text-2xl font-bold text-slate-950 capitalize">{{ authStore.user?.role }}</p>
              <p class="mt-2 text-sm text-slate-500">Platform control access</p>
            </div>
            <div class="rounded-[1.5rem] border border-slate-200 bg-white/80 p-4 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Permissions</p>
              <p class="mt-2 text-2xl font-bold text-slate-950">{{ authStore.permissions.length }}</p>
              <p class="mt-2 text-sm text-slate-500">Validated route capabilities</p>
            </div>
            <div class="rounded-[1.5rem] border border-slate-200 bg-white/80 p-4 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Status</p>
              <p class="mt-2 text-2xl font-bold text-slate-950">{{ authStore.user?.shiftActive ? 'Active' : 'Paused' }}</p>
              <p class="mt-2 text-sm text-slate-500">Admin workspace access</p>
            </div>
          </div>
        </div>
      </div>

      <SectionCard eyebrow="Access Summary" title="Admin shortcuts" description="Quick links for the core modules connected to your admin identity.">
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <RouterLink class="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4 transition hover:-translate-y-1 hover:bg-white" to="/admin/users">
            <p class="text-sm font-semibold text-slate-900">Manage users</p>
            <p class="mt-2 text-sm text-slate-500">Update operators, customers, and staff roles.</p>
          </RouterLink>
          <RouterLink class="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4 transition hover:-translate-y-1 hover:bg-white" to="/admin/roles">
            <p class="text-sm font-semibold text-slate-900">Roles and permissions</p>
            <p class="mt-2 text-sm text-slate-500">Review what this admin can control.</p>
          </RouterLink>
          <RouterLink class="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4 transition hover:-translate-y-1 hover:bg-white" to="/admin/products">
            <p class="text-sm font-semibold text-slate-900">Products and categories</p>
            <p class="mt-2 text-sm text-slate-500">Manage the full catalog and menu groups.</p>
          </RouterLink>
          <RouterLink class="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4 transition hover:-translate-y-1 hover:bg-white" to="/admin/analytics">
            <p class="text-sm font-semibold text-slate-900">Analytics dashboard</p>
            <p class="mt-2 text-sm text-slate-500">Track platform performance and chart data.</p>
          </RouterLink>
        </div>
      </SectionCard>
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <SectionCard eyebrow="Account Details" title="Administrator information" description="These values are part of the same local frontend user dataset used by login and protected routing.">
        <div class="grid gap-4 md:grid-cols-2">
          <div class="surface-muted p-5">
            <p class="text-sm font-semibold text-slate-900">Full name</p>
            <p class="mt-2 text-base text-slate-600">{{ authStore.user?.name }}</p>
          </div>
          <div class="surface-muted p-5">
            <p class="text-sm font-semibold text-slate-900">Email</p>
            <p class="mt-2 break-all text-base text-slate-600">{{ authStore.user?.email }}</p>
          </div>
          <div class="surface-muted p-5">
            <p class="text-sm font-semibold text-slate-900">Phone</p>
            <p class="mt-2 text-base text-slate-600">{{ authStore.user?.phone }}</p>
          </div>
          <div class="surface-muted p-5">
            <p class="text-sm font-semibold text-slate-900">Avatar code</p>
            <p class="mt-2 text-base text-slate-600">{{ authStore.user?.avatar }}</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard eyebrow="Security" title="Protected dashboard state" description="The admin profile is part of the authenticated and permission-validated frontend workflow.">
        <div class="space-y-4">
          <div class="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5">
            <p class="text-sm font-semibold text-emerald-800">Route protection</p>
            <p class="mt-2 text-sm leading-6 text-emerald-700">This admin session is currently allowed to access the protected dashboard routes and CRUD modules.</p>
          </div>
          <div class="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5">
            <p class="text-sm font-semibold text-slate-900">Permission coverage</p>
            <div class="mt-3 flex flex-wrap gap-2">
              <span v-for="permission in authStore.permissions.slice(0, 8)" :key="permission" class="pill bg-white text-slate-600 ring-1 ring-slate-200">
                {{ permission }}
              </span>
            </div>
          </div>
        </div>
      </SectionCard>
    </section>

    <p v-if="message" class="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ message }}</p>
    <p v-if="error" class="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{{ error }}</p>
  </div>

  <AppModal
    :open="isModalOpen"
    eyebrow="Admin Profile"
    title="Edit administrator profile"
    description="Update the signed-in admin identity used by the dashboard."
    size="md"
    @close="closeModal"
  >
    <form class="space-y-4" @submit.prevent="saveProfile">
      <div>
        <label class="field-label" for="admin-name">Full name</label>
        <input id="admin-name" v-model="form.name" class="field-input" type="text" minlength="3" required />
      </div>
      <div>
        <label class="field-label" for="admin-email">Email</label>
        <input id="admin-email" v-model="form.email" class="field-input" type="email" required />
      </div>
      <div>
        <label class="field-label" for="admin-phone">Phone</label>
        <input id="admin-phone" v-model="form.phone" class="field-input" type="tel" required />
      </div>
      <div class="flex flex-wrap gap-3 pt-2">
        <button class="btn-primary" :disabled="saving">{{ saving ? 'Saving...' : 'Save profile' }}</button>
        <button class="btn-secondary" type="button" @click="closeModal">Cancel</button>
      </div>
    </form>
  </AppModal>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
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
  name: authStore.user?.name ?? '',
  email: authStore.user?.email ?? '',
  phone: authStore.user?.phone ?? '',
});

watch(
  () => authStore.user,
  (user) => {
    form.name = user?.name ?? '';
    form.email = user?.email ?? '';
    form.phone = user?.phone ?? '';
  },
  { immediate: true },
);

function openEditProfile() {
  message.value = '';
  error.value = '';
  form.name = authStore.user?.name ?? '';
  form.email = authStore.user?.email ?? '';
  form.phone = authStore.user?.phone ?? '';
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
}

async function saveProfile() {
  if (!authStore.user) {
    return;
  }

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
      message.value = 'Admin profile updated successfully.';
      isModalOpen.value = false;
    }
  } catch (incoming) {
    error.value = incoming instanceof Error ? incoming.message : 'Unable to update admin profile.';
  } finally {
    saving.value = false;
  }
}
</script>
