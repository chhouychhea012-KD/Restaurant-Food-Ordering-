<template>
  <div class="space-y-6">
    <section class="grid gap-4 md:grid-cols-4">
      <StatCard title="Owned orders" :value="orders.length" subtitle="Customer orders for this restaurant" tone="Scoped" />
      <StatCard title="Preparing" :value="preparingCount" subtitle="Kitchen active now" tone="Live" />
      <StatCard title="Delivered" :value="deliveredCount" subtitle="Completed customer orders" tone="Done" />
      <StatCard title="Revenue" :value="formatCurrency(revenueTotal)" subtitle="From visible orders" tone="Gross" />
    </section>

    <SectionCard eyebrow="Restaurant Orders" title="Customer order list" description="Only orders tied to your owned restaurant are visible here.">
      <div v-if="orders.length" class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="safe-table-wrap">
          <table class="w-full min-w-[920px] text-left text-sm">
            <thead class="bg-slate-50 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              <tr>
                <th class="px-5 py-4">Order</th>
                <th class="px-5 py-4">Customer Address</th>
                <th class="px-5 py-4">Items</th>
                <th class="px-5 py-4">Payment</th>
                <th class="px-5 py-4">Total</th>
                <th class="px-5 py-4">Status</th>
                <th class="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="order in orders" :key="order.id" class="transition hover:bg-orange-50/40">
                <td class="px-5 py-4">
                  <p class="font-mono text-xs font-bold text-slate-900">{{ order.id }}</p>
                  <p class="mt-1 text-xs text-slate-500">{{ formatPreciseDateTime(order.createdAt) }}</p>
                </td>
                <td class="px-5 py-4">
                  <p class="max-w-72 truncate font-semibold text-slate-800">{{ order.deliveryAddress }}</p>
                  <p class="mt-1 text-xs text-slate-500">ETA {{ formatPreciseDateTime(order.estimatedDeliveryAt) }}</p>
                </td>
                <td class="px-5 py-4">
                  <p class="font-bold text-slate-950">{{ order.items.length }} item{{ order.items.length === 1 ? '' : 's' }}</p>
                  <p class="mt-1 max-w-60 truncate text-xs text-slate-500">{{ itemSummary(order) }}</p>
                </td>
                <td class="px-5 py-4"><span class="pill bg-slate-100 text-slate-700">{{ paymentLabel(order) }}</span></td>
                <td class="px-5 py-4 font-bold text-slate-950">{{ formatCurrency(order.total) }}</td>
                <td class="px-5 py-4"><StatusBadge :status="order.status" /></td>
                <td class="px-5 py-4">
                  <div class="relative flex justify-end">
                    <button class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-900" type="button" @click.stop="toggleActionMenu(order.id)"><MoreVertical :size="18" /></button>
                    <div v-if="openActionMenuOrderId === order.id" class="absolute right-0 top-11 z-30 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
                      <button class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50" type="button" @click="editFromMenu(order.id)"><Pencil :size="15" /> Update</button>
                      <button class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50" type="button" :disabled="order.refundStatus === 'APPROVED'" @click="refundFromMenu(order.id)"><ReceiptText :size="15" /> {{ order.refundStatus === 'APPROVED' ? 'Refund approved' : 'Approve refund' }}</button>
                      <button class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50" type="button" @click="deleteFromMenu(order.id)"><Trash2 :size="15" /> Delete</button>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <EmptyState v-else title="No orders for this restaurant" message="Customer orders for your restaurant will appear here after checkout." />
      <p v-if="message" class="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ message }}</p>
      <p v-if="error" class="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{{ error }}</p>
    </SectionCard>
  </div>

  <AppModal
    :open="isModalOpen"
    eyebrow="Owned Order"
    title="Update order workflow"
    description="Restaurant owners can update status and delivery ETA for orders in their restaurant."
    size="md"
    @close="closeModal"
  >
    <form class="space-y-4" @submit.prevent="submitOrderUpdate">
      <div class="surface-muted p-5">
        <p class="text-sm font-semibold text-slate-900">Selected order</p>
        <p class="mt-2 font-mono text-sm text-slate-600">{{ selectedOrder?.id ?? 'No order selected' }}</p>
        <p class="mt-1 text-sm text-slate-500">{{ selectedOrder?.deliveryAddress ?? '' }}</p>
      </div>
      <div>
        <label class="field-label" for="owner-order-status">Status</label>
        <select id="owner-order-status" v-model="form.status" class="field-input">
          <option v-for="status in statuses" :key="status" :value="status">{{ statusLabel(status) }}</option>
        </select>
      </div>
      <div>
        <label class="field-label" for="owner-order-eta">Estimated delivery</label>
        <input id="owner-order-eta" v-model="form.estimatedDeliveryAt" class="field-input" type="datetime-local" />
      </div>
      <div class="flex flex-wrap gap-3 pt-2">
        <button class="btn-primary" :disabled="saving || !selectedOrder">{{ saving ? 'Saving...' : 'Update order' }}</button>
        <button class="btn-secondary" type="button" @click="closeModal">Cancel</button>
      </div>
    </form>
  </AppModal>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { MoreVertical, Pencil, ReceiptText, Trash2 } from 'lucide-vue-next';
import type { Order } from '@/types';
import AppModal from '@/components/common/AppModal.vue';
import { useAppDialog } from '@/composables/useAppDialog';
import EmptyState from '@/components/common/EmptyState.vue';
import SectionCard from '@/components/common/SectionCard.vue';
import StatCard from '@/components/common/StatCard.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { approveRefund, deleteOrder, listOrdersForRestaurant, updateOrder } from '@/services/order.service';
import { useAuthStore } from '@/stores/auth.store';
import { getPrimaryRestaurantId } from '@/utils/access';
import { formatCurrency, formatPreciseDateTime, titleCase } from '@/utils/format';

const { confirmDialog, promptDialog } = useAppDialog();
const authStore = useAuthStore();
const orders = ref<Order[]>([]);
const selectedOrderId = ref<string | null>(null);
const isModalOpen = ref(false);
const openActionMenuOrderId = ref<string | null>(null);
const saving = ref(false);
const message = ref('');
const error = ref('');
const statuses = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'RIDER_ASSIGNED', 'PICKED_UP', 'ON_THE_WAY', 'DELIVERED', 'COMPLETED', 'CANCELLED'];
const form = reactive({
  status: 'PLACED',
  estimatedDeliveryAt: '',
});

const selectedOrder = computed(() => orders.value.find((order) => order.id === selectedOrderId.value) ?? null);
const preparingCount = computed(() => orders.value.filter((order) => ['ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP'].includes(order.status)).length);
const deliveredCount = computed(() => orders.value.filter((order) => ['DELIVERED', 'COMPLETED'].includes(order.status)).length);
const revenueTotal = computed(() => orders.value.reduce((sum, order) => sum + order.total, 0));

async function load() {
  const restaurantId = getPrimaryRestaurantId(authStore.user);
  orders.value = restaurantId ? await listOrdersForRestaurant(restaurantId) : [];
}

onMounted(() => {
  void load();
  window.addEventListener('click', closeActionMenu);
});

onBeforeUnmount(() => {
  window.removeEventListener('click', closeActionMenu);
});

function toggleActionMenu(orderId: string) {
  openActionMenuOrderId.value = openActionMenuOrderId.value === orderId ? null : orderId;
}

function closeActionMenu() {
  openActionMenuOrderId.value = null;
}

function editFromMenu(orderId: string) {
  closeActionMenu();
  openEditModal(orderId);
}

function refundFromMenu(orderId: string) {
  closeActionMenu();
  void approveRefundRequest(orderId);
}

function deleteFromMenu(orderId: string) {
  closeActionMenu();
  void removeOrder(orderId);
}
function itemSummary(order: Order) {
  return order.items.map((item) => `${item.quantity}x ${item.name}`).join(', ');
}

function paymentLabel(order: Order) {
  if (order.paymentSummary) {
    return order.paymentSummary;
  }
  if (!order.paymentMethod) {
    return 'Not set';
  }
  return titleCase(order.paymentMethod.replace(/_/g, ' '));
}

function statusLabel(status: string) {
  return titleCase(status);
}

function toLocalDatetime(iso: string) {
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const normalized = new Date(date.getTime() - offset * 60000);
  return normalized.toISOString().slice(0, 16);
}

function openEditModal(orderId: string) {
  const order = orders.value.find((entry) => entry.id === orderId);
  if (!order) {
    return;
  }
  selectedOrderId.value = orderId;
  form.status = order.status;
  form.estimatedDeliveryAt = toLocalDatetime(order.estimatedDeliveryAt);
  message.value = '';
  error.value = '';
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
  selectedOrderId.value = null;
}

async function submitOrderUpdate() {
  if (!selectedOrder.value) {
    return;
  }

  saving.value = true;
  message.value = '';
  error.value = '';
  try {
    await updateOrder(selectedOrder.value.id, {
      status: form.status,
      riderName: selectedOrder.value.riderName,
      estimatedDeliveryAt: new Date(form.estimatedDeliveryAt).toISOString(),
    });
    message.value = 'Order updated.';
    await load();
    closeModal();
  } catch (incoming) {
    error.value = incoming instanceof Error ? incoming.message : 'Unable to update order.';
  } finally {
    saving.value = false;
  }
}

async function approveRefundRequest(orderId: string) {
  const order = orders.value.find((entry) => entry.id === orderId);
  if (!order || order.refundStatus === 'APPROVED') {
    return;
  }

  const reason = await promptDialog({
    title: 'Approve refund',
    message: 'Add an optional refund reason for the activity log.',
    inputLabel: 'Refund reason',
    inputValue: order.refundReason ?? 'Customer dispute resolved',
    confirmLabel: 'Approve refund',
    tone: 'success',
  });
  if (reason === null) {
    return;
  }

  try {
    await approveRefund(orderId, reason);
    message.value = `Refund approved for ${orderId}.`;
    error.value = '';
    await load();
  } catch (incoming) {
    error.value = incoming instanceof Error ? incoming.message : 'Unable to approve refund.';
  }
}

async function removeOrder(orderId: string) {
  const confirmed = await confirmDialog({
    title: 'Delete order',
    message: 'Delete this owned order from the frontend dataset?',
    confirmLabel: 'Delete order',
    tone: 'danger',
  });
  if (!confirmed) {
    return;
  }

  try {
    await deleteOrder(orderId);
    message.value = 'Order deleted.';
    error.value = '';
    await load();
    if (selectedOrderId.value === orderId) {
      closeModal();
    }
  } catch (incoming) {
    error.value = incoming instanceof Error ? incoming.message : 'Unable to delete order.';
  }
}
</script>