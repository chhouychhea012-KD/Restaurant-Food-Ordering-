<template>
  <SectionCard
    eyebrow="Orders"
    title="Order operations"
  >
    <div class="space-y-4">
      <div v-for="order in orders" :key="order.id" class="surface-muted p-4">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-sm text-slate-500">{{ order.id }}</p>
            <h3 class="text-lg font-bold text-slate-950">{{ order.restaurantName }}</h3>
            <p class="mt-1 text-sm text-slate-500">{{ order.deliveryAddress }}</p>
            <p class="mt-2 text-xs text-slate-500">Created {{ formatPreciseDateTime(order.createdAt) }}</p>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <StatusBadge :status="order.status" />
            <span class="pill bg-slate-100 text-slate-700">{{ order.riderName ?? 'No rider' }}</span>
            <span
              class="pill"
              :class="order.refundStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-50 text-amber-700'"
            >
              {{ order.refundStatus === 'APPROVED' ? 'Refund Approved' : 'Refund Pending' }}
            </span>
          </div>
        </div>

        <div class="mt-4 grid gap-3 md:grid-cols-3">
          <div class="rounded-xl bg-white/80 px-4 py-3">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Items</p>
            <p class="mt-2 text-sm font-semibold text-slate-900">{{ order.items.length }} line items</p>
          </div>
          <div class="rounded-xl bg-white/80 px-4 py-3">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">ETA</p>
            <p class="mt-2 text-sm font-semibold text-slate-900">{{ formatPreciseDateTime(order.estimatedDeliveryAt) }}</p>
          </div>
          <div class="rounded-xl bg-white/80 px-4 py-3">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Latest transition</p>
            <p class="mt-2 text-sm font-semibold text-slate-900">{{ statusLabel(order.timeline.at(-1)?.status ?? order.status) }}</p>
          </div>
        </div>

        <div class="mt-5 flex flex-wrap gap-3">
          <button class="btn-secondary px-3 py-2" type="button" @click="openEditModal(order.id)">Edit</button>
          <button
            class="btn-secondary px-3 py-2"
            type="button"
            :disabled="order.refundStatus === 'APPROVED'"
            @click="approveRefundRequest(order.id)"
          >
            {{ order.refundStatus === 'APPROVED' ? 'Refund approved' : 'Approve refund' }}
          </button>
          <button
            class="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
            type="button"
            @click="removeOrder(order.id)"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <p v-if="message" class="mt-5 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ message }}</p>
    <p v-if="error" class="mt-5 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600">{{ error }}</p>
  </SectionCard>

  <AppModal
    :open="isModalOpen"
    eyebrow="Order Control"
    title="Edit order details"
    description="Update rider, ETA, and status."
    size="md"
    @close="closeModal"
  >
    <form class="space-y-4" @submit.prevent="submitOrderUpdate">
      <div class="surface-muted p-5">
        <p class="text-sm font-semibold text-slate-900">Selected order</p>
        <p class="mt-2 text-sm text-slate-600">{{ selectedOrder?.id ?? 'Choose an order from the list' }}</p>
        <p class="text-sm text-slate-500">{{ selectedOrder?.restaurantName ?? 'No order selected' }}</p>
      </div>
      <div>
        <label class="field-label" for="order-status">Status</label>
        <select id="order-status" v-model="form.status" class="field-input">
          <option v-for="status in statuses" :key="status" :value="status">{{ statusLabel(status) }}</option>
        </select>
      </div>
      <div>
        <label class="field-label" for="rider-name">Rider</label>
        <select id="rider-name" v-model="form.riderName" class="field-input">
          <option value="">Unassigned</option>
          <option v-for="rider in riders" :key="rider.id" :value="rider.name">{{ rider.name }}</option>
        </select>
      </div>
      <div>
        <label class="field-label" for="eta">Estimated delivery</label>
        <input id="eta" v-model="form.estimatedDeliveryAt" class="field-input" type="datetime-local" />
      </div>
      <div class="flex flex-wrap gap-3 pt-2">
        <button class="btn-primary" :disabled="saving || !selectedOrder">{{ saving ? 'Saving...' : 'Update order' }}</button>
        <button class="btn-secondary" type="button" @click="closeModal">Cancel</button>
      </div>
    </form>
  </AppModal>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import type { Order, User } from '@/types';
import AppModal from '@/components/common/AppModal.vue';
import SectionCard from '@/components/common/SectionCard.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { approveRefund, deleteOrder, listOrders, updateOrder } from '@/services/order.service';
import { listUsers } from '@/services/user.service';
import { formatPreciseDateTime, titleCase } from '@/utils/format';

const orders = ref<Order[]>([]);
const riders = ref<User[]>([]);
const selectedOrderId = ref<string | null>(null);
const saving = ref(false);
const message = ref('');
const error = ref('');
const isModalOpen = ref(false);

const statuses = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'RIDER_ASSIGNED', 'PICKED_UP', 'ON_THE_WAY', 'DELIVERED', 'COMPLETED', 'CANCELLED'];
const form = reactive({
  status: 'PLACED',
  riderName: '',
  estimatedDeliveryAt: '',
});

const selectedOrder = computed(() => orders.value.find((order) => order.id === selectedOrderId.value) ?? null);

async function load() {
  orders.value = await listOrders();
  riders.value = (await listUsers()).filter((user) => user.role === 'rider');
}

onMounted(load);

function statusLabel(status: string) {
  return titleCase(status);
}

function toLocalDatetime(iso: string) {
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const normalized = new Date(date.getTime() - offset * 60000);
  return normalized.toISOString().slice(0, 16);
}

function closeModal() {
  isModalOpen.value = false;
  selectedOrderId.value = null;
}

function openEditModal(orderId: string) {
  const order = orders.value.find((entry) => entry.id === orderId);
  if (!order) {
    return;
  }

  selectedOrderId.value = orderId;
  form.status = order.status;
  form.riderName = order.riderName ?? '';
  form.estimatedDeliveryAt = toLocalDatetime(order.estimatedDeliveryAt);
  message.value = '';
  error.value = '';
  isModalOpen.value = true;
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
      riderName: form.riderName || null,
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

  const reason = window.prompt('Optional refund reason for the activity log', order.refundReason ?? 'Customer dispute resolved');
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
  const confirmed = window.confirm('Delete this order from the frontend dataset?');
  if (!confirmed) {
    return;
  }

  await deleteOrder(orderId);
  message.value = 'Order deleted.';
  await load();
  if (selectedOrderId.value === orderId) {
    closeModal();
  }
}
</script>
