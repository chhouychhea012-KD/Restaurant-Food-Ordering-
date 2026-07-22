<template>
  <div class="space-y-8">
    <section class="surface-card overflow-hidden bg-gradient-to-br from-orange-50 via-white to-emerald-50 text-slate-900">
      <div class="grid min-h-[500px] lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)]">
        <div class="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-12">
          <p class="text-xs font-bold uppercase tracking-[0.22em] text-brand-600">About Golden Land Restaurant</p>
          <h1 class="mt-4 max-w-xl text-4xl font-extrabold leading-tight sm:text-5xl">
            Fresh food delivery, built for clear everyday ordering.
          </h1>
          <p class="mt-4 max-w-lg text-base leading-7 text-slate-600">
            We connect customers, restaurants, kitchens, riders, and admins in one simple food platform.
          </p>
          <div class="mt-7 flex flex-wrap gap-3">
            <RouterLink to="/restaurants" class="btn-primary">Explore restaurants</RouterLink>
            <RouterLink to="/auth/login" class="btn-secondary border-brand-200 bg-white text-brand-700 hover:bg-orange-50">Demo login</RouterLink>
          </div>

          <div class="mt-10 grid max-w-xl grid-cols-3 gap-3">
            <div v-for="metric in metrics" :key="metric.label" class="rounded-lg border border-orange-100 bg-white/85 px-3 py-3 shadow-sm">
              <p class="text-lg font-bold text-slate-950">{{ metric.value }}</p>
              <p class="mt-1 text-xs text-slate-500">{{ metric.label }}</p>
            </div>
          </div>
        </div>

        <div class="relative min-h-[420px] overflow-hidden">
          <img :src="heroImage" alt="Fresh food prepared for delivery" class="absolute inset-0 h-full w-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-orange-950/62 via-orange-950/8 to-transparent lg:bg-gradient-to-r lg:from-orange-950/14 lg:via-transparent lg:to-transparent" />
          <div class="absolute inset-x-4 bottom-4 rounded-lg border border-white/40 bg-white/90 p-4 shadow-xl backdrop-blur sm:inset-x-8 sm:bottom-8">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Live workflow</p>
                <h2 class="mt-2 text-2xl font-bold text-slate-950">Order, prepare, dispatch, deliver</h2>
              </div>
              <span class="rounded-md bg-brand-500 px-3 py-1 text-sm font-bold text-white">27 min avg</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-3">
      <article v-for="value in values" :key="value.title" class="surface-card p-6 transition hover:-translate-y-0.5 hover:shadow-md">
        <div class="flex h-12 w-12 items-center justify-center rounded-lg" :class="value.iconTone">
          <component :is="value.icon" class="h-6 w-6" />
        </div>
        <h3 class="mt-5 text-xl font-bold text-slate-950">{{ value.title }}</h3>
        <p class="mt-2 text-sm leading-6 text-slate-600">{{ value.description }}</p>
      </article>
    </section>

    <SectionCard eyebrow="Platform" title="Made for the full delivery flow" description="Clean tools for each team.">
      <div class="grid gap-4 lg:grid-cols-4">
        <article v-for="item in highlights" :key="item.title" class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:bg-orange-50">
          <component :is="item.icon" class="h-7 w-7 text-brand-500" />
          <h3 class="mt-4 text-lg font-semibold text-slate-950">{{ item.title }}</h3>
          <p class="mt-2 text-sm leading-6 text-slate-600">{{ item.description }}</p>
        </article>
      </div>
    </SectionCard>

    <SectionCard eyebrow="Workflow" title="How orders move" description="Simple, visible, and easy to follow.">
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div v-for="(step, index) in workflow" :key="step.title" class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex items-center gap-3">
            <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-sm font-bold text-brand-600 ring-1 ring-orange-100">
              {{ index + 1 }}
            </span>
            <h3 class="text-lg font-semibold text-slate-950">{{ step.title }}</h3>
          </div>
          <p class="mt-4 text-sm leading-6 text-slate-600">{{ step.description }}</p>
        </div>
      </div>
    </SectionCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import SectionCard from '@/components/common/SectionCard.vue';
import { useRestaurantStore } from '@/stores/restaurant.store';
import { Bike, ChefHat, ShieldCheck, ShoppingCart, Store, Users, Zap } from 'lucide-vue-next';

const restaurantStore = useRestaurantStore();

const heroImage = computed(() => {
  const firstAvailableItem = restaurantStore.restaurants
    .flatMap((restaurant) => restaurant.menuCategories.flatMap((category) => category.items))
    .find((item) => item.available && item.image);

  return firstAvailableItem?.image ?? 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80';
});

const metrics = computed(() => [
  { label: 'Restaurants', value: restaurantStore.restaurants.length || 0 },
  { label: 'Avg delivery', value: '27 min' },
  { label: 'Live tracking', value: 'On' },
]);

const values = [
  {
    icon: Store,
    iconTone: 'bg-orange-50 text-brand-600 ring-1 ring-orange-100',
    title: 'Easy for customers',
    description: 'Browse restaurants, checkout faster, and track every order clearly.',
  },
  {
    icon: ChefHat,
    iconTone: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100',
    title: 'Useful for restaurants',
    description: 'Manage menus, availability, kitchen flow, and branch operations.',
  },
  {
    icon: Bike,
    iconTone: 'bg-sky-50 text-sky-600 ring-1 ring-sky-100',
    title: 'Ready for delivery',
    description: 'Assign riders, follow progress, and keep operations moving.',
  },
];

const highlights = [
  { icon: ShoppingCart, title: 'Smart cart', description: 'Single-restaurant ordering with clear totals.' },
  { icon: Zap, title: 'Live operations', description: 'Kitchen and dispatch status in one place.' },
  { icon: Users, title: 'Admin control', description: 'Roles, users, restaurants, and activity logs.' },
  { icon: ShieldCheck, title: 'Reliable access', description: 'Role-aware routes and protected workflows.' },
];

const workflow = [
  { title: 'Browse', description: 'Find restaurants, meals, and offers.' },
  { title: 'Order', description: 'Review the cart and place checkout.' },
  { title: 'Prepare', description: 'Kitchen accepts and updates progress.' },
  { title: 'Deliver', description: 'Rider handles pickup and delivery.' },
];

onMounted(() => {
  if (!restaurantStore.restaurants.length) {
    void restaurantStore.loadAll();
  }
});
</script>