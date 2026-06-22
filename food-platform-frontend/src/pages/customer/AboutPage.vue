<template>
  <div class="space-y-6">
    <section class="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#0f172a,#1e293b_52%,#ea580c)] px-6 py-10 text-white shadow-glow sm:px-10 sm:py-12">
      <div class="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.14),transparent_58%)] lg:block" />
      <div class="relative grid gap-8 xl:grid-cols-[1.25fr_0.85fr] xl:items-end">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.35em] text-orange-200">About Flavor Fleet</p>
          <h1 class="mt-4 max-w-4xl text-4xl font-extrabold leading-tight sm:text-5xl">
            Food ordering made simple for customers, restaurants, and delivery teams.
          </h1>
          <p class="mt-5 max-w-3xl text-sm leading-7 text-slate-200 sm:text-base">
            Flavor Fleet is a modern food ordering platform with one smooth flow from browsing to delivery.
          </p>
          <div class="mt-7 flex flex-wrap gap-3">
            <RouterLink to="/restaurants" class="btn-primary bg-white text-slate-950 hover:bg-orange-100">Explore restaurants</RouterLink>
            <RouterLink to="/categories" class="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/20">Browse categories</RouterLink>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <div class="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">Customer Experience</p>
            <p class="mt-2 text-3xl font-bold">Fast</p>
            <p class="mt-2 text-sm leading-6 text-white/75">Search, categories, cart, checkout, profile, and order tracking in one clean frontend.</p>
          </div>
          <div class="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">Operations</p>
            <p class="mt-2 text-3xl font-bold">Connected</p>
            <p class="mt-2 text-sm leading-6 text-white/75">Admin, catalog, order control, kitchen flow, and rider handling share the same system state.</p>
          </div>
          <div class="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">MVP Focus</p>
            <p class="mt-2 text-3xl font-bold">Practical</p>
            <p class="mt-2 text-sm leading-6 text-white/75">Built as a local JSON-backed product demo with strong UI, auth flow, and CRUD coverage.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-3">
      <div class="surface-card p-5">
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-brand-500">Our Product</p>
        <h2 class="mt-3 text-2xl font-bold text-slate-950">One platform for ordering and operations</h2>
        <p class="mt-3 text-sm leading-7 text-slate-600">Flavor Fleet combines customer ordering, admin control, restaurant management, kitchen queue handling, and rider delivery views in one frontend product experience.</p>
      </div>
      <div class="surface-card p-5">
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-brand-500">Our Service</p>
        <h2 class="mt-3 text-2xl font-bold text-slate-950">Built around speed and clarity</h2>
        <p class="mt-3 text-sm leading-7 text-slate-600">We focus on helping users discover food quickly, understand delivery information clearly, and complete ordering with less friction from browse to checkout.</p>
      </div>
      <div class="surface-card p-5">
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-brand-500">Our Goal</p>
        <h2 class="mt-3 text-2xl font-bold text-slate-950">Make every handoff feel seamless</h2>
        <p class="mt-3 text-sm leading-7 text-slate-600">From the first search to the final delivery status, every module is designed to stay aligned so the customer journey and operational workflow support each other.</p>
      </div>
    </section>

    <SectionCard eyebrow="What We Offer" title="Product and service highlights" description="These are the main capabilities we created in the Flavor Fleet frontend system.">
      <div class="grid gap-4 lg:grid-cols-2">
        <article v-for="item in highlights" :key="item.title" class="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-sm">
          <p class="text-xs font-bold uppercase tracking-[0.2em] text-brand-500">{{ item.eyebrow }}</p>
          <h3 class="mt-3 text-xl font-bold text-slate-950">{{ item.title }}</h3>
          <p class="mt-3 text-sm leading-7 text-slate-600">{{ item.description }}</p>
        </article>
      </div>
    </SectionCard>

    <SectionCard eyebrow="How It Works" title="A complete frontend workflow" description="The customer-facing product and the internal service tools are designed to work together across the same data flow.">
      <div class="grid gap-4 xl:grid-cols-4">
        <div v-for="(step, index) in workflow" :key="step.title" class="rounded-[1.75rem] border border-slate-200 bg-slate-50/85 p-5">
          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500 text-sm font-bold text-white shadow-lg shadow-brand-200">
            {{ index + 1 }}
          </div>
          <h3 class="mt-4 text-lg font-bold text-slate-950">{{ step.title }}</h3>
          <p class="mt-3 text-sm leading-7 text-slate-600">{{ step.description }}</p>
        </div>
      </div>
    </SectionCard>

    <section class="surface-card overflow-hidden p-6 sm:p-7">
      <div class="grid gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:items-center">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.25em] text-brand-500">Why Customers Use It</p>
          <h2 class="mt-3 text-3xl font-bold text-slate-950">A clearer, more modern ordering experience</h2>
          <p class="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
            We created the customer frontend to feel polished, quick, and easy to understand. Search filters, dynamic categories, menu browsing, cart protection, profile tools, and order tracking are all part of the same experience.
          </p>
        </div>
        <div class="grid gap-3">
          <div class="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
            <p class="text-sm font-semibold text-slate-900">Dynamic catalog discovery</p>
            <p class="mt-2 text-sm leading-6 text-slate-600">Categories and menu results can change as the admin dashboard updates restaurants, products, and menu groups.</p>
          </div>
          <div class="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
            <p class="text-sm font-semibold text-slate-900">Protected customer routes</p>
            <p class="mt-2 text-sm leading-6 text-slate-600">Login, register, profile, addresses, dashboard, checkout, and order history all work with route validation.</p>
          </div>
          <div class="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
            <p class="text-sm font-semibold text-slate-900">Operational visibility</p>
            <p class="mt-2 text-sm leading-6 text-slate-600">Order state can move across admin, kitchen, and rider flows so tracking stays meaningful for the customer.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import SectionCard from '@/components/common/SectionCard.vue';

const highlights = [
  {
    eyebrow: 'Discovery',
    title: 'Restaurant search and category browsing',
    description:
      'Customers can browse restaurants, search by cuisine or name, and use dynamic category filters that come directly from the admin-managed menu catalog.',
  },
  {
    eyebrow: 'Checkout',
    title: 'Single-store cart and secure order flow',
    description:
      'The cart enforces one restaurant at a time, then connects into checkout, saved addresses, pricing, and order creation for a reliable frontend MVP journey.',
  },
  {
    eyebrow: 'Admin Service',
    title: 'Full CRUD modules for platform control',
    description:
      'Admins can manage users, roles, permissions, restaurants, products, categories, orders, analytics, and profile settings from the protected dashboard.',
  },
  {
    eyebrow: 'Operations',
    title: 'Restaurant, kitchen, and rider workflow views',
    description:
      'Owners, kitchen teams, and riders each have focused interfaces so service handoffs can continue beyond the customer-facing storefront.',
  },
];

const workflow = [
  {
    title: 'Discover',
    description: 'Customers browse restaurants, categories, and menu offerings with creative cards, filters, and dynamic frontend data.',
  },
  {
    title: 'Order',
    description: 'They add items to cart, confirm delivery details, and place orders through a protected checkout flow.',
  },
  {
    title: 'Operate',
    description: 'Admin, restaurant, kitchen, and rider modules can update the same order lifecycle across the service workflow.',
  },
  {
    title: 'Track',
    description: 'Customers return to tracking and history pages to see status changes and follow the delivery journey clearly.',
  },
];
</script>

