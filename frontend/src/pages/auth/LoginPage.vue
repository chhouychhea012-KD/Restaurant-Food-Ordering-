<template>
  <div>
    <p class="text-center text-xs font-bold uppercase tracking-[0.3em] text-brand-500">Welcome Back</p>
    <h2 class="mt-3 text-center text-3xl font-bold text-slate-950">Sign in to your account</h2>

    <div class="mt-8 space-y-4">
      <div v-if="appEnv.googleClientId" class="google-signin-shell">
        <div ref="googleButtonRef" class="google-signin-button"></div>
      </div>
      <p v-else class="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">Google login is not configured yet. Please add VITE_GOOGLE_CLIENT_ID.</p>
      <p v-if="googleError" class="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">{{ googleError }}</p>
      <div class="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        <span class="h-px flex-1 bg-slate-200"></span>
        <span>or</span>
        <span class="h-px flex-1 bg-slate-200"></span>
      </div>
    </div>

    <form class="mt-5 space-y-5" @submit.prevent="submit">
      <div>
        <label class="field-label" for="email">Email</label>
        <input id="email" v-model="form.email" class="field-input" type="email" placeholder="you@example.com" autocomplete="email" inputmode="email" autocapitalize="none" autocorrect="off" spellcheck="false" required />
      </div>
      <div>
        <label class="field-label" for="password">Password</label>
        <input id="password" v-model="form.password" class="field-input" type="password" placeholder="Password" autocomplete="current-password" autocapitalize="none" autocorrect="off" spellcheck="false" required minlength="8" />
      </div>
      <div class="flex items-center justify-end text-sm">
        <RouterLink class="font-medium text-slate-500 transition hover:text-brand-600" to="/auth/forgot-password">Forgot password?</RouterLink>
      </div>
      <p v-if="errorMessage" class="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{{ errorMessage }}</p>
      <button class="btn-primary w-full text-base" :disabled="loading">{{ loading ? 'Signing in...' : 'Continue' }}</button>
    </form>

    <p class="mt-8 text-center text-sm text-slate-500">
      Don't have an account?
      <RouterLink class="font-semibold text-brand-600" to="/auth/register">Sign up</RouterLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth.store';
import { appEnv } from '@/config/env';

const authStore = useAuthStore();
const { loading, error } = storeToRefs(authStore);
const router = useRouter();
const route = useRoute();

const form = reactive({
  email: '',
  password: '',
});


const errorMessage = error;
const googleError = ref('');
const googleButtonRef = ref<HTMLElement | null>(null);

let googleScriptPromise: Promise<void> | null = null;

function loadGoogleScript() {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Unable to load Google login.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Unable to load Google login.'));
    document.head.appendChild(script);
  });

  return googleScriptPromise;
}

async function finishGoogleLogin(credential: string) {
  await authStore.performGoogleLogin(credential);
  const redirect = getSafeRedirect();
  if (redirect) {
    await router.push(redirect);
    return;
  }

  await router.push(authStore.defaultWorkspaceRoute);
}

function renderGoogleButton() {
  if (!appEnv.googleClientId || !googleButtonRef.value || !window.google?.accounts?.id) {
    return;
  }

  googleButtonRef.value.innerHTML = '';
  window.google.accounts.id.initialize({
    client_id: appEnv.googleClientId,
    callback: (response) => {
      if (!response.credential) {
        googleError.value = 'Google did not return a login credential.';
        return;
      }

      void finishGoogleLogin(response.credential).catch((err) => {
        googleError.value = err instanceof Error ? err.message : 'Unable to login with Google.';
      });
    },
    auto_select: false,
    cancel_on_tap_outside: true,
  });
  const width = Math.min(386, Math.max(260, (googleButtonRef.value.clientWidth || 360) - 2));
  window.google.accounts.id.renderButton(googleButtonRef.value, {
    theme: 'outline',
    size: 'large',
    type: 'standard',
    text: 'continue_with',
    shape: 'rectangular',
    width,
    logo_alignment: 'left',
  });
}

onMounted(() => {
  if (!appEnv.googleClientId) {
    return;
  }

  loadGoogleScript()
    .then(renderGoogleButton)
    .catch((err) => {
      googleError.value = err instanceof Error ? err.message : 'Unable to load Google login.';
    });
});

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


<style scoped>
.google-signin-shell {
  display: flex;
  min-height: 44px;
  width: 100%;
  align-items: center;
  justify-content: center;
  overflow: visible;
  border-radius: 12px;
  padding: 1px;
}

.google-signin-button {
  display: flex;
  min-height: 42px;
  width: 100%;
  align-items: center;
  justify-content: center;
  overflow: visible;
  border-radius: 12px;
}

.google-signin-button :deep(div),
.google-signin-button :deep(iframe) {
  max-width: 100%;
}
</style>
