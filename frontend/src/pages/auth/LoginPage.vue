<template>
  <div>
    <p class="text-center text-xs font-bold uppercase tracking-[0.3em] text-brand-500">Welcome Back</p>
    <h2 class="mt-3 text-center text-3xl font-bold text-slate-950">Sign in to your account</h2>

    <form class="mt-8 space-y-5" @submit.prevent="submit">
      <div>
        <label class="field-label" for="email">Email</label>
        <input id="email" v-model="form.email" class="field-input" type="email" placeholder="you@example.com" autocomplete="email" required />
      </div>
      <div>
        <label class="field-label" for="password">Password</label>
        <input id="password" v-model="form.password" class="field-input" type="password" placeholder="Password" autocomplete="current-password" required minlength="8" />
      </div>
      <div class="flex items-center justify-end text-sm">
        <RouterLink class="font-medium text-slate-500 transition hover:text-brand-600" to="/auth/forgot-password">Forgot password?</RouterLink>
      </div>
      <p v-if="errorMessage" class="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{{ errorMessage }}</p>
      <button class="btn-primary w-full text-base" :disabled="loading">{{ loading ? 'Signing in...' : 'Continue' }}</button>
    </form>

    <div class="mt-6">
      <p class="text-center text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Quick Demo Access</p>
      <div class="mt-3 flex flex-wrap justify-center gap-2">
        <button
          v-for="account in demoAccounts"
          :key="account.email"
          class="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600"
          type="button"
          @click="fillDemo(account.email, account.password)"
        >
          {{ account.role }}
        </button>
      </div>
    </div>

    <p class="mt-8 text-center text-sm text-slate-500">
      Don't have an account?
      <RouterLink class="font-semibold text-brand-600" to="/auth/register">Sign up</RouterLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
const { loading, error } = storeToRefs(authStore);
const router = useRouter();
const route = useRoute();

const form = reactive({
  email: 'customer@flavorfleet.app',
  password: 'Customer@123',
});

const demoAccounts = [
  { role: 'Platform Admin', email: 'admin@flavorfleet.app', password: 'Admin@123' },
  { role: 'Restaurant Owner', email: 'owner@flavorfleet.app', password: 'Owner@123' },
  { role: 'Kitchen Staff', email: 'kitchen@flavorfleet.app', password: 'Kitchen@123' },
  { role: 'Delivery Rider', email: 'rider@flavorfleet.app', password: 'Rider@123' },
  { role: 'Customer', email: 'customer@flavorfleet.app', password: 'Customer@123' },
];

const errorMessage = error;

function fillDemo(email: string, password: string) {
  form.email = email;
  form.password = password;
}

function getSafeRedirect() {
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : undefined;

  if (!redirect || !redirect.startsWith('/')) {
    return undefined;
  }

  return redirect;
}

async function submit() {
  try {
    await authStore.performLogin(form.email, form.password);
    const redirect = getSafeRedirect();
    if (redirect) {
      await router.push(redirect);
      return;
    }

    await router.push(authStore.defaultWorkspaceRoute);
  } catch {
    return;
  }
}
</script>
