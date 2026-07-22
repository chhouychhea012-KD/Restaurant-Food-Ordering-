<template>
  <div class="space-y-6">
    <section class="surface-card overflow-hidden">
      <div class="border-b border-orange-100 bg-gradient-to-br from-orange-50 via-white to-emerald-50 p-6 sm:p-8">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.22em] text-brand-600">Kitchen Staff</p>
            <h1 class="mt-3 text-3xl font-extrabold text-slate-950">Kitchen Queue</h1>
            <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Review active restaurant orders, start preparation, and mark food ready for pickup.
            </p>
          </div>
          <RouterLink class="btn-secondary border-brand-200 bg-white text-brand-700 hover:bg-orange-50" to="/dashboard">
            Dashboard
          </RouterLink>
        </div>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-3">
      <StatCard title="Active orders" :value="orders.length" subtitle="Restaurant queue" tone="Live" />
      <StatCard title="Preparing" :value="preparingCount" subtitle="Currently in kitchen" tone="Now" />
      <StatCard title="Ready" :value="readyCount" subtitle="Waiting pickup" tone="Pickup" />
    </section>

    <SectionCard eyebrow="Orders" title="Preparation workflow" description="">
      <div v-if="orders.length" class="grid gap-5 lg:grid-cols-2">
        <article v-for="order in orders" :key="order.id" class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:bg-orange-50">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="text-sm text-slate-500">{{ order.id }}</p>
              <h2 class="mt-2 text-xl font-bold text-slate-950">{{ order.restaurantName }}</h2>
              <p class="mt-1 text-sm text-slate-500">{{ order.branchName ?? 'Kitchen branch' }}</p>
            </div>
            <StatusBadge :status="order.status" />
          </div>

          <div class="mt-5 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p v-for="item in order.items" :key="item.id">
              <span class="font-semibold text-slate-900">{{ item.quantity }}x</span> {{ item.name }}
            </p>
          </div>

          <div class="mt-5 flex flex-wrap gap-3">
            <button class="btn-secondary" type="button" @click="update(order.id, 'PREPARING', 'Kitchen started preparation')">
              Start preparing
            </button>
            <button class="btn-primary" type="button" @click="update(order.id, 'READY_FOR_PICKUP', 'Kitchen marked order ready')">
              Mark ready
            </button>
          </div>
        </article>
      </div>

      <div v-else class="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-10 text-center">
        <p class="text-lg font-semibold text-slate-900">No kitchen orders right now</p>
        <p class="mt-2 text-sm text-slate-500">New restaurant orders will appear here when they need preparation.</p>
      </div>
    </SectionCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import type { Order } from '@/types';
import SectionCard from '@/components/common/SectionCard.vue';
import StatCard from '@/components/common/StatCard.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { useAuthStore } from '@/stores/auth.store';
import { listOrdersForRestaurant, updateOrderStatus } from '@/services/order.service';

const authStore = useAuthStore();
const orders = ref<Order[]>([]);

const preparingCount = computed(() => orders.value.filter((order) => order.status === 'PREPARING').length);
const readyCount = computed(() => orders.value.filter((order) => order.status === 'READY_FOR_PICKUP').length);

async function load() {
  if (authStore.user?.restaurantId) {
    orders.value = await listOrdersForRestaurant(authStore.user.restaurantId);
  }
}

onMounted(load);

async function update(orderId: string, status: string, label: string) {
  await updateOrderStatus(orderId, status, label);
  await load();
}
</script>