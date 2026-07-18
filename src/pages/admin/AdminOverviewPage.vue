<template>
  <div class="space-y-6">
    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
      <StatCard title="Orders today" :value="analytics?.totalOrdersToday ?? 0" subtitle="Today" tone="+8%" />
      <StatCard title="Gross sales" :value="formatCurrency(analytics?.grossSalesToday ?? 0)" subtitle="Today" tone="+12%" />
      <StatCard title="Active riders" :value="analytics?.activeRiders ?? 0" subtitle="Available" tone="+4" />
      <StatCard title="Products live" :value="products.length" subtitle="Live catalog" tone="+catalog" />
      <StatCard title="Delayed orders" :value="urgentOrders.length" subtitle="Action needed" tone="-1" />
      <StatCard title="Audit events" :value="activityEventsToday" subtitle="Today" tone="+ops" />
    </section>

    <MultiSeriesAreaChart
      title="Platform performance"
      subtitle="Orders and revenue"
      :labels="hourLabels"
      :series="performanceSeries"
    />

    <section class="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <HorizontalGroupedBarChart
        title="Restaurant comparison"
        subtitle="Top partners"
        :labels="restaurantComparisonLabels"
        :series="restaurantComparisonSeries"
      />
      <DonutMetricChart
        title="Order status mix"
        subtitle="Current queue"
        center-label="Orders"
        :items="orderStatusItems"
      />
    </section>

    <section class="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <DonutMetricChart
        title="Zone load"
        subtitle="By service area"
        center-label="Load"
        :items="zoneLoadItems"
      />
      <HorizontalGroupedBarChart
        title="Fulfillment balance"
        subtitle="Demand vs kitchen"
        :labels="hourLabels.slice(0, fulfillmentSeriesLength)"
        :series="fulfillmentSeries"
      />
    </section>

    <section class="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <SectionCard eyebrow="Catalog" title="Latest products">
        <div class="space-y-4">
          <div v-for="product in products.slice(0, 4)" :key="product.item.id" class="rounded-lg border border-slate-200 bg-white p-4">
            <div class="flex items-center gap-4">
              <img :src="product.item.image" :alt="product.item.name" class="h-14 w-14 rounded-lg object-cover" />
              <div class="min-w-0 flex-1">
                <p class="text-base font-bold text-slate-950">{{ product.item.name }}</p>
                <p class="mt-1 truncate text-sm text-slate-500">{{ product.restaurantName }} - {{ product.categoryName }}</p>
              </div>
              <div class="text-right">
                <p class="text-base font-bold text-slate-950">{{ formatCurrency(product.item.price) }}</p>
                <span class="mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold" :class="product.item.available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'">
                  {{ product.item.available ? 'Available' : 'Paused' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard eyebrow="Operations" title="Live queue">
        <div class="space-y-4">
          <div v-for="order in queuedOrders" :key="order.id" class="rounded-lg border border-slate-200 bg-white p-4">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p class="text-xs uppercase tracking-[0.16em] text-slate-400">{{ order.id }}</p>
                <p class="mt-1 text-base font-bold text-slate-950">{{ order.restaurantName }}</p>
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

    <SectionCard eyebrow="Orders" title="Recent orders">
      <div class="space-y-4">
        <div v-for="order in orders.slice(0, 6)" :key="order.id" class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p class="text-sm text-slate-500">{{ order.id }}</p>
              <p class="mt-1 text-lg font-bold text-slate-950">{{ order.restaurantName }}</p>
              <p class="mt-2 text-sm text-slate-500">{{ order.deliveryAddress }}</p>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-right">
                <p class="text-base font-bold text-slate-950">{{ formatCurrency(order.total) }}</p>
                <p class="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">{{ formatShortDate(order.createdAt) }}</p>
              </div>
              <StatusBadge :status="order.status" />
            </div>
          </div>
        </div>
      </div>
    </SectionCard>

    <SectionCard eyebrow="Audit" title="Recent events">
      <template #actions>
        <RouterLink to="/admin/activity-log" class="btn-secondary">Open activity log</RouterLink>
      </template>

      <div class="space-y-4">
        <div v-for="entry in recentLogs" :key="entry.id" class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p class="text-xs font-bold uppercase tracking-[0.16em] text-brand-500">{{ titleCase(entry.domain) }} / {{ titleCase(entry.actorRole) }}</p>
              <p class="mt-1 text-base font-bold text-slate-950">{{ entry.title }}</p>
              <p class="mt-2 text-sm text-slate-600">{{ entry.description }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-slate-900">{{ formatPreciseDateTime(entry.createdAt) }}</p>
              <p class="mt-1 text-xs text-slate-500">{{ entry.restaurantName ?? 'Platform' }}</p>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import type { ActivityLogEntry, AdminProduct, AnalyticsSnapshot, Order } from '@/types';
import DonutMetricChart from '@/components/charts/DonutMetricChart.vue';
import HorizontalGroupedBarChart from '@/components/charts/HorizontalGroupedBarChart.vue';
import MultiSeriesAreaChart from '@/components/charts/MultiSeriesAreaChart.vue';
import SectionCard from '@/components/common/SectionCard.vue';
import StatCard from '@/components/common/StatCard.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { listActivityLogs } from '@/services/activity-log.service';
import { getAnalyticsSnapshot } from '@/services/analytics.service';
import { listAdminProducts } from '@/services/menu.service';
import { listOrders } from '@/services/order.service';
import { formatCurrency, formatPreciseDateTime, formatShortDate, titleCase } from '@/utils/format';

const analytics = ref<AnalyticsSnapshot | null>(null);
const orders = ref<Order[]>([]);
const products = ref<AdminProduct[]>([]);
const logs = ref<ActivityLogEntry[]>([]);
const hourLabels = ['09h', '10h', '11h', '12h', '13h', '14h', '15h', '16h'];

const urgentOrders = computed(() => orders.value.filter((order) => ['PLACED', 'PREPARING', 'READY_FOR_PICKUP', 'RIDER_ASSIGNED'].includes(order.status)));
const queuedOrders = computed(() => urgentOrders.value.slice(0, 4));
const revenueTrend = computed(() => (analytics.value?.hourlyOrders ?? []).map((value, index) => value * 140 + index * 220));
const performanceSeries = computed(() => [
  {
    name: 'Orders',
    values: analytics.value?.hourlyOrders ?? [],
    color: '#465fff',
    fillStart: '#465fff',
    fillEnd: '#e0e7ff',
  },
  {
    name: 'Revenue / 100',
    values: revenueTrend.value.map((value) => Math.round(value / 100)),
    color: '#9cb9ff',
    fillStart: '#9cb9ff',
    fillEnd: '#eff6ff',
  },
]);
const restaurantComparisonLabels = computed(() => (analytics.value?.topRestaurants ?? []).map((restaurant) => restaurant.name));
const restaurantComparisonSeries = computed(() => [
  {
    name: 'Orders',
    values: (analytics.value?.topRestaurants ?? []).map((restaurant) => restaurant.orders),
    color: '#465fff',
  },
  {
    name: 'Revenue / 500',
    values: (analytics.value?.topRestaurants ?? []).map((restaurant) => Math.round(restaurant.revenue / 500)),
    color: '#e4e7ec',
  },
]);
const fulfillmentSeriesLength = computed(() => Math.min((analytics.value?.hourlyOrders ?? []).length, 5));
const fulfillmentSeries = computed(() => {
  const demand = (analytics.value?.hourlyOrders ?? []).slice(0, fulfillmentSeriesLength.value);
  return [
    {
      name: 'Demand',
      values: demand,
      color: '#fd853a',
    },
    {
      name: 'Kitchen output',
      values: demand.map((value, index) => Math.max(value - (index % 2 === 0 ? 2 : -3), 1)),
      color: '#32d583',
    },
  ];
});
const zoneLoadItems = computed(() =>
  (analytics.value?.zoneLoad ?? []).map((item, index) => ({
    label: item.zone,
    value: item.value,
    color: ['#3641f5', '#7592ff', '#dde9ff', '#32d583'][index % 4],
  })),
);
const orderStatusItems = computed(() => {
  const colors = ['#9b8afb', '#fd853a', '#fdb022', '#32d583', '#465fff'];
  const counts = orders.value.reduce<Record<string, number>>((accumulator, order) => {
    accumulator[order.status] = (accumulator[order.status] ?? 0) + 1;
    return accumulator;
  }, {});

  return Object.entries(counts).map(([status, value], index) => ({
    label: titleCase(status),
    value,
    color: colors[index % colors.length],
  }));
});
const recentLogs = computed(() => logs.value.slice(0, 4));
const activityEventsToday = computed(() => {
  const today = new Date().toISOString().slice(0, 10);
  return logs.value.filter((entry) => entry.createdAt.startsWith(today)).length;
});

onMounted(async () => {
  analytics.value = await getAnalyticsSnapshot();
  orders.value = await listOrders();
  products.value = await listAdminProducts();
  logs.value = await listActivityLogs();
});
</script>
