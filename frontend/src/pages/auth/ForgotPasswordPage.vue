<template>
  <div>
    <p class="text-xs font-bold uppercase tracking-[0.3em] text-brand-500">Recovery</p>
    <h2 class="mt-3 text-3xl font-bold text-slate-950">Forgot your password?</h2>
    <p class="mt-3 text-sm leading-6 text-slate-500">
      Enter your account email, verify the reset code, then create a new password.
    </p>

    <form class="mt-8 space-y-5" @submit.prevent="handleSubmit">
      <div>
        <label class="field-label" for="recoveryEmail">Email address</label>
        <input
          id="recoveryEmail"
          v-model.trim="form.email"
          class="field-input"
          type="email"
          placeholder="you@example.com"
          autocomplete="email"
          :disabled="isLoading || step !== 'email'"
          required
        />
      </div>

      <div v-if="step !== 'email'" class="rounded-xl border border-brand-100 bg-orange-50 px-4 py-3 text-sm leading-6 text-slate-700">
        <span>We sent a 6-digit reset code to</span>
        <span class="block break-all font-semibold text-slate-950 sm:inline">{{ form.email }}</span><span class="hidden sm:inline">.</span>
        <span v-if="step === 'code' && countdownSeconds > 0" class="block">The code expires in {{ countdownSeconds }}s.</span>
        <span v-else-if="step === 'code'" class="block font-semibold text-rose-600">The code has expired. Please resend a new code.</span>
        <span v-else class="block font-semibold text-emerald-700">Code verified. Create your new password.</span>
      </div>

      <div v-if="step === 'code' || step === 'password'">
        <label class="field-label" for="resetCode">Reset code</label>
        <input
          id="resetCode"
          v-model.trim="form.code"
          class="field-input text-center tracking-[0.35em]"
          type="text"
          inputmode="numeric"
          maxlength="6"
          placeholder="000000"
          autocomplete="one-time-code"
          :disabled="isLoading || step === 'password' || isCodeExpired"
          required
        />
      </div>

      <template v-if="step === 'password'">
        <div>
          <label class="field-label" for="newPassword">New password</label>
          <input
            id="newPassword"
            v-model="form.password"
            class="field-input"
            type="password"
            autocomplete="new-password"
            minlength="8"
            required
          />
        </div>

        <div>
          <label class="field-label" for="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            class="field-input"
            type="password"
            autocomplete="new-password"
            minlength="8"
            required
          />
        </div>
      </template>

      <p v-if="successMessage" class="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ successMessage }}</p>
      <p v-if="errorMessage" class="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{{ errorMessage }}</p>

      <button class="btn-primary w-full" :disabled="isLoading || isCodeExpired">
        {{ buttonLabel }}
      </button>

      <div v-if="step !== 'email'" class="flex items-center justify-between gap-3 text-sm">
        <button class="font-semibold text-slate-500 transition hover:text-brand-600" type="button" :disabled="isLoading" @click="startOver">
          Change email
        </button>
        <button class="font-semibold text-brand-600 transition hover:text-brand-700" type="button" :disabled="isLoading" @click="resendCode">
          Resend code
        </button>
      </div>

      <RouterLink class="block text-center text-sm font-semibold text-slate-500 transition hover:text-brand-600" to="/auth/login">
        Back to login
      </RouterLink>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { requestPasswordReset, resetPassword, verifyPasswordResetCode } from '@/services/auth.service';

const router = useRouter();
const step = ref<'email' | 'code' | 'password'>('email');
const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const countdownSeconds = ref(0);
let countdownTimer: ReturnType<typeof setInterval> | null = null;

const form = reactive({
  email: '',
  code: '',
  password: '',
  confirmPassword: '',
});

const isCodeExpired = computed(() => step.value === 'code' && countdownSeconds.value <= 0);

const buttonLabel = computed(() => {
  if (isLoading.value) return 'Please wait...';
  if (step.value === 'email') return 'Send reset code';
  if (step.value === 'code' && isCodeExpired.value) return 'Code expired';
  if (step.value === 'code') return 'Verify code';
  return 'Change password';
});

function stopCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
}

function startCountdown(seconds: number) {
  stopCountdown();
  countdownSeconds.value = Math.max(0, seconds);
  countdownTimer = setInterval(() => {
    countdownSeconds.value = Math.max(0, countdownSeconds.value - 1);
    if (countdownSeconds.value === 0) {
      stopCountdown();
    }
  }, 1000);
}

onUnmounted(stopCountdown);

function getErrorMessage(error: unknown) {
  const responseMessage = (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
  return responseMessage || (error instanceof Error ? error.message : 'Something went wrong. Please try again.');
}

async function sendCode() {
  const response = await requestPasswordReset(form.email);
  startCountdown(response.expiresInSeconds);
  successMessage.value = response.message;
  step.value = 'code';
}

async function handleSubmit() {
  errorMessage.value = '';
  successMessage.value = '';
  isLoading.value = true;

  try {
    if (step.value === 'email') {
      await sendCode();
      return;
    }

    if (step.value === 'code') {
      if (isCodeExpired.value) {
        throw new Error('The reset code has expired. Please resend a new code.');
      }
      const response = await verifyPasswordResetCode(form.email, form.code);
      successMessage.value = response.message;
      stopCountdown();
      step.value = 'password';
      return;
    }

    if (form.password !== form.confirmPassword) {
      throw new Error('Passwords do not match.');
    }

    const response = await resetPassword({ email: form.email, code: form.code, password: form.password });
    successMessage.value = response.message;
    setTimeout(() => router.push('/auth/login'), 900);
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
  } finally {
    isLoading.value = false;
  }
}

async function resendCode() {
  errorMessage.value = '';
  successMessage.value = '';
  isLoading.value = true;
  try {
    form.code = '';
    form.password = '';
    form.confirmPassword = '';
    await sendCode();
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
  } finally {
    isLoading.value = false;
  }
}

function startOver() {
  step.value = 'email';
  form.code = '';
  form.password = '';
  form.confirmPassword = '';
  stopCountdown();
  countdownSeconds.value = 0;
  errorMessage.value = '';
  successMessage.value = '';
}
</script>
