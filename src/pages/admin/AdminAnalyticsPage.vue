<template>
  <div class="space-y-6">
    <section class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <LineTrendChart
        title="Orders per Hour"
        subtitle="Peak lunch and dinner volume shown as a cleaner line-based chart"
        :values="analytics?.hourlyOrders ?? []"
        :labels="hourLabels"
      />
      <LineTrendChart
        title="Revenue Velocity"
        subtitle="Estimated revenue generated from hourly order demand"
        :values="revenueSeries"
        :labels="hourLabels"
        value-prefix="?"
        stroke-color="#14b8a6"
        fill-start="#2dd4bf"
        fill-end="#ecfeff"
      />
    </section>

    <SectionCard eyebrow="Network Analytics" title="Demand and zone load" description="This upgraded analytics workspace turns the frontend seed data into richer operational visuals for the admin team.">
      <div class="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div class="space-y-4">
          <div class="surface-muted p-5">
            <p class="text-lg font-bold text-slate-950">Hourly volume bars</p>
            <p class="mt-2 text-sm text-slate-500">A denser chart treatment for quick peak-time scanning.</p>
            <div class="mt-6">
              <MiniBarChart label="Hourly Orders" :values="analytics?.hourlyOrders ?? []" />
            </div>
          </div>
          <div class="grid gap-4 md:grid-cols-3">
            <div class="rounded-xl border border-slate-200 bg-white/85 p-4">
              <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Peak hour</p>
              <p class="mt-2 text-2xl font-bold text-slate-950">{{ peakHourLabel }}</p>
              <p class="mt-2 text-sm text-slate-500">{{ peakHourValue }} orders</p>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white/85 p-4">
              <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Avg hourly volume</p>
              <p class="mt-2 text-2xl font-bold text-slate-950">{{ averageOrdersPerHour }}</p>
              <p class="mt-2 text-sm text-slate-500">Orders per tracked hour</p>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white/85 p-4">
              <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Revenue per hour</p>
              <p class="mt-2 text-2xl font-bold text-slate-950">{{ formatCurrency(Math.round((analytics?.grossSalesToday ?? 0) / hourLabels.length)) }}</p>
              <p class="mt-2 text-sm text-slate-500">Estimated blended pace</p>
            </div>
          </div>
        </div>

        <div class="surface-muted p-5">
          <p class="text-lg font-bold text-slate-950">Zone load distribution</p>
          <p class="mt-2 text-sm text-slate-500">Dispatch pressure by delivery area with proportional load bars.</p>
          <div class="mt-6">
            <DoughnutLegend :items="analytics?.zoneLoad ?? []" />
          </div>
        </div>
      </div>
    </SectionCard>

    <section class="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <SectionCard eyebrow="Top Performers" title="Restaurant revenue split">
        <div class="space-y-4">
          <div v-for="restaurant in analytics?.topRestaurants ?? []" :key="restaurant.name" class="rounded-xl border border-slate-200 bg-white/80 p-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-base font-bold text-slate-950">{{ restaurant.name }}</p>
                <p class="mt-1 text-sm text-slate-500">{{ restaurant.orders }} orders processed</p>
              </div>
              <div class="text-right">
                <p class="text-lg font-bold text-slate-950">{{ formatCurrency(restaurant.revenue) }}</p>
                <p class="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">Revenue share</p>
              </div>
            </div>
            <div class="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div class="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-teal-300" :style="{ width: `${restaurantRevenuePercent(restaurant.revenue)}%` }" />
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard eyebrow="Map View" title="Delivery zone preview" description="The map panel stays available for spatial context beside the upgraded chart set.">
        <DeliveryZoneMap />
      </SectionCard>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { AnalyticsSnapshot } from '@/types';
import DoughnutLegend from '@/components/charts/DoughnutLegend.vue';
import LineTrendChart from '@/components/charts/LineTrendChart.vue';
import MiniBarChart from '@/components/charts/MiniBarChart.vue';
import SectionCard from '@/components/common/SectionCard.vue';
import DeliveryZoneMap from '@/components/maps/DeliveryZoneMap.vue';
import { getAnalyticsSnapshot } from '@/services/analytics.service';
import { formatCurrency } from '@/utils/format';

const analytics = ref<AnalyticsSnapshot | null>(null);
const hourLabels = ['09h', '10h', '11h', '12h', '13h', '14h', '15h', '16h'];

const revenueSeries = computed(() => (analytics.value?.hourlyOrders ?? []).map((value, index) => value * 150 + index * 180));
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

function restaurantRevenuePercent(value: number) {
  if (!totalTopRestaurantRevenue.value) {
    return 0;
  }
  return (value / totalTopRestaurantRevenue.value) * 100;
}

onMounted(async () => {
  analytics.value = await getAnalyticsSnapshot();
});
</script>
