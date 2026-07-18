<template>
  <div class="mx-auto max-w-6xl">
    <div class="mb-8 flex items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-slate-900">Order Details</h1>
        <p class="mt-1 text-slate-500">#{{ order?.id || 'N/A' }}</p>
      </div>
      <button class="btn-primary px-6 py-3" :disabled="!order" @click="downloadInvoice">Download Invoice</button>
    </div>

    <div class="grid gap-8 lg:grid-cols-12">
      <div class="space-y-8 lg:col-span-8">
        <div class="rounded-xl border border-slate-100 bg-white p-6">
          <div class="grid grid-cols-2 gap-y-6 md:grid-cols-4">
            <div>
              <p class="text-xs uppercase tracking-widest text-slate-500">Order Number</p>
              <p class="mt-1 font-mono font-medium text-slate-900">{{ order?.id || 'N/A' }}</p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-widest text-slate-500">Placed On</p>
              <p class="mt-1 font-medium text-slate-900">{{ order ? formatDate(order.createdAt) : 'N/A' }}</p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-widest text-slate-500">Restaurant</p>
              <p class="mt-1 font-medium text-slate-900">{{ order?.restaurantName || 'N/A' }}</p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-widest text-slate-500">Status</p>
              <div class="mt-1">
                <StatusBadge :status="order?.status || 'pending'" />
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-slate-100 bg-white p-6">
          <h2 class="mb-6 font-semibold">Order Progress</h2>
          <OrderTimeline :timeline="order?.timeline || []" />
        </div>

        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div class="rounded-xl border border-slate-100 bg-white p-6">
            <p class="mb-3 font-semibold">Delivery Address</p>
            <p class="text-slate-600">{{ order?.deliveryAddress || 'No address available' }}</p>
          </div>
          <div class="rounded-xl border border-slate-100 bg-white p-6">
            <p class="mb-3 font-semibold">Assigned Rider</p>
            <p class="text-slate-600">{{ order?.riderName ?? 'Waiting for rider assignment' }}</p>
          </div>
        </div>
      </div>

      <div class="lg:col-span-4">
        <div class="rounded-xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-emerald-50 p-6 shadow-sm lg:sticky lg:top-6">
          <div class="mb-6 flex items-center justify-between gap-3">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Payment</p>
              <h3 class="mt-2 text-xl font-bold text-slate-950">Order Summary</h3>
            </div>
            <span class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm ring-1 ring-emerald-100">Paid</span>
          </div>

          <div class="space-y-3 text-sm">
            <div class="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <span class="text-slate-500">Payment</span>
              <span class="font-semibold text-slate-900">{{ order ? paymentLabel(order) : 'Not set' }}</span>
            </div>
            <div class="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <span class="text-slate-500">Subtotal</span>
              <span class="font-semibold text-slate-900">{{ formatCurrency(order?.subtotal ?? 0) }}</span>
            </div>
            <div class="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <span class="text-slate-500">Delivery Fee</span>
              <span class="font-semibold text-slate-900">{{ formatCurrency(order?.deliveryFee ?? 0) }}</span>
            </div>
            <div class="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
              <span class="text-emerald-700">Discount</span>
              <span class="font-semibold text-emerald-700">-{{ formatCurrency(order?.discount ?? 0) }}</span>
            </div>
          </div>

          <div class="my-5 border-t border-slate-200"></div>

          <div class="rounded-xl border border-brand-100 bg-white px-4 py-4 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="text-base font-semibold text-slate-900">Total</span>
              <span class="text-2xl font-bold text-brand-600">{{ formatCurrency(order?.total ?? 0) }}</span>
            </div>
          </div>

          <button class="btn-primary mt-6 w-full justify-center py-4" :disabled="!order" @click="receiptOpen = true">
            View Full Receipt
          </button>
        </div>
      </div>
    </div>

    <AppModal :open="receiptOpen" title="Order Receipt" description="Items, charges, and delivery." eyebrow="Receipt" size="lg" @close="receiptOpen = false">
      <div v-if="order" class="space-y-6">
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <p class="text-xs font-bold uppercase tracking-[0.24em] text-brand-500">Order</p>
            <p class="mt-2 text-lg font-semibold text-slate-900">{{ order.id }}</p>
            <p class="mt-1 text-sm text-slate-500">Placed {{ formatDateTime(order.createdAt) }}</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <p class="text-xs font-bold uppercase tracking-[0.24em] text-brand-500">Delivery</p>
            <p class="mt-2 text-lg font-semibold text-slate-900">{{ order.restaurantName }}</p>
            <p class="mt-1 text-sm text-slate-500">ETA {{ formatDateTime(order.estimatedDeliveryAt) }}</p>
          </div>
        </div>

        <div class="surface-card overflow-hidden">
          <div class="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
            <h4 class="font-semibold text-slate-900">Line Items</h4>
          </div>
          <div class="divide-y divide-slate-100 px-5">
            <div v-for="item in order.items" :key="item.id" class="flex items-center justify-between gap-4 py-4">
              <div>
                <p class="font-medium text-slate-900">{{ item.name }}</p>
                <p class="mt-1 text-sm text-slate-500">Qty {{ item.quantity }} x {{ formatCurrency(item.price) }}</p>
              </div>
              <p class="font-semibold text-slate-900">{{ formatCurrency(item.price * item.quantity) }}</p>
            </div>
          </div>
        </div>

        <div class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div class="rounded-xl border border-slate-200 bg-white p-5">
            <h4 class="font-semibold text-slate-900">Delivery Details</h4>
            <div class="mt-4 space-y-3 text-sm text-slate-600">
              <p><span class="font-semibold text-slate-900">Address:</span> {{ order.deliveryAddress }}</p>
              <p><span class="font-semibold text-slate-900">Rider:</span> {{ order.riderName ?? 'Waiting for rider assignment' }}</p>
              <p><span class="font-semibold text-slate-900">Status:</span> {{ formatStatus(order.status) }}</p>
            </div>
          </div>

          <div class="rounded-xl border border-slate-200 bg-white p-5">
            <h4 class="font-semibold text-slate-900">Payment Summary</h4>
            <div class="mt-4 space-y-3 text-sm text-slate-600">
              <div class="flex justify-between"><span>Payment</span><span>{{ paymentLabel(order) }}</span></div>
              <div class="flex justify-between"><span>Subtotal</span><span>{{ formatCurrency(order.subtotal) }}</span></div>
              <div class="flex justify-between"><span>Delivery Fee</span><span>{{ formatCurrency(order.deliveryFee) }}</span></div>
              <div class="flex justify-between"><span>Discount</span><span>-{{ formatCurrency(order.discount) }}</span></div>
              <div class="border-t border-slate-200 pt-3 text-base font-semibold text-slate-900 flex justify-between"><span>Total</span><span>{{ formatCurrency(order.total) }}</span></div>
            </div>
          </div>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import AppModal from '@/components/common/AppModal.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import OrderTimeline from '@/components/orders/OrderTimeline.vue';
import { useAuthStore } from '@/stores/auth.store';
import { useOrderStore } from '@/stores/order.store';
import type { Order } from '@/types';
import { createInvoicePdfBlob } from '@/utils/invoice-pdf';

const authStore = useAuthStore();
const orderStore = useOrderStore();
const route = useRoute();
const receiptOpen = ref(false);

const requestedOrderId = computed(() => (typeof route.query.orderId === 'string' ? route.query.orderId : null));

const order = computed(() => {
  if (requestedOrderId.value) {
    return orderStore.orders.find((entry) => entry.id === requestedOrderId.value) ?? null;
  }
  return orderStore.activeOrder ?? orderStore.orders[0] ?? null;
});

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

onMounted(() => {
  if (authStore.user) {
    orderStore.loadForCustomer(authStore.user.id);
  }
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value));
}

function formatStatus(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function paymentLabel(currentOrder: Order) {
  if (currentOrder.paymentSummary) {
    return currentOrder.paymentSummary;
  }

  switch (currentOrder.paymentMethod) {
    case 'visa_card':
    case 'card_mock':
      return 'Visa card';
    case 'bank_account':
    case 'wallet_mock':
      return 'Bank account';
    case 'paypal':
      return 'PayPal';
    case 'aba_payway':
      return 'ABA PayWay';
    case 'cash':
      return 'Cash on delivery';
    default:
      return 'Payment not set';
  }
}

function downloadInvoice() {
  if (!order.value) {
    return;
  }
  const blob = createInvoicePdfBlob(order.value, {
    currency: formatCurrency,
    dateTime: formatDateTime,
    payment: paymentLabel,
    status: formatStatus,
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${order.value.id}-invoice.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
</script>