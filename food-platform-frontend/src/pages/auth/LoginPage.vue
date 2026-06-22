<template>
  <div>
    <p class="text-xs font-bold uppercase tracking-[0.3em] text-brand-500">Secure Access</p>
    <h1 class="mt-3 text-3xl font-bold text-slate-950">Login to your workspace</h1>
    <p class="mt-3 text-sm leading-6 text-slate-600">
      Customer, admin, owner, kitchen, and rider routes are protected by role-aware frontend guards and session validation.
    </p>

    <form class="mt-8 space-y-5" @submit.prevent="submit">
      <div>
        <label class="field-label" for="email">Email</label>
        <input id="email" v-model="form.email" class="field-input" type="email" placeholder="you@example.com" required />
      </div>
      <div>
        <label class="field-label" for="password">Password</label>
        <input id="password" v-model="form.password" class="field-input" type="password" placeholder="Password" required minlength="8" />
      </div>
      <p v-if="errorMessage" class="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{{ errorMessage }}</p>
      <button class="btn-primary w-full" :disabled="loading">{{ loading ? 'Signing in...' : 'Login' }}</button>
    </form>

    <div class="mt-8 space-y-3 rounded-[1.75rem] bg-slate-50 p-5">
      <p class="text-sm font-semibold text-slate-900">Demo accounts</p>
      <div class="grid gap-3 text-sm text-slate-600">
        <div v-for="account in demoAccounts" :key="account.email" class="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
          <div>
            <p class="font-semibold text-slate-900">{{ account.role }}</p>
            <p>{{ account.email }}</p>
          </div>
          <button class="text-brand-600" type="button" @click="fillDemo(account.email, account.password)">Use</button>
        </div>
      </div>
    </div>

    <div class="mt-6 flex items-center justify-between text-sm">
      <RouterLink class="font-medium text-brand-600" to="/auth/register">Create customer account</RouterLink>
      <RouterLink class="text-slate-500" to="/auth/forgot-password">Forgot password?</RouterLink>
    </div>
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

    switch (authStore.user?.role) {
      case 'admin':
        await router.push('/admin');
        break;
      case 'owner':
        await router.push('/restaurant');
        break;
      case 'kitchen':
        await router.push('/kitchen');
        break;
      case 'rider':
        await router.push('/rider');
        break;
      default:
        await router.push('/dashboard');
        break;
    }
  } catch {
    return;
  }
}
</script>
