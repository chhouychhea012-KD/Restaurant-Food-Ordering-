<template>
  <div v-if="restaurant" class="space-y-6">
    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Orders today" :value="todayOrders.length" subtitle="Owned restaurant only" :tone="`${activeOrders.length} active`" />
      <StatCard title="Revenue" :value="formatCurrency(revenueTotal)" subtitle="All visible orders" :tone="`${formatCurrency(todayRevenue)} today`" />
      <StatCard title="Average ticket" :value="formatCurrency(averageTicket)" subtitle="Customer spend" :tone="`${orders.length} orders`" />
      <StatCard title="Notifications" :value="ownerUnreadCount" subtitle="New order changes" :tone="ownerUnreadCount ? 'Needs review' : 'Clear'" />
    </section>

    <div class="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
      <SectionCard eyebrow="Owner Dashboard" title="Order control" description="Live customer orders and operational signals for your restaurant.">
        <template #actions>
          <RouterLink class="btn-primary" to="/partner/orders">Open orders</RouterLink>
        </template>

        <div v-if="recentOrders.length" class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div class="thin-scrollbar overflow-x-auto">
            <table class="w-full min-w-[760px] text-left text-sm">
              <thead class="bg-slate-50 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                <tr>
                  <th class="px-5 py-4">Order</th>
                  <th class="px-5 py-4">Items</th>
                  <th class="px-5 py-4">Payment</th>
                  <th class="px-5 py-4">Status</th>
                  <th class="px-5 py-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="order in recentOrders" :key="order.id" class="transition hover:bg-orange-50/40">
                  <td class="px-5 py-4">
                    <p class="font-mono text-xs font-bold text-slate-900">{{ order.id }}</p>
                    <p class="mt-1 text-xs text-slate-500">{{ formatShortDate(order.createdAt) }}</p>
                  </td>
                  <td class="px-5 py-4">
                    <p class="font-semibold text-slate-950">{{ order.items.length }} item{{ order.items.length === 1 ? '' : 's' }}</p>
                    <p class="mt-1 max-w-56 truncate text-xs text-slate-500">{{ itemSummary(order) }}</p>
                  </td>
                  <td class="px-5 py-4"><span class="pill bg-slate-100 text-slate-700">{{ order.paymentSummary ?? 'Not set' }}</span></td>
                  <td class="px-5 py-4"><span class="pill" :class="statusClass(order.status)">{{ statusLabel(order.status) }}</span></td>
                  <td class="px-5 py-4 text-right font-bold text-slate-950">{{ formatCurrency(order.total) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <EmptyState v-else title="No customer orders yet" message="Orders from your restaurant will appear here after checkout." />
      </SectionCard>

      <SectionCard eyebrow="Notifications" title="Order alerts" description="New customer orders and workflow changes assigned to your restaurant.">
        <template #actions>
          <button class="btn-secondary" type="button" :disabled="!ownerUnreadCount" @click="markOwnerNotificationsRead">Mark read</button>
        </template>

        <div v-if="ownerNotifications.length" class="space-y-3">
          <article
            v-for="notification in ownerNotifications"
            :key="notification.id"
            class="rounded-lg border px-4 py-3"
            :class="isRead(notification) ? 'border-slate-200 bg-white' : 'border-orange-200 bg-orange-50/70'"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm font-semibold text-slate-950">{{ notification.title }}</p>
                <p class="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{{ notification.message }}</p>
              </div>
              <span class="pill shrink-0" :class="notificationTone(notification.kind)">{{ notification.kind }}</span>
            </div>
            <div class="mt-3 flex items-center justify-between gap-3">
              <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{{ formatShortDate(notification.createdAt) }}</p>
              <RouterLink v-if="notification.ctaTo" class="text-sm font-semibold text-brand-600 hover:text-brand-700" :to="notification.ctaTo" @click="markNotification(notification.id)">Open</RouterLink>
            </div>
          </article>
        </div>
        <EmptyState v-else title="No alerts" message="New order and status change alerts will appear here." />
      </SectionCard>
    </div>

    <section class="grid gap-6 xl:grid-cols-3">
      <SectionCard eyebrow="Report" title="Revenue summary" description="Simple owner report for the current restaurant.">
        <div class="space-y-3">
          <div v-for="metric in reportMetrics" :key="metric.label" class="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
            <span class="text-sm font-medium text-slate-500">{{ metric.label }}</span>
            <span class="font-bold text-slate-950">{{ metric.value }}</span>
          </div>
        </div>
      </SectionCard>

      <SectionCard eyebrow="Operations" title="Order mix" description="Current state of owned orders.">
        <div class="space-y-3">
          <div v-for="entry in statusBreakdown" :key="entry.status" class="rounded-lg border border-slate-200 bg-white p-4">
            <div class="flex items-center justify-between text-sm">
              <span class="font-semibold text-slate-800">{{ statusLabel(entry.status) }}</span>
              <span class="font-bold text-slate-950">{{ entry.count }}</span>
            </div>
            <div class="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div class="h-full rounded-full bg-brand-500" :style="{ width: `${entry.percent}%` }"></div>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard eyebrow="Activity" title="Recent changes" description="Audit entries linked to this restaurant.">
        <div v-if="recentLogs.length" class="space-y-3">
          <article v-for="log in recentLogs" :key="log.id" class="rounded-lg border border-slate-200 bg-white px-4 py-3">
            <p class="text-sm font-semibold text-slate-950">{{ log.title }}</p>
            <p class="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{{ log.description }}</p>
            <p class="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{{ formatShortDate(log.createdAt) }}</p>
          </article>
        </div>
        <EmptyState v-else title="No recent changes" message="Restaurant activity will appear after order or menu updates." />
      </SectionCard>
    </section>

    <SectionCard eyebrow="Owner Workspace" title="Restaurant profile" :description="restaurant.description || restaurant.cuisine.join(' • ')">
      <template #actions>
        <button class="btn-primary" type="button" @click="openEditModal">Edit restaurant</button>
      </template>

      <div class="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <img :src="restaurant.coverImage" :alt="restaurant.name" class="h-64 w-full rounded-lg object-cover" />
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="surface-muted p-5">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Cuisine tags</p>
            <div class="mt-3 flex flex-wrap gap-2">
              <span v-for="tag in restaurant.cuisine" :key="tag" class="pill bg-white text-slate-700">{{ tag }}</span>
            </div>
          </div>
          <div class="surface-muted p-5">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Commercial settings</p>
            <div class="mt-3 space-y-2 text-sm text-slate-700">
              <p>Delivery fee: {{ formatCurrency(restaurant.deliveryFee) }}</p>
              <p>ETA: {{ restaurant.deliveryTime }}</p>
              <p>Status: {{ restaurant.status }}</p>
              <p>Partner: {{ restaurant.partnerStatus }}</p>
            </div>
          </div>
        </div>
      </div>
      <p v-if="restaurant.suspensionReason" class="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">Suspension reason: {{ restaurant.suspensionReason }}</p>
    </SectionCard>

    <SectionCard eyebrow="Branch Operations" title="Branch roster" description="Locations, prep targets, minimums, and service state for this restaurant.">
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
        </article>
      </div>
    </SectionCard>

    <p v-if="message" class="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ message }}</p>
    <p v-if="error" class="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{{ error }}</p>
  </div>

  <EmptyState v-else title="No assigned restaurant" message="This owner account does not currently have a restaurant assignment." />

  <AppModal
    :open="isModalOpen"
    eyebrow="Owned Restaurant"
    title="Edit restaurant information"
    description="Updates apply only to your assigned restaurant and storefront profile."
    size="xl"
    @close="closeModal"
  >
    <form class="space-y-5" @submit.prevent="submitRestaurant">
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label class="field-label" for="owner-restaurant-name">Restaurant name</label>
          <input id="owner-restaurant-name" v-model="form.name" class="field-input" type="text" required />
        </div>
        <div>
          <label class="field-label" for="owner-cuisine">Cuisine tags</label>
          <input id="owner-cuisine" v-model="cuisineInput" class="field-input" type="text" placeholder="Thai, Asian, Rice Bowls" />
        </div>
      </div>

      <div>
        <label class="field-label" for="owner-description">Description</label>
        <textarea id="owner-description" v-model="form.description" class="field-input min-h-24" required />
      </div>

      <ImageUploadField
        v-model="form.coverImage"
        label="Restaurant cover image"
        help="Upload a storefront cover photo. JPG, PNG, or WebP. Max 3 MB."
        :preview-alt="form.name || 'Restaurant cover preview'"
        @error="error = $event"
      />

      <div class="grid gap-4 md:grid-cols-3">
        <div>
          <label class="field-label" for="owner-delivery-time">Delivery time</label>
          <input id="owner-delivery-time" v-model="form.deliveryTime" class="field-input" type="text" required />
        </div>
        <div>
          <label class="field-label" for="owner-delivery-fee">Delivery fee</label>
          <input id="owner-delivery-fee" v-model.number="form.deliveryFee" class="field-input" type="number" min="0" required />
        </div>
        <div>
          <label class="field-label" for="owner-status">Operational status</label>
          <select id="owner-status" v-model="form.status" class="field-input">
            <option value="Open">Open</option>
            <option value="Busy">Busy</option>
            <option value="Paused">Paused</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      <div class="rounded-xl border border-slate-200 p-5">
        <div class="mb-4 flex items-center justify-between gap-3">
          <div>
            <p class="font-semibold text-slate-900">Branches</p>
            <p class="text-sm text-slate-500">Add, update, pause, or remove branches for this restaurant.</p>
          </div>
          <button class="btn-secondary" type="button" @click="addBranchRow">Add branch</button>
        </div>

        <div class="space-y-4">
          <div v-for="(branch, index) in form.branches" :key="branch.id || index" class="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div class="grid gap-4 lg:grid-cols-4">
              <div>
                <label class="field-label">Branch name</label>
                <input v-model="branch.name" class="field-input bg-white" type="text" required />
              </div>
              <div>
                <label class="field-label">Zone</label>
                <input v-model="branch.zone" class="field-input bg-white" type="text" required />
              </div>
              <div>
                <label class="field-label">Phone</label>
                <input v-model="branch.phone" class="field-input bg-white" type="tel" />
              </div>
              <div>
                <label class="field-label">Status</label>
                <select v-model="branch.status" class="field-input bg-white">
                  <option value="open">Open</option>
                  <option value="paused">Paused</option>
                  <option value="closed">Closed</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
            <div class="mt-4 grid gap-4 lg:grid-cols-4">
              <div>
                <label class="field-label">Latitude</label>
                <input v-model.number="branch.lat" class="field-input bg-white" type="number" step="0.0001" />
              </div>
              <div>
                <label class="field-label">Longitude</label>
                <input v-model.number="branch.lng" class="field-input bg-white" type="number" step="0.0001" />
              </div>
              <div>
                <label class="field-label">Prep minutes</label>
                <input v-model.number="branch.averagePrepMinutes" class="field-input bg-white" type="number" min="1" />
              </div>
              <div>
                <label class="field-label">Minimum order</label>
                <input v-model.number="branch.minimumOrderAmount" class="field-input bg-white" type="number" min="0" />
              </div>
            </div>
            <div class="mt-4 flex justify-end">
              <button class="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50" type="button" :disabled="form.branches.length === 1" @click="removeBranchRow(index)">Remove branch</button>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap gap-3 pt-2">
        <button class="btn-primary" :disabled="saving">{{ saving ? 'Saving...' : 'Update restaurant' }}</button>
        <button class="btn-secondary" type="button" @click="closeModal">Cancel</button>
      </div>
    </form>
  </AppModal>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import type { ActivityLogEntry, AppNotification, Branch, Order, Restaurant, RestaurantInput } from '@/types';
import AppModal from '@/components/common/AppModal.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import SectionCard from '@/components/common/SectionCard.vue';
import StatCard from '@/components/common/StatCard.vue';
import ImageUploadField from '@/components/forms/ImageUploadField.vue';
import { listActivityLogs } from '@/services/activity-log.service';
import { listOrdersForRestaurant } from '@/services/order.service';
import { buildBranch, getRestaurantById, updateRestaurant } from '@/services/restaurant.service';
import { useAuthStore } from '@/stores/auth.store';
import { useNotificationStore } from '@/stores/notification.store';
import { getPrimaryRestaurantId } from '@/utils/access';
import { formatCurrency, formatShortDate, titleCase } from '@/utils/format';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const restaurant = ref<Restaurant | null>(null);
const orders = ref<Order[]>([]);
const activityLogs = ref<ActivityLogEntry[]>([]);
const isModalOpen = ref(false);
const saving = ref(false);
const message = ref('');
const error = ref('');
const cuisineInput = ref('');

const form = reactive<RestaurantInput>({
  name: '',
  cuisine: [],
  description: '',
  deliveryTime: '20-30 min',
  deliveryFee: 0,
  coverImage: '',
  status: 'Open',
  verified: false,
  partnerStatus: 'pending',
  suspensionReason: null,
  commissionRate: 0.18,
  reviewCount: 0,
  heroColor: 'from-orange-500 to-amber-400',
  branches: [],
});

const activeStatuses = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'RIDER_ASSIGNED', 'PICKED_UP', 'ON_THE_WAY'];
const completedStatuses = ['DELIVERED', 'COMPLETED'];
const todayKey = new Date().toDateString();

const itemCount = computed(() => restaurant.value?.menuCategories.reduce((sum, category) => sum + category.items.length, 0) ?? 0);
const activeOrders = computed(() => orders.value.filter((order) => activeStatuses.includes(order.status)));
const completedOrders = computed(() => orders.value.filter((order) => completedStatuses.includes(order.status)));
const todayOrders = computed(() => orders.value.filter((order) => new Date(order.createdAt).toDateString() === todayKey));
const revenueTotal = computed(() => orders.value.reduce((sum, order) => sum + order.total, 0));
const todayRevenue = computed(() => todayOrders.value.reduce((sum, order) => sum + order.total, 0));
const averageTicket = computed(() => (orders.value.length ? Math.round(revenueTotal.value / orders.value.length) : 0));
const recentOrders = computed(() => [...orders.value].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()).slice(0, 5));
const recentLogs = computed(() => activityLogs.value.filter((log) => log.restaurantId === restaurant.value?.id).slice(0, 4));
const ownerNotifications = computed(() => notificationStore.items.filter((notification) => notification.kind === 'order').slice(0, 4));
const ownerUnreadCount = computed(() => ownerNotifications.value.filter((notification) => !isRead(notification)).length);
const commissionEstimate = computed(() => Math.round(revenueTotal.value * (restaurant.value?.commissionRate ?? 0)));

const reportMetrics = computed(() => [
  { label: 'Completed orders', value: String(completedOrders.value.length) },
  { label: 'Active orders', value: String(activeOrders.value.length) },
  { label: 'Today revenue', value: formatCurrency(todayRevenue.value) },
  { label: 'Platform commission', value: formatCurrency(commissionEstimate.value) },
  { label: 'Catalog items', value: String(itemCount.value) },
]);

const statusBreakdown = computed(() => {
  const counts = orders.value.reduce<Record<string, number>>((result, order) => {
    result[order.status] = (result[order.status] ?? 0) + 1;
    return result;
  }, {});

  return Object.entries(counts)
    .map(([status, count]) => ({
      status,
      count,
      percent: orders.value.length ? Math.max(8, Math.round((count / orders.value.length) * 100)) : 0,
    }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 5);
});

async function load() {
  const restaurantId = getPrimaryRestaurantId(authStore.user);
  restaurant.value = restaurantId ? await getRestaurantById(restaurantId) : null;
  orders.value = restaurantId ? await listOrdersForRestaurant(restaurantId) : [];
  activityLogs.value = await listActivityLogs();
  notificationStore.initialize(authStore.user);
}

onMounted(load);

watch(() => authStore.user, (user) => {
  notificationStore.syncUser(user);
  void load();
});

function itemSummary(order: Order) {
  return order.items.map((item) => `${item.quantity}x ${item.name}`).join(', ');
}

function statusLabel(status: string) {
  return titleCase(status);
}

function statusClass(status: string) {
  if (completedStatuses.includes(status)) return 'bg-emerald-100 text-emerald-700';
  if (['PLACED', 'ACCEPTED', 'PREPARING'].includes(status)) return 'bg-amber-100 text-amber-700';
  if (['CANCELLED', 'REJECTED', 'REFUNDED'].includes(status)) return 'bg-rose-100 text-rose-700';
  return 'bg-sky-100 text-sky-700';
}

function notificationTone(kind: string) {
  if (kind === 'order') return 'bg-brand-100 text-brand-700';
  if (kind === 'system') return 'bg-sky-100 text-sky-700';
  return 'bg-slate-100 text-slate-700';
}

function isRead(notification: AppNotification) {
  return Boolean(authStore.user && notification.readBy.includes(authStore.user.id));
}

function markNotification(notificationId: string) {
  if (authStore.user) {
    notificationStore.markRead(notificationId, authStore.user);
  }
}

function markOwnerNotificationsRead() {
  if (authStore.user) {
    notificationStore.markEverythingRead(authStore.user);
  }
}

function openEditModal() {
  if (!restaurant.value) {
    return;
  }
  cuisineInput.value = restaurant.value.cuisine.join(', ');
  Object.assign(form, {
    name: restaurant.value.name,
    cuisine: [...restaurant.value.cuisine],
    description: restaurant.value.description ?? '',
    deliveryTime: restaurant.value.deliveryTime,
    deliveryFee: restaurant.value.deliveryFee,
    coverImage: restaurant.value.coverImage,
    status: restaurant.value.status,
    verified: restaurant.value.verified,
    partnerStatus: restaurant.value.partnerStatus ?? 'pending',
    suspensionReason: restaurant.value.suspensionReason ?? null,
    commissionRate: restaurant.value.commissionRate ?? 0.18,
    reviewCount: restaurant.value.reviewCount ?? 0,
    heroColor: restaurant.value.heroColor,
    branches: restaurant.value.branches.map((branch) => ({ ...branch, operatingHours: branch.operatingHours?.map((entry) => ({ ...entry })), holidayClosures: branch.holidayClosures?.map((entry) => ({ ...entry })) })),
  });
  message.value = '';
  error.value = '';
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
}

function addBranchRow() {
  form.branches.push(buildBranch());
}

function removeBranchRow(index: number) {
  if (form.branches.length <= 1) {
    return;
  }
  form.branches.splice(index, 1);
}

function buildPayload(): RestaurantInput {
  const cuisine = cuisineInput.value.split(',').map((item) => item.trim()).filter(Boolean);
  const branches = form.branches.map((branch) => ({
    ...branch,
    name: branch.name.trim(),
    zone: branch.zone.trim(),
    phone: branch.phone?.trim() || '+66 800 000 000',
    lat: Number(branch.lat),
    lng: Number(branch.lng),
    averagePrepMinutes: Number(branch.averagePrepMinutes ?? 18),
    minimumOrderAmount: Number(branch.minimumOrderAmount ?? 150),
  })).filter((branch) => branch.name && branch.zone) as Branch[];

  if (!form.name.trim()) throw new Error('Please enter a restaurant name.');
  if (!form.description.trim()) throw new Error('Please enter a restaurant description.');
  if (!cuisine.length) throw new Error('Please provide at least one cuisine tag.');
  if (!form.coverImage.trim()) throw new Error('Please upload a restaurant cover image.');
  if (!branches.length) throw new Error('Please keep at least one branch.');

  return {
    ...form,
    name: form.name.trim(),
    cuisine,
    description: form.description.trim(),
    deliveryTime: form.deliveryTime.trim(),
    deliveryFee: Number(form.deliveryFee),
    coverImage: form.coverImage.trim(),
    branches,
  };
}

async function submitRestaurant() {
  if (!restaurant.value) {
    return;
  }

  saving.value = true;
  message.value = '';
  error.value = '';
  try {
    await updateRestaurant(restaurant.value.id, buildPayload());
    message.value = 'Restaurant updated successfully.';
    await load();
    closeModal();
  } catch (incoming) {
    error.value = incoming instanceof Error ? incoming.message : 'Unable to update restaurant.';
  } finally {
    saving.value = false;
  }
}
</script>