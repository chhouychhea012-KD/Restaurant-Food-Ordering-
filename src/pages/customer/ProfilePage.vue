<template>
  <div class="space-y-6">
    <section class="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
      <div class="surface-card overflow-hidden">
        <div class="bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.22),transparent_28%),linear-gradient(135deg,#0f172a,#1e293b_58%,#334155)] p-6 text-white sm:p-8">
          <div class="flex flex-wrap items-start justify-between gap-6">
            <div class="flex items-center gap-4">
              <div class="flex h-20 w-20 items-center justify-center rounded-xl bg-white/14 text-2xl font-bold shadow-lg shadow-slate-950/30 ring-1 ring-white/10 backdrop-blur">
                {{ authStore.user?.avatar }}
              </div>
              <div>
                <p class="text-sm font-semibold uppercase tracking-[0.28em] text-white/65">Customer Profile</p>
                <h2 class="mt-2 text-3xl font-bold">{{ authStore.user?.name }}</h2>
                <p class="mt-2 max-w-xl text-sm leading-6 text-white/74">
                  Your account is connected to checkout, saved addresses, order history, and loyalty rewards across the full frontend workflow.
                </p>
              </div>
            </div>
            <button class="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white" type="button" @click="openEditProfile">
              Edit profile
            </button>
          </div>

          <div class="mt-8 grid gap-4 sm:grid-cols-3">
            <div class="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Loyalty points</p>
              <p class="mt-2 text-3xl font-bold">{{ authStore.user?.loyaltyPoints ?? 0 }}</p>
              <p class="mt-2 text-sm text-white/70">Available on your next order</p>
            </div>
            <div class="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Saved addresses</p>
              <p class="mt-2 text-3xl font-bold">{{ authStore.user?.addresses?.length ?? 0 }}</p>
              <p class="mt-2 text-sm text-white/70">Ready for faster checkout</p>
            </div>
            <div class="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Account status</p>
              <p class="mt-2 text-3xl font-bold">Active</p>
              <p class="mt-2 text-sm text-white/70">Authenticated and protected</p>
            </div>
          </div>
        </div>
      </div>

      <SectionCard eyebrow="Quick Access" title="Profile shortcuts" description="Move quickly between the areas most connected to your customer account.">
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <RouterLink class="rounded-xl border border-slate-200 bg-slate-50/80 p-4 transition hover:-translate-y-1 hover:bg-white" to="/addresses">
            <p class="text-sm font-semibold text-slate-900">Manage addresses</p>
            <p class="mt-2 text-sm text-slate-500">Update your delivery locations and defaults.</p>
          </RouterLink>
          <RouterLink class="rounded-xl border border-slate-200 bg-slate-50/80 p-4 transition hover:-translate-y-1 hover:bg-white" to="/orders">
            <p class="text-sm font-semibold text-slate-900">Order history</p>
            <p class="mt-2 text-sm text-slate-500">Review your latest purchases and statuses.</p>
          </RouterLink>
          <RouterLink class="rounded-xl border border-slate-200 bg-slate-50/80 p-4 transition hover:-translate-y-1 hover:bg-white" to="/track-order">
            <p class="text-sm font-semibold text-slate-900">Track live order</p>
            <p class="mt-2 text-sm text-slate-500">Jump into your current order progress page.</p>
          </RouterLink>
          <RouterLink class="rounded-xl border border-slate-200 bg-slate-50/80 p-4 transition hover:-translate-y-1 hover:bg-white" to="/dashboard">
            <p class="text-sm font-semibold text-slate-900">Customer dashboard</p>
            <p class="mt-2 text-sm text-slate-500">Return to your protected customer workspace.</p>
          </RouterLink>
        </div>
      </SectionCard>
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <SectionCard eyebrow="Account Details" title="Personal information" description="Your profile information is stored in the local JSON-backed frontend data layer.">
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

      <SectionCard eyebrow="Security" title="Account protection" description="This MVP uses validated frontend auth state, role routing, and route guards after login.">
        <div class="space-y-4">
          <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
            <p class="text-sm font-semibold text-emerald-800">Session status</p>
            <p class="mt-2 text-sm leading-6 text-emerald-700">You are currently logged in and your protected customer routes are active.</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50/80 p-5">
            <p class="text-sm font-semibold text-slate-900">Frontend validation</p>
            <p class="mt-2 text-sm leading-6 text-slate-600">Profile updates validate email uniqueness and keep the local mock database in sync with your session user.</p>
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
import { reactive, ref, watch } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import AppModal from '@/components/common/AppModal.vue';
import SectionCard from '@/components/common/SectionCard.vue';
import { deleteCustomerAccount, updateCustomerProfile } from '@/services/customer.service';
import { useAuthStore } from '@/stores/auth.store';

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
    const updatedUser = await updateCustomerProfile(authStore.user.id, form);
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
