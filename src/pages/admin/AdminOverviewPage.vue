<template>
  <div class="space-y-6">
    <section class="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_55%,#ea580c_120%)] px-6 py-8 text-white shadow-[0_25px_80px_rgba(15,23,42,0.24)] sm:px-8">
      <div class="absolute -right-12 top-0 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div class="absolute bottom-0 left-1/3 h-28 w-28 rounded-full bg-orange-300/20 blur-2xl" />
      <div class="relative grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.35em] text-orange-200">Platform Command</p>
          <h1 class="mt-4 max-w-3xl text-4xl font-extrabold leading-tight">A sharper operational dashboard for live demand, revenue, catalog, and dispatch control.</h1>
          <p class="mt-4 max-w-2xl text-sm leading-7 text-slate-200">
            The admin overview now highlights service pressure, revenue motion, product catalog coverage, and fulfillment health with richer chart-driven UI built on the existing local analytics dataset.
          </p>
          <div class="mt-6 flex flex-wrap gap-3 text-sm">
            <span class="rounded-full border border-white/15 bg-white/10 px-4 py-2 font-semibold text-white/90">{{ analytics?.totalOrdersToday ?? 0 }} orders today</span>
            <span class="rounded-full border border-white/15 bg-white/10 px-4 py-2 font-semibold text-white/90">{{ analytics?.activeRiders ?? 0 }} active riders</span>
            <span class="rounded-full border border-white/15 bg-white/10 px-4 py-2 font-semibold text-white/90">{{ products.length }} products tracked</span>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-3 xl:grid-cols-1 xl:gap-3">
          <div class="rounded-[1.5rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p class="text-xs uppercase tracking-[0.2em] text-orange-100">Gross Sales</p>
            <p class="mt-2 text-3xl font-bold">{{ formatCurrency(analytics?.grossSalesToday ?? 0) }}</p>
            <p class="mt-2 text-sm text-slate-200">Daily GMV across all storefronts</p>
          </div>
          <div class="rounded-[1.5rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p class="text-xs uppercase tracking-[0.2em] text-orange-100">Delivery SLA</p>
            <p class="mt-2 text-3xl font-bold">{{ analytics?.avgDeliveryTime ?? 0 }} min</p>
            <p class="mt-2 text-sm text-slate-200">Average delivery completion time</p>
          </div>
          <div class="rounded-[1.5rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p class="text-xs uppercase tracking-[0.2em] text-orange-100">Catalog Live</p>
            <p class="mt-2 text-3xl font-bold">{{ activeProductCount }}</p>
            <p class="mt-2 text-sm text-slate-200">Products currently available</p>
          </div>
        </div>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <StatCard title="Orders today" :value="analytics?.totalOrdersToday ?? 0" subtitle="Platform-wide demand" tone="+8%" />
      <StatCard title="Gross sales" :value="formatCurrency(analytics?.grossSalesToday ?? 0)" subtitle="Revenue pulse today" tone="+12%" />
      <StatCard title="Active riders" :value="analytics?.activeRiders ?? 0" subtitle="Dispatchable network" tone="+4" />
      <StatCard title="Products live" :value="products.length" subtitle="Catalog items under admin control" tone="+catalog" />
      <StatCard title="Delayed orders" :value="urgentOrders.length" subtitle="Needs rapid action" tone="-1" />
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <LineTrendChart
        title="Demand Pulse"
        subtitle="Hourly platform order flow across the peak service window"
        :values="analytics?.hourlyOrders ?? []"
        :labels="hourLabels"
      />
      <LineTrendChart
        title="Revenue Momentum"
        subtitle="Estimated revenue progression derived from live order volume"
        :values="revenueTrend"
        :labels="hourLabels"
        value-prefix="?"
        stroke-color="#0ea5e9"
        fill-start="#38bdf8"
        fill-end="#eff6ff"
      />
    </section>

    <section class="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <SectionCard eyebrow="Catalog Snapshot" title="Latest admin product data" description="Product CRUD changes made in the admin product module show up here immediately.">
        <div class="space-y-4">
          <div v-for="product in products.slice(0, 4)" :key="product.item.id" class="rounded-[1.5rem] border border-slate-200 bg-white/80 p-4">
            <div class="flex items-center gap-4">
              <img :src="product.item.image" :alt="product.item.name" class="h-16 w-16 rounded-2xl object-cover" />
              <div class="min-w-0 flex-1">
                <p class="text-base font-bold text-slate-950">{{ product.item.name }}</p>
                <p class="mt-1 truncate text-sm text-slate-500">{{ product.restaurantName }} · {{ product.categoryName }}</p>
              </div>
              <div class="text-right">
                <p class="text-base font-bold text-slate-950">?{{ product.item.price }}</p>
                <span class="mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold" :class="product.item.available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'">
                  {{ product.item.available ? 'Available' : 'Paused' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard eyebrow="Operations Watch" title="Live order queue" description="Orders still in motion are surfaced here so admins can spot service friction quickly.">
        <div class="space-y-4">
          <div v-for="order in queuedOrders" :key="order.id" class="rounded-[1.5rem] border border-slate-200 bg-white/80 p-4">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p class="text-xs uppercase tracking-[0.2em] text-slate-400">{{ order.id }}</p>
                <p class="mt-2 text-lg font-bold text-slate-950">{{ order.restaurantName }}</p>
                <p class="mt-1 text-sm text-slate-500">{{ order.deliveryAddress }}</p>
              </div>
              <StatusBadge :status="order.status" />
            </div>
            <div class="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
              <span>{{ order.items.length }} items</span>
              <span>{{ order.riderName ?? 'Rider pending' }}</span>
              <span>{{ formatShortDate(order.createdAt) }}</span>
            </div>
          </div>
        </div>
      </SectionCard>
    </section>

    <SectionCard eyebrow="Recent Activity" title="Platform orders stream" description="A fuller recent orders list with richer spacing and fast status visibility.">
      <div class="space-y-4">
        <div v-for="order in orders.slice(0, 6)" :key="order.id" class="rounded-[1.75rem] border border-slate-200 bg-white/85 p-5 shadow-sm">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p class="text-sm text-slate-500">{{ order.id }}</p>
              <p class="mt-1 text-lg font-bold text-slate-950">{{ order.restaurantName }}</p>
              <p class="mt-2 text-sm text-slate-500">{{ order.deliveryAddress }}</p>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-right">
                <p class="text-base font-bold text-slate-950">?{{ order.total }}</p>
                <p class="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">{{ formatShortDate(order.createdAt) }}</p>
              </div>
              <StatusBadge :status="order.status" />
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { AdminProduct, AnalyticsSnapshot, Order } from '@/types';
import LineTrendChart from '@/components/charts/LineTrendChart.vue';
import SectionCard from '@/components/common/SectionCard.vue';
import StatCard from '@/components/common/StatCard.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { getAnalyticsSnapshot } from '@/services/analytics.service';
import { listAdminProducts } from '@/services/menu.service';
import { listOrders } from '@/services/order.service';
import { formatCurrency, formatShortDate } from '@/utils/format';

const analytics = ref<AnalyticsSnapshot | null>(null);
const orders = ref<Order[]>([]);
const products = ref<AdminProduct[]>([]);
const hourLabels = ['09h', '10h', '11h', '12h', '13h', '14h', '15h', '16h'];

const urgentOrders = computed(() => orders.value.filter((order) => ['PLACED', 'PREPARING', 'READY_FOR_PICKUP', 'RIDER_ASSIGNED'].includes(order.status)));
const queuedOrders = computed(() => urgentOrders.value.slice(0, 4));
const revenueTrend = computed(() => (analytics.value?.hourlyOrders ?? []).map((value, index) => value * 140 + index * 220));
const activeProductCount = computed(() => products.value.filter((product) => product.item.available).length);

onMounted(async () => {
  analytics.value = await getAnalyticsSnapshot();
  orders.value = await listOrders();
  products.value = await listAdminProducts();
});
</script>



