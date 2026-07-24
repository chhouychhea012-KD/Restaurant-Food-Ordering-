<template>
  <div>
    <p class="text-xs font-bold uppercase tracking-[0.3em] text-brand-500">Customer Signup</p>
    <h2 class="mt-3 text-3xl font-bold text-slate-950">Create your ordering account</h2>


    <form class="mt-8 space-y-5" @submit.prevent="submit">
      <div>
        <label class="field-label" for="name">Full name</label>
        <input id="name" v-model="form.name" class="field-input" type="text" required minlength="3" />
      </div>
      <div>
        <label class="field-label" for="email">Email</label>
        <input id="email" v-model="form.email" class="field-input" type="email" required />
      </div>
      <div>
        <label class="field-label" for="password">Password</label>
        <input id="password" v-model="form.password" class="field-input" type="password" required minlength="8" />
      </div>
      <div>
        <label class="field-label" for="confirmPassword">Confirm password</label>
        <input id="confirmPassword" v-model="form.confirmPassword" class="field-input" type="password" required minlength="8" />
      </div>
      <p v-if="localError" class="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{{ localError }}</p>
      <button class="btn-primary w-full" :disabled="loading">{{ loading ? 'Creating account...' : 'Register' }}</button>
    </form>

    <div class="mt-6 text-sm">
      <RouterLink class="font-medium text-brand-600" to="/auth/login">Already have an account? Login</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
const { loading } = storeToRefs(authStore);
const router = useRouter();
const localError = ref('');

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
});

async function submit() {
  localError.value = '';
  if (form.password !== form.confirmPassword) {
    localError.value = 'Passwords do not match.';
    return;
  }

  try {
    await authStore.performRegister({
      name: form.name,
      email: form.email,
      password: form.password,
    });
    router.push('/dashboard');
  } catch (error) {
    localError.value = error instanceof Error ? error.message : 'Unable to register.';
  }
}
</script>
