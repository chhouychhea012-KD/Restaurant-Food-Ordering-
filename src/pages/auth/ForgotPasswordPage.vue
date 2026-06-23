<template>
  <div>
    <p class="text-xs font-bold uppercase tracking-[0.3em] text-brand-500">Recovery</p>
    <h1 class="mt-3 text-3xl font-bold text-slate-950">Forgot your password?</h1>
    <p class="mt-3 text-sm leading-6 text-slate-600">
      This MVP is frontend-only, so password reset is presented as a secure support workflow placeholder instead of pretending there is a live email backend.
    </p>

    <div class="mt-8 rounded-[1.75rem] bg-slate-50 p-6">
      <label class="field-label" for="recoveryEmail">Email address</label>
      <input id="recoveryEmail" class="field-input" type="email" placeholder="customer@flavorfleet.app" />
      <button class="btn-primary mt-4 w-full">Request reset link</button>
      <p class="mt-4 text-sm text-slate-500">Demo note: use one of the seeded passwords shown on the login page to continue testing the protected routes.</p>
    </div>
  </div>
</template>
