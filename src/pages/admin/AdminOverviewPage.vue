<template>
  <div class="space-y-6">
   
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
        value-prefix="$"
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
                <p class="mt-1 truncate text-sm text-slate-500">{{ product.restaurantName }} � {{ product.categoryName }}</p>
              </div>
              <div class="text-right">
                <p class="text-base font-bold text-slate-950">${{ product.item.price }}</p>
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
                <p class="text-base font-bold text-slate-950">${{ order.total }}</p>
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



