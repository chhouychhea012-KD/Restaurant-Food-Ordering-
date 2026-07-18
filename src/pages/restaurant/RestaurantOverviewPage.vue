<template>
  <div v-if="restaurant" class="space-y-6">
    <section class="grid gap-4 md:grid-cols-4">
      <StatCard title="Restaurant rating" :value="restaurant.rating.toFixed(1)" subtitle="Customer satisfaction snapshot" :tone="`${restaurant.reviewCount ?? 0} reviews`" />
      <StatCard title="Branch count" :value="restaurant.branches.length" subtitle="Visible from owner profile" tone="Live" />
      <StatCard title="Menu categories" :value="restaurant.menuCategories.length" subtitle="Editable through menu controls" :tone="`${itemCount} products`" />
      <StatCard title="Partner status" :value="restaurant.partnerStatus ?? 'pending'" subtitle="Verification and commercial standing" :tone="`${Math.round((restaurant.commissionRate ?? 0) * 100)}% commission`" />
    </section>

    <SectionCard eyebrow="Owner Workspace" title="Restaurant profile" :description="restaurant.description || restaurant.cuisine.join(' • ')">
      <div class="grid gap-4 lg:grid-cols-2">
        <div class="surface-muted p-5">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Cuisine tags</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <span v-for="tag in restaurant.cuisine" :key="tag" class="pill bg-white text-slate-700">{{ tag }}</span>
          </div>
        </div>
        <div class="surface-muted p-5">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Commercial settings</p>
          <div class="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
            <p>Delivery fee: {{ formatCurrency(restaurant.deliveryFee) }}</p>
            <p>ETA: {{ restaurant.deliveryTime }}</p>
            <p>Partner status: {{ restaurant.partnerStatus }}</p>
            <p>Commission: {{ Math.round((restaurant.commissionRate ?? 0) * 100) }}%</p>
          </div>
          <p v-if="restaurant.suspensionReason" class="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">Suspension reason: {{ restaurant.suspensionReason }}</p>
        </div>
      </div>
    </SectionCard>

    <SectionCard eyebrow="Branch Operations" title="Branch roster" description="Operating windows, prep targets, and branch readiness for the assigned restaurant.">
      <div class="grid gap-4 xl:grid-cols-2">
        <article v-for="branch in restaurant.branches" :key="branch.id" class="surface-muted p-5">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="text-lg font-semibold text-slate-950">{{ branch.name }}</p>
              <p class="mt-1 text-sm text-slate-500">{{ branch.zone }} • {{ branch.phone }}</p>
            </div>
            <span class="pill" :class="branch.status === 'open' ? 'bg-emerald-100 text-emerald-700' : branch.status === 'paused' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'">
              {{ branch.status }}
            </span>
          </div>

          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <div class="rounded-xl bg-white px-4 py-3 text-sm text-slate-700">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Prep target</p>
              <p class="mt-2 font-semibold text-slate-900">{{ branch.averagePrepMinutes }} min</p>
            </div>
            <div class="rounded-xl bg-white px-4 py-3 text-sm text-slate-700">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Minimum order</p>
              <p class="mt-2 font-semibold text-slate-900">{{ formatCurrency(branch.minimumOrderAmount ?? 0) }}</p>
            </div>
          </div>

          <div class="mt-4 rounded-xl bg-white px-4 py-3">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Operating hours</p>
            <div class="mt-3 grid gap-2 sm:grid-cols-2">
              <p v-for="entry in branch.operatingHours" :key="`${branch.id}-${entry.day}`" class="text-sm text-slate-700">
                {{ entry.label }}: {{ entry.closed ? 'Closed' : `${entry.open} - ${entry.close}` }}
              </p>
            </div>
          </div>

          <div class="mt-4 rounded-xl bg-white px-4 py-3">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Holiday closures</p>
            <div v-if="branch.holidayClosures?.length" class="mt-3 space-y-2">
              <p v-for="closure in branch.holidayClosures" :key="closure.id" class="text-sm text-slate-700">{{ closure.date }} — {{ closure.label }}</p>
            </div>
            <p v-else class="mt-3 text-sm text-slate-500">No holiday closures configured.</p>
          </div>
        </article>
      </div>
    </SectionCard>
  </div>

  <EmptyState v-else title="No assigned restaurant" message="This owner account does not currently have a restaurant assignment." />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { Restaurant } from '@/types';
import EmptyState from '@/components/common/EmptyState.vue';
import SectionCard from '@/components/common/SectionCard.vue';
import StatCard from '@/components/common/StatCard.vue';
import { getRestaurantById } from '@/services/restaurant.service';
import { useAuthStore } from '@/stores/auth.store';
import { getPrimaryRestaurantId } from '@/utils/access';
import { formatCurrency } from '@/utils/format';

const authStore = useAuthStore();
const restaurant = ref<Restaurant | null>(null);
const itemCount = computed(() => restaurant.value?.menuCategories.reduce((sum, category) => sum + category.items.length, 0) ?? 0);

onMounted(async () => {
  const restaurantId = getPrimaryRestaurantId(authStore.user);
  if (restaurantId) {
    restaurant.value = await getRestaurantById(restaurantId);
  }
});
</script>
