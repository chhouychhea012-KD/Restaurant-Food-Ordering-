<template>
  <div>
    <p class="text-xs font-bold uppercase tracking-[0.3em] text-brand-500">Recovery</p>
    <h1 class="mt-3 text-3xl font-bold text-slate-950">Forgot your password?</h1>

    <div class="mt-8 rounded-xl bg-slate-50 p-6">
      <label class="field-label" for="recoveryEmail">Email address</label>
      <input id="recoveryEmail" class="field-input" type="email" placeholder="customer@flavorfleet.app" />
      <button class="btn-primary mt-4 w-full">Request reset link</button>
      <p class="mt-4 text-sm text-slate-500">Demo note: use one of the seeded passwords shown on the login page to continue testing the protected routes.</p>
    </div>
  </div>
</template>
