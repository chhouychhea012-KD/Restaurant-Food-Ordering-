<template>
  <div class="space-y-6">
    <MultiSeriesAreaChart
      title="Line Chart"
      subtitle="Orders and estimated revenue across the current operating day"
      :labels="monthLabels"
      :series="lineChartSeries"
    />

    <section class="grid gap-6 xl:grid-cols-2">
      <DonutMetricChart
        title="Donut Pie Chart 1"
        subtitle="Service area demand share with hoverable slices"
        center-label="Zones"
        :items="zoneLoadItems"
      />
      <DonutMetricChart
        title="Donut Pie Chart 2"
        subtitle="Top restaurant revenue share with active slice details"
        center-label="Revenue"
        :items="restaurantRevenueItems"
        value-prefix="$"
      />
    </section>

    <HorizontalGroupedBarChart
      title="Horizontal Grouped Bar Chart"
      subtitle="Monthly order demand compared with estimated revenue velocity"
      :labels="barChartLabels"
      :series="groupedBarSeries"
    />

    <section class="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <HorizontalGroupedBarChart
        title="Restaurant Performance"
        subtitle="Top partners compared by order count and scaled revenue"
        :labels="restaurantComparisonLabels"
        :series="restaurantComparisonSeries"
      />

      <SectionCard eyebrow="Network Analytics" title="Peak-hour summary" description="Key operating metrics remain visible beside the new chart system.">
        <div class="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
          <div class="rounded-xl border border-slate-200 bg-white/85 p-4">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Peak hour</p>
            <p class="mt-2 text-2xl font-bold text-slate-950">{{ peakHourLabel }}</p>
            <p class="mt-2 text-sm text-slate-500">{{ peakHourValue }} orders</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-white/85 p-4">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Avg hourly volume</p>
            <p class="mt-2 text-2xl font-bold text-slate-950">{{ averageOrdersPerHour }}</p>
            <p class="mt-2 text-sm text-slate-500">Orders per tracked hour</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-white/85 p-4">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Revenue per hour</p>
            <p class="mt-2 text-2xl font-bold text-slate-950">{{ formatCurrency(Math.round((analytics?.grossSalesToday ?? 0) / hourLabels.length)) }}</p>
            <p class="mt-2 text-sm text-slate-500">Estimated blended pace</p>
          </div>
        </div>
      </SectionCard>
    </section>

    <section class="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <SectionCard eyebrow="Top Performers" title="Restaurant revenue split" description="Ranked partner contribution from today's completed order flow.">
        <template #actions>
          <span class="pill bg-brand-50 text-brand-700">{{ formatCurrency(totalTopRestaurantRevenue) }}</span>
        </template>

        <div class="space-y-3">
          <div
            v-for="(restaurant, index) in topRestaurantRows"
            :key="restaurant.name"
            class="group rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-100 hover:shadow-md"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex min-w-0 items-start gap-3">
                <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold" :class="performerRankClass(index)">
                  {{ index + 1 }}
                </span>
                <div class="min-w-0">
                  <p class="truncate text-base font-bold text-slate-950">{{ restaurant.name }}</p>
                  <div class="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                    <span class="pill bg-slate-100 text-slate-600">{{ restaurant.orders }} orders</span>
                    <span class="pill bg-emerald-50 text-emerald-700">{{ restaurant.share }}% share</span>
                  </div>
                </div>
              </div>
              <div class="shrink-0 text-right">
                <p class="text-lg font-bold text-slate-950">{{ formatCurrency(restaurant.revenue) }}</p>
                <p class="mt-1 text-xs text-slate-500">{{ formatCurrency(restaurant.averageOrderValue) }} avg</p>
              </div>
            </div>

            <div class="mt-4 grid grid-cols-[1fr_auto] items-center gap-3">
              <div class="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div class="h-full rounded-full bg-gradient-to-r from-brand-500 via-sky-400 to-emerald-400" :style="{ width: `${restaurant.share}%` }" />
              </div>
              <span class="min-w-10 text-right text-xs font-bold text-slate-500">{{ restaurant.share }}%</span>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard eyebrow="Map View" title="Delivery zone preview" description="Cleaner live dispatch coverage with active zones and branch context.">
        <DeliveryZoneMap />
      </SectionCard>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { AnalyticsSnapshot } from '@/types';
import DonutMetricChart from '@/components/charts/DonutMetricChart.vue';
import HorizontalGroupedBarChart from '@/components/charts/HorizontalGroupedBarChart.vue';
import MultiSeriesAreaChart from '@/components/charts/MultiSeriesAreaChart.vue';
import SectionCard from '@/components/common/SectionCard.vue';
import DeliveryZoneMap from '@/components/maps/DeliveryZoneMap.vue';
import { getAnalyticsSnapshot } from '@/services/analytics.service';
import { formatCurrency } from '@/utils/format';

const analytics = ref<AnalyticsSnapshot | null>(null);
const hourLabels = ['09h', '10h', '11h', '12h', '13h', '14h', '15h', '16h'];
const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const barChartLabels = monthLabels.slice(0, 5);

const revenueSeries = computed(() => (analytics.value?.hourlyOrders ?? []).map((value, index) => value * 150 + index * 180));
const lineChartSeries = computed(() => {
  const hourly = analytics.value?.hourlyOrders ?? [];
  const expandedOrders = monthLabels.map((_, index) => {
    const base = hourly[index % Math.max(hourly.length, 1)] ?? 0;
    return base * 8 + 70 + index * 4;
  });
  const expandedRevenue = monthLabels.map((_, index) => {
    const base = revenueSeries.value[index % Math.max(revenueSeries.value.length, 1)] ?? 0;
    return Math.round(base / 80) + 20 + index * 5;
  });

  return [
    {
      name: 'Orders',
      values: expandedOrders,
      color: '#465fff',
      fillStart: '#465fff',
      fillEnd: '#e0e7ff',
    },
    {
      name: 'Revenue / 80',
      values: expandedRevenue,
      color: '#8fb3ff',
      fillStart: '#8fb3ff',
      fillEnd: '#eff6ff',
    },
  ];
});
const groupedBarSeries = computed(() => {
  const orders = [620, 500, 480, 615, 620];
  const revenue = [350, 505, 395, 205, 350];
  return [
    { name: 'Category A', values: orders, color: '#465fff' },
    { name: 'Category B', values: revenue, color: '#e4e7ec' },
  ];
});
const zoneLoadItems = computed(() =>
  (analytics.value?.zoneLoad ?? []).map((item, index) => ({
    label: item.zone,
    value: item.value,
    color: ['#3641f5', '#7592ff', '#dde9ff', '#32d583'][index % 4],
  })),
);
const restaurantRevenueItems = computed(() =>
  (analytics.value?.topRestaurants ?? []).map((item, index) => ({
    label: item.name,
    value: item.revenue,
    color: ['#9b8afb', '#fd853a', '#fdb022', '#32d583'][index % 4],
  })),
);
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
const peakHourIndex = computed(() => {
  const values = analytics.value?.hourlyOrders ?? [];
  if (!values.length) {
    return 0;
  }
  return values.indexOf(Math.max(...values));
});
const peakHourLabel = computed(() => hourLabels[peakHourIndex.value] ?? '09h');
const peakHourValue = computed(() => analytics.value?.hourlyOrders?.[peakHourIndex.value] ?? 0);
const averageOrdersPerHour = computed(() => {
  const values = analytics.value?.hourlyOrders ?? [];
  if (!values.length) {
    return 0;
  }
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
});
const totalTopRestaurantRevenue = computed(() => (analytics.value?.topRestaurants ?? []).reduce((sum, item) => sum + item.revenue, 0));
const topRestaurantRows = computed(() =>
  (analytics.value?.topRestaurants ?? []).map((restaurant) => {
    const share = totalTopRestaurantRevenue.value ? Math.round((restaurant.revenue / totalTopRestaurantRevenue.value) * 100) : 0;

    return {
      ...restaurant,
      share,
      averageOrderValue: restaurant.orders ? Math.round(restaurant.revenue / restaurant.orders) : 0,
    };
  }),
);

function performerRankClass(index: number) {
  return ['bg-brand-100 text-brand-700', 'bg-sky-100 text-sky-700', 'bg-emerald-100 text-emerald-700'][index] ?? 'bg-slate-100 text-slate-700';
}

onMounted(async () => {
  analytics.value = await getAnalyticsSnapshot();
});
</script>