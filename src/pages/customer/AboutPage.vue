<template>
  <div class="space-y-6">
    <section class="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#0f172a,#1e293b_52%,#ea580c)] px-6 py-10 text-white shadow-glow sm:px-10 sm:py-12">
      <div class="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.14),transparent_58%)] lg:block" />

      <div class="relative grid gap-8 xl:grid-cols-[1.25fr_0.85fr] xl:items-end">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.35em] text-orange-200 flex items-center gap-2">
            <Utensils class="w-4 h-4" />
            About Flavor Fleet
          </p>

          <h1 class="mt-4 max-w-4xl text-4xl font-extrabold leading-tight sm:text-5xl">
            Food ordering system for customers, restaurants & delivery teams
          </h1>

          <p class="mt-5 max-w-3xl text-sm leading-7 text-slate-200 sm:text-base">
            A simple platform that connects browsing, ordering, and delivery in one flow.
          </p>

          <div class="mt-7 flex flex-wrap gap-3">
            <RouterLink to="/restaurants" class="btn-primary bg-white text-slate-950 hover:bg-orange-100 flex items-center gap-2">
              <Store class="w-4 h-4" />
              Explore restaurants
            </RouterLink>

            <RouterLink to="/categories" class="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/20 flex items-center gap-2">
              <Grid class="w-4 h-4" />
              Browse categories
            </RouterLink>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">

          <div class="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
            <div class="flex items-center gap-2 text-white/80">
              <Zap class="h-4 w-4 text-orange-300" />
              <p class="text-xs font-semibold uppercase tracking-[0.18em]">Customer Experience</p>
            </div>
            <p class="mt-2 text-3xl font-bold">Fast</p>
            <p class="mt-2 text-sm leading-6 text-white/75">Browse, order, and track food easily.</p>
          </div>

          <div class="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
            <div class="flex items-center gap-2 text-white/80">
              <Workflow class="h-4 w-4 text-blue-300" />
              <p class="text-xs font-semibold uppercase tracking-[0.18em]">Operations</p>
            </div>
            <p class="mt-2 text-3xl font-bold">Connected</p>
            <p class="mt-2 text-sm leading-6 text-white/75">Restaurant, kitchen, rider, and admin system.</p>
          </div>

          <div class="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
            <div class="flex items-center gap-2 text-white/80">
              <Rocket class="h-4 w-4 text-green-300" />
              <p class="text-xs font-semibold uppercase tracking-[0.18em]">MVP Focus</p>
            </div>
            <p class="mt-2 text-3xl font-bold">Practical</p>
            <p class="mt-2 text-sm leading-6 text-white/75">Full CRUD + workflow simulation system.</p>
          </div>

        </div>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-3">

      <div class="surface-card p-5">
        <div class="flex items-center gap-2 text-brand-500">
          <Store class="w-4 h-4" />
          <p class="text-xs font-semibold uppercase tracking-[0.18em]">Our Product</p>
        </div>

        <h2 class="mt-3 text-2xl font-bold text-slate-950">One platform for ordering & operations</h2>
        <p class="mt-3 text-sm leading-7 text-slate-600">
          Food ordering, restaurant management, kitchen flow, rider delivery, and admin tools.
        </p>
      </div>

      <div class="surface-card p-5">
        <div class="flex items-center gap-2 text-brand-500">
          <Timer class="w-4 h-4" />
          <p class="text-xs font-semibold uppercase tracking-[0.18em]">Our Service</p>
        </div>

        <h2 class="mt-3 text-2xl font-bold text-slate-950">Fast ordering experience</h2>
        <p class="mt-3 text-sm leading-7 text-slate-600">
          Browse food, add to cart, and checkout in seconds.
        </p>
      </div>

      <div class="surface-card p-5">
        <div class="flex items-center gap-2 text-brand-500">
          <Target class="w-4 h-4" />
          <p class="text-xs font-semibold uppercase tracking-[0.18em]">Our Goal</p>
        </div>

        <h2 class="mt-3 text-2xl font-bold text-slate-950">End-to-end delivery flow</h2>
        <p class="mt-3 text-sm leading-7 text-slate-600">
          Every step is connected from order to delivery.
        </p>
      </div>

    </section>

    <SectionCard
      eyebrow="What We Offer"
      title="Key features"
      description="Main system features"
    >
      <div class="grid gap-4 lg:grid-cols-2">
        <article
          v-for="item in highlights"
          :key="item.title"
          class="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-sm"
        >
          <p class="text-xs font-bold uppercase tracking-[0.2em] text-brand-500">
            {{ item.eyebrow }}
          </p>

          <h3 class="mt-3 text-xl font-bold text-slate-950">
            {{ item.title }}
          </h3>

          <p class="mt-3 text-sm leading-7 text-slate-600">
            {{ item.description }}
          </p>
        </article>
      </div>
    </SectionCard>

    <SectionCard
      eyebrow="How It Works"
      title="Simple workflow"
      description="From browse to delivery"
    >
      <div class="grid gap-4 xl:grid-cols-4">
        <div
          v-for="(step, index) in workflow"
          :key="step.title"
          class="rounded-[1.75rem] border border-slate-200 bg-slate-50/85 p-5"
        >
          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500 text-sm font-bold text-white shadow-lg shadow-brand-200">
            {{ index + 1 }}
          </div>

          <h3 class="mt-4 text-lg font-bold text-slate-950">
            {{ step.title }}
          </h3>

          <p class="mt-3 text-sm leading-7 text-slate-600">
            {{ step.description }}
          </p>
        </div>
      </div>
    </SectionCard>

  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import SectionCard from '@/components/common/SectionCard.vue'

/* ICONS */
import {
  Utensils,
  Zap,
  Workflow,
  Rocket,
  Store,
  Timer,
  Target,
  Grid
} from 'lucide-vue-next'

type Highlight = {
  eyebrow: string
  title: string
  description: string
}

type Workflow = {
  title: string
  description: string
}

const highlights: Highlight[] = [
  { eyebrow: 'Discovery', title: 'Restaurant browsing', description: 'Find restaurants and food easily with categories.' },
  { eyebrow: 'Checkout', title: 'Single-cart system', description: 'One restaurant per order with smooth checkout.' },
  { eyebrow: 'Admin', title: 'Full system control', description: 'Manage restaurants, orders, and users.' },
  { eyebrow: 'Operations', title: 'Kitchen & delivery flow', description: 'Connect restaurant, kitchen, and riders.' },
]

const workflow: Workflow[] = [
  { title: 'Browse', description: 'Find restaurants and food.' },
  { title: 'Order', description: 'Add items and checkout.' },
  { title: 'Prepare', description: 'Kitchen prepares food.' },
  { title: 'Deliver', description: 'Rider delivers order.' }
]
</script>