<template>
  <div class="space-y-6">
    <SectionCard
      eyebrow="Operational Audit"
      title="Activity Log"
      description="Filter and export operational events."
    >
      <template #actions>
        <div class="flex flex-wrap gap-3">
          <button class="btn-secondary" type="button" @click="resetFilters">Reset filters</button>
          <button class="btn-primary" type="button" @click="exportLog">Export log</button>
        </div>
      </template>

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div class="surface-muted rounded-xl p-5">
          <p class="text-sm font-semibold text-slate-500">Visible events</p>
          <p class="mt-3 text-3xl font-bold text-slate-950">{{ filteredLogs.length }}</p>
          <p class="mt-2 text-sm text-slate-500">Current filtered audit stream</p>
        </div>
        <div class="surface-muted rounded-xl p-5">
          <p class="text-sm font-semibold text-slate-500">Traceable orders</p>
          <p class="mt-3 text-3xl font-bold text-slate-950">{{ tracedOrders }}</p>
          <p class="mt-2 text-sm text-slate-500">Orders with a dispute-ready paper trail</p>
        </div>
        <div class="surface-muted rounded-xl p-5">
          <p class="text-sm font-semibold text-slate-500">Dispatch SLA</p>
          <p class="mt-3 text-3xl font-bold text-slate-950">{{ dispatchSlaLabel }}</p>
          <p class="mt-2 text-sm text-slate-500">Average time to first dispatch event</p>
        </div>
        <div class="surface-muted rounded-xl p-5">
          <p class="text-sm font-semibold text-slate-500">Auth and access changes</p>
          <p class="mt-3 text-3xl font-bold text-slate-950">{{ authAndAccessEvents }}</p>
          <p class="mt-2 text-sm text-slate-500">Role, account, or schedule changes in scope</p>
        </div>
      </div>

      <div class="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-6">
        <div class="xl:col-span-1">
          <label class="field-label" for="activity-role">Role</label>
          <select id="activity-role" v-model="filters.role" class="field-input">
            <option value="all">All roles</option>
            <option v-for="role in roleOptions" :key="role" :value="role">{{ roleLabel(role) }}</option>
          </select>
        </div>
        <div class="xl:col-span-1">
          <label class="field-label" for="activity-domain">Event type</label>
          <select id="activity-domain" v-model="filters.domain" class="field-input">
            <option value="all">All events</option>
            <option v-for="domain in domainOptions" :key="domain" :value="domain">{{ domainLabel(domain) }}</option>
          </select>
        </div>
        <div class="xl:col-span-1">
          <label class="field-label" for="activity-restaurant">Restaurant</label>
          <select id="activity-restaurant" v-model="filters.restaurantId" class="field-input">
            <option value="all">All restaurants</option>
            <option v-for="restaurant in restaurants" :key="restaurant.id" :value="restaurant.id">{{ restaurant.name }}</option>
          </select>
        </div>
        <div class="xl:col-span-1">
          <label class="field-label" for="activity-date-from">From</label>
          <input id="activity-date-from" v-model="filters.dateFrom" class="field-input" type="date" />
        </div>
        <div class="xl:col-span-1">
          <label class="field-label" for="activity-date-to">To</label>
          <input id="activity-date-to" v-model="filters.dateTo" class="field-input" type="date" />
        </div>
        <div class="xl:col-span-1">
          <label class="field-label" for="activity-search">Search</label>
          <input id="activity-search" v-model="filters.query" class="field-input" type="search" placeholder="Order ID, actor, action" />
        </div>
      </div>

      <p v-if="message" class="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ message }}</p>

      <div v-if="filteredLogs.length" class="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="safe-table-wrap">
          <table class="w-full min-w-[920px] text-left text-sm">
            <thead class="bg-slate-50 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              <tr>
                <th class="px-5 py-4">Event</th>
                <th class="px-5 py-4">Type</th>
                <th class="px-5 py-4">Actor</th>
                <th class="px-5 py-4">Restaurant</th>
                <th class="px-5 py-4">Time</th>
                <th class="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="entry in filteredLogs" :key="entry.id" class="transition hover:bg-orange-50/40">
                <td class="px-5 py-4"><p class="font-bold text-slate-950">{{ entry.title }}</p><p class="mt-1 max-w-md truncate text-xs text-slate-500">{{ entry.action }}</p></td>
                <td class="px-5 py-4"><span class="pill bg-brand-50 text-brand-700">{{ domainLabel(entry.domain) }}</span></td>
                <td class="px-5 py-4"><p class="font-semibold text-slate-700">{{ entry.actorName }}</p><p class="mt-1 text-xs text-slate-500">{{ roleLabel(entry.actorRole) }}</p></td>
                <td class="px-5 py-4 text-slate-700">{{ entry.restaurantName ?? 'Platform' }}</td>
                <td class="px-5 py-4 text-slate-600">{{ formatPreciseDateTime(entry.createdAt) }}</td>
                <td class="px-5 py-4">
                  <div class="relative flex justify-end">
                    <button class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-900" type="button" @click.stop="toggleActionMenu(entry.id)"><MoreVertical :size="18" /></button>
                    <div v-if="openActionMenuLogId === entry.id" class="absolute right-0 top-11 z-30 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
                      <button class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50" type="button" @click="viewFromMenu(entry)"><Eye :size="15" /> View details</button>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <EmptyState v-else title="No activity matches the current filters" message="Try widening the date range or clearing one of the filters to rebuild the incident timeline." />
    </SectionCard>
  </div>

  <AppModal
    :open="Boolean(selectedEntry)"
    eyebrow="Audit Detail"
    title="Activity event detail"
    description="Actor, target, and metadata."
    size="lg"
    @close="selectedEntry = null"
  >
    <div v-if="selectedEntry" class="space-y-4 text-sm text-slate-700">
      <div class="grid gap-3 md:grid-cols-2">
        <div class="rounded-xl bg-slate-50 px-4 py-3">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Timestamp</p>
          <p class="mt-2 font-semibold text-slate-900">{{ formatPreciseDateTime(selectedEntry.createdAt) }}</p>
          <p class="mt-1 text-xs text-slate-500">{{ selectedEntry.createdAt }}</p>
        </div>
        <div class="rounded-xl bg-slate-50 px-4 py-3">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Action</p>
          <p class="mt-2 break-all font-mono text-xs text-slate-900">{{ selectedEntry.action }}</p>
        </div>
      </div>

      <div class="rounded-xl bg-slate-50 px-4 py-3">
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Description</p>
        <p class="mt-2 text-slate-900">{{ selectedEntry.description }}</p>
      </div>

      <div class="rounded-xl bg-slate-800 px-4 py-4 text-xs text-slate-100">
        <p class="font-semibold uppercase tracking-[0.18em] text-slate-400">Metadata JSON</p>
        <pre class="mt-3 overflow-auto whitespace-pre-wrap">{{ JSON.stringify(selectedEntry.metadata ?? {}, null, 2) }}</pre>
      </div>
    </div>
  </AppModal>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { Eye, MoreVertical } from 'lucide-vue-next';
import type { ActivityLogEntry, Restaurant } from '@/types';
import AppModal from '@/components/common/AppModal.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import SectionCard from '@/components/common/SectionCard.vue';
import { useSocket } from '@/composables/useSocket';
import { activityLogCreatedEvent, buildActivityLogCsv, filterActivityLogs, listActivityLogs } from '@/services/activity-log.service';
import { listRestaurants } from '@/services/restaurant.service';
import { formatPreciseDateTime, titleCase } from '@/utils/format';

const logs = ref<ActivityLogEntry[]>([]);
const restaurants = ref<Restaurant[]>([]);
const selectedEntry = ref<ActivityLogEntry | null>(null);
const message = ref('');
const openActionMenuLogId = ref<string | null>(null);
const filters = reactive({
  role: 'all',
  domain: 'all',
  restaurantId: 'all',
  dateFrom: '',
  dateTo: '',
  query: '',
});

function sortLogs(entries: ActivityLogEntry[]) {
  return [...entries].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

const filteredLogs = computed(() => filterActivityLogs(logs.value, filters));
const roleOptions = computed(() => [...new Set(logs.value.map((entry) => entry.actorRole))].sort());
const domainOptions = ['order', 'dispatch', 'menu', 'refund', 'restaurant', 'system', 'auth', 'access'];
const tracedOrders = computed(() => new Set(filteredLogs.value.map((entry) => entry.orderId).filter(Boolean)).size);
const authAndAccessEvents = computed(() => filteredLogs.value.filter((entry) => ['auth', 'access'].includes(entry.domain)).length);
const dispatchSlaMinutes = computed(() => {
  const orderMap = new Map<string, { startedAt?: number; dispatchedAt?: number }>();

  filteredLogs.value.forEach((entry) => {
    if (!entry.orderId) {
      return;
    }

    const eventTime = new Date(entry.createdAt).getTime();
    const snapshot = orderMap.get(entry.orderId) ?? {};

    snapshot.startedAt = snapshot.startedAt === undefined ? eventTime : Math.min(snapshot.startedAt, eventTime);

    if (entry.domain === 'dispatch') {
      snapshot.dispatchedAt = snapshot.dispatchedAt === undefined ? eventTime : Math.min(snapshot.dispatchedAt, eventTime);
    }

    orderMap.set(entry.orderId, snapshot);
  });

  const durations = [...orderMap.values()]
    .filter((entry) => entry.startedAt !== undefined && entry.dispatchedAt !== undefined && entry.dispatchedAt >= entry.startedAt)
    .map((entry) => ((entry.dispatchedAt ?? 0) - (entry.startedAt ?? 0)) / 60000);

  if (!durations.length) {
    return null;
  }

  return durations.reduce((total, value) => total + value, 0) / durations.length;
});
const dispatchSlaLabel = computed(() => (dispatchSlaMinutes.value === null ? 'No data' : `${dispatchSlaMinutes.value.toFixed(1)} min`));

useSocket(activityLogCreatedEvent, (payload) => {
  const entry = payload as ActivityLogEntry;
  logs.value = sortLogs([entry, ...logs.value.filter((existing) => existing.id !== entry.id)]);
});

onMounted(async () => {
  logs.value = await listActivityLogs();
  restaurants.value = await listRestaurants();
  window.addEventListener('click', closeActionMenu);
});

onBeforeUnmount(() => {
  window.removeEventListener('click', closeActionMenu);
});

function toggleActionMenu(logId: string) {
  openActionMenuLogId.value = openActionMenuLogId.value === logId ? null : logId;
}

function closeActionMenu() {
  openActionMenuLogId.value = null;
}

function viewFromMenu(entry: ActivityLogEntry) {
  closeActionMenu();
  selectedEntry.value = entry;
}
function roleLabel(value: string) {
  return value === 'system' ? 'System' : titleCase(value);
}

function domainLabel(value: string) {
  return titleCase(value);
}

function resetFilters() {
  filters.role = 'all';
  filters.domain = 'all';
  filters.restaurantId = 'all';
  filters.dateFrom = '';
  filters.dateTo = '';
  filters.query = '';
  message.value = '';
}

function exportLog() {
  if (!filteredLogs.value.length) {
    message.value = 'No log entries match the current filters.';
    return;
  }

  const csv = buildActivityLogCsv(filteredLogs.value);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `activity-log-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  message.value = `Exported ${filteredLogs.value.length} activity log entries.`;
}
</script>
