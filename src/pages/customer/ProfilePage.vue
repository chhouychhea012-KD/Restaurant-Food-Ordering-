<template>
  <div class="space-y-6">
    <section class="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
      <div class="surface-card overflow-hidden">
        <div class="border-b border-orange-100 bg-gradient-to-br from-orange-50 via-white to-emerald-50 p-6 sm:p-8">
          <div class="flex flex-wrap items-start justify-between gap-6">
            <div class="flex items-center gap-4">
              <UserAvatar :user="authStore.user" size="xl" />
              <div>
                <p class="text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">Customer Profile</p>
                <h2 class="mt-2 text-3xl font-bold text-slate-950">{{ authStore.user?.name }}</h2>
                <p class="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                  Manage your personal details, delivery addresses, orders, and loyalty rewards.
                </p>
              </div>
            </div>
            <button class="btn-primary" type="button" @click="openEditProfile">
              Edit profile
            </button>
          </div>

          <div class="mt-8 grid gap-4 sm:grid-cols-3">
            <div class="rounded-xl border border-orange-100 bg-white p-4 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Loyalty points</p>
              <p class="mt-2 text-3xl font-bold text-brand-600">{{ authStore.user?.loyaltyPoints ?? 0 }}</p>
              <p class="mt-2 text-sm text-slate-500">Available on your next order</p>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Saved addresses</p>
              <p class="mt-2 text-3xl font-bold text-slate-950">{{ authStore.user?.addresses?.length ?? 0 }}</p>
              <p class="mt-2 text-sm text-slate-500">Ready for faster checkout</p>
            </div>
            <div class="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Account status</p>
              <p class="mt-2 text-3xl font-bold text-emerald-600">Active</p>
              <p class="mt-2 text-sm text-slate-500">Protected account access</p>
            </div>
          </div>
        </div>
      </div>

      <SectionCard eyebrow="Quick Access" title="Profile shortcuts" description="">
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <RouterLink class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:bg-orange-50" to="/addresses">
            <p class="text-sm font-semibold text-slate-900">Manage addresses</p>
            <p class="mt-2 text-sm text-slate-500">Update your delivery locations and defaults.</p>
          </RouterLink>
          <RouterLink class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:bg-orange-50" to="/orders">
            <p class="text-sm font-semibold text-slate-900">Order history</p>
            <p class="mt-2 text-sm text-slate-500">Review your latest purchases and statuses.</p>
          </RouterLink>
          <RouterLink class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:bg-orange-50" to="/track-order">
            <p class="text-sm font-semibold text-slate-900">Track live order</p>
            <p class="mt-2 text-sm text-slate-500">Jump into your current order progress page.</p>
          </RouterLink>
          <RouterLink class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:bg-orange-50" to="/dashboard">
            <p class="text-sm font-semibold text-slate-900">Customer dashboard</p>
            <p class="mt-2 text-sm text-slate-500">Return to your protected customer workspace.</p>
          </RouterLink>
        </div>
      </SectionCard>
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <SectionCard eyebrow="Account Details" title="Personal information" description="Name, email, phone, and loyalty.">
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
            <p class="text-sm font-semibold text-slate-900">Account role</p>
            <p class="mt-2 text-base capitalize text-slate-600">{{ authStore.user?.role }}</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard eyebrow="Security" title="Account protection" description="">
        <div class="space-y-4">
          <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
            <p class="text-sm font-semibold text-emerald-800">Session status</p>
            <p class="mt-2 text-sm leading-6 text-emerald-700">You are currently logged in and your protected customer routes are active.</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50/80 p-5">
            <p class="text-sm font-semibold text-slate-900">Frontend validation</p>
            <p class="mt-2 text-sm leading-6 text-slate-600">Profile changes update your current session immediately.</p>
          </div>
          <div class="rounded-xl border border-rose-200 bg-rose-50 p-5">
            <p class="text-sm font-semibold text-rose-700">Danger zone</p>
            <p class="mt-2 text-sm leading-6 text-slate-600">Deleting your account removes the local customer record and logs you out of the frontend.</p>
            <button class="mt-4 rounded-xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600" :disabled="saving" @click="removeAccount">
              Delete account
            </button>
          </div>
        </div>
      </SectionCard>
    </section>

    <p v-if="message" class="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ message }}</p>
    <p v-if="error" class="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{{ error }}</p>
  </div>

  <AppModal
    :open="isModalOpen"
    eyebrow="Customer Profile"
    title="Edit account details"
    description="Update your account information in a focused popup form."
    size="md"
    @close="closeModal"
  >
    <form class="space-y-4" @submit.prevent="saveProfile">
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-orange-400 text-2xl font-bold text-white shadow-sm ring-4 ring-white">
            <img v-if="form.avatarUrl" :src="form.avatarUrl" alt="Profile preview" class="h-full w-full object-cover" />
            <span v-else>{{ previewInitials }}</span>
          </div>
          <div class="min-w-0 flex-1">
            <label class="btn-secondary cursor-pointer" for="profile-photo">Upload photo</label>
            <input id="profile-photo" class="sr-only" type="file" accept="image/*" @change="onAvatarFileChange" />
            <button v-if="form.avatarUrl" class="btn-secondary ml-2" type="button" @click="removeAvatar">Remove</button>
            <p class="mt-2 text-xs text-slate-500">JPG, PNG, or WebP. Max 1.5 MB.</p>
          </div>
        </div>
      </div>
      <div>
        <label class="field-label" for="modal-name">Full name</label>
        <input id="modal-name" v-model="form.name" class="field-input" type="text" minlength="3" required />
      </div>
      <div>
        <label class="field-label" for="modal-email">Email</label>
        <input id="modal-email" v-model="form.email" class="field-input" type="email" required />
      </div>
      <div>
        <label class="field-label" for="modal-phone">Phone</label>
        <input id="modal-phone" v-model="form.phone" class="field-input" type="tel" required />
      </div>
      <div class="flex flex-wrap gap-3 pt-2">
        <button class="btn-primary" :disabled="saving">{{ saving ? 'Saving...' : 'Save profile' }}</button>
        <button class="btn-secondary" type="button" @click="closeModal">Cancel</button>
      </div>
    </form>
  </AppModal>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import AppModal from '@/components/common/AppModal.vue';
import SectionCard from '@/components/common/SectionCard.vue';
import UserAvatar from '@/components/common/UserAvatar.vue';
import { deleteCustomerAccount, updateCustomerProfile } from '@/services/customer.service';
import { useAuthStore } from '@/stores/auth.store';
import { readProfileImageFile } from '@/utils/avatar';

const authStore = useAuthStore();
const router = useRouter();
const saving = ref(false);
const message = ref('');
const error = ref('');
const isModalOpen = ref(false);

const form = reactive({
  name: authStore.user?.name ?? '',
  email: authStore.user?.email ?? '',
  phone: authStore.user?.phone ?? '',
  avatarUrl: authStore.user?.avatarUrl ?? null as string | null,
});

const previewInitials = computed(() =>
  form.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'U',
);

watch(
  () => authStore.user,
  (user) => {
    form.name = user?.name ?? '';
    form.email = user?.email ?? '';
    form.phone = user?.phone ?? '';
    form.avatarUrl = user?.avatarUrl ?? null;
  },
  { immediate: true },
);

function openEditProfile() {
  message.value = '';
  error.value = '';
  form.name = authStore.user?.name ?? '';
  form.email = authStore.user?.email ?? '';
  form.phone = authStore.user?.phone ?? '';
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
  if (!authStore.user) {
    return;
  }

  saving.value = true;
  message.value = '';
  error.value = '';
  try {
    const updatedUser = await updateCustomerProfile(authStore.user.id, { ...form });
    if (updatedUser) {
      authStore.setCurrentUser(updatedUser);
      message.value = 'Profile updated successfully.';
      isModalOpen.value = false;
    }
  } catch (incoming) {
    error.value = incoming instanceof Error ? incoming.message : 'Unable to update your profile.';
  } finally {
    saving.value = false;
  }
}

async function removeAccount() {
  if (!authStore.user) {
    return;
  }

  const confirmed = window.confirm('Delete this customer account from the local frontend data?');
  if (!confirmed) {
    return;
  }

  saving.value = true;
  await deleteCustomerAccount(authStore.user.id);
  authStore.performLogout();
  router.push('/');
}
</script>
