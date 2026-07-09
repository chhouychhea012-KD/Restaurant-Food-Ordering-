<template>
  <div class="space-y-16">
    <!-- Hero Section -->
    <section class="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-orange-600 px-6 py-16 text-white shadow-2xl sm:px-10 sm:py-20">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent)]" />

      <div class="relative max-w-5xl mx-auto grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <div class="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2 text-sm font-medium">
            <Utensils class="h-5 w-5" />
            Flavor Fleet
          </div>

          <h1 class="mt-6 text-5xl font-extrabold leading-tight sm:text-5xl">
            Food ordering made simple,<br>for everyone
          </h1>

          <p class="mt-6 max-w-lg text-lg text-slate-200">
            A complete platform connecting customers, restaurants, and delivery teams in one seamless experience.
          </p>

          <div class="mt-8 flex flex-wrap gap-4">
            <RouterLink 
              to="/restaurants" 
              class="btn-primary bg-white text-slate-900 hover:bg-orange-50 flex items-center gap-3 px-8 py-4 text-base font-semibold"
            >
              <Store class="h-5 w-5" />
              Explore Restaurants
            </RouterLink>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <div class="rounded-xl bg-white/10 p-6 backdrop-blur border border-white/10">
            <Zap class="h-9 w-9 text-orange-300" />
            <p class="mt-5 text-3xl font-bold">Fast</p>
            <p class="text-sm text-slate-200 mt-1">Browse • Order • Track</p>
          </div>
          <div class="rounded-xl bg-white/10 p-6 backdrop-blur border border-white/10">
            <Users class="h-9 w-9 text-blue-300" />
            <p class="mt-5 text-3xl font-bold">Connected</p>
            <p class="text-sm text-slate-200 mt-1">All teams in one system</p>
          </div>
          <div class="rounded-xl bg-white/10 p-6 backdrop-blur border border-white/10">
            <Target class="h-9 w-9 text-emerald-300" />
            <p class="mt-5 text-3xl font-bold">Reliable</p>
            <p class="text-sm text-slate-200 mt-1">End-to-end delivery</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Core Values -->
    <section class="grid gap-6 md:grid-cols-3">
      <div class="surface-card rounded-xl p-8 hover:shadow-lg transition group">
        <div class="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center">
          <Store class="h-8 w-8 text-orange-600" />
        </div>
        <h3 class="mt-6 text-2xl font-bold text-slate-900">For Customers</h3>
        <p class="mt-3 text-slate-600">
          Discover great food and enjoy a smooth, fast ordering experience.
        </p>
      </div>

      <div class="surface-card rounded-xl p-8 hover:shadow-lg transition group">
        <div class="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center">
          <ChefHat class="h-8 w-8 text-emerald-600" />
        </div>
        <h3 class="mt-6 text-2xl font-bold text-slate-900">For Restaurants</h3>
        <p class="mt-3 text-slate-600">
          Powerful tools to manage menus, orders, and kitchen operations.
        </p>
      </div>

      <div class="surface-card rounded-xl p-8 hover:shadow-lg transition group">
        <div class="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
          <Bike class="h-8 w-8 text-blue-600" />
        </div>
        <h3 class="mt-6 text-2xl font-bold text-slate-900">For Riders</h3>
        <p class="mt-3 text-slate-600">
          Efficient delivery management with live order tracking.
        </p>
      </div>
    </section>

    <!-- Key Features -->
    <SectionCard
      eyebrow="What We Offer"
      title="Key Features"
      description="Built to serve all sides of the food delivery ecosystem"
    >
      <div class="grid gap-6 lg:grid-cols-2">
        <article
          v-for="item in highlights"
          :key="item.title"
          class="rounded-xl border border-slate-100 bg-white p-8 hover:shadow-md transition"
        >
          <component :is="item.icon" class="h-10 w-10 text-brand-500" />
          <h3 class="mt-5 text-2xl font-semibold text-slate-900">{{ item.title }}</h3>
          <p class="mt-4 text-slate-600 leading-relaxed">{{ item.description }}</p>
        </article>
      </div>
    </SectionCard>

    <!-- How It Works -->
    <SectionCard
      eyebrow="How It Works"
      title="Simple 4-Step Process"
      description="From browsing to delivery"
    >
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="(step, index) in workflow"
          :key="step.title"
          class="rounded-xl bg-white border border-slate-100 p-8 text-center"
        >
          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-xl font-bold text-white shadow">
            {{ index + 1 }}
          </div>
          <h3 class="mt-6 text-xl font-semibold">{{ step.title }}</h3>
          <p class="mt-3 text-slate-600">{{ step.description }}</p>
        </div>
      </div>
    </SectionCard>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import SectionCard from '@/components/common/SectionCard.vue'

// Icons
import { 
  Utensils, 
  Store, 
  Zap, 
  Users, 
  Target, 
  ChefHat, 
  Bike,
  ShoppingCart 
} from 'lucide-vue-next'

type Highlight = {
  icon: any
  title: string
  description: string
}

type WorkflowStep = {
  title: string
  description: string
}

const highlights: Highlight[] = [
  { 
    icon: Store, 
    title: 'Restaurant Discovery', 
    description: 'Easy browsing with smart filters and beautiful restaurant pages.' 
  },
  { 
    icon: ShoppingCart, 
    title: 'Smart Ordering', 
    description: 'Single restaurant cart with smooth and secure checkout.' 
  },
  { 
    icon: Users, 
    title: 'Admin Control', 
    description: 'Full management of restaurants, orders, users, and analytics.' 
  },
  { 
    icon: Bike, 
    title: 'Fast Meal Delivery', 
    description: 'Real-time tracking and efficient rider management.' 
  },
]

const workflow: WorkflowStep[] = [
  { title: 'Browse', description: 'Discover restaurants and delicious meals.' },
  { title: 'Order', description: 'Add items and complete checkout.' },
  { title: 'Prepare', description: 'Kitchen receives and prepares the order.' },
  { title: 'Deliver', description: 'Rider delivers your food on time.' }
]
</script>