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
              <p class="mt-1 font-mono font-medium text-slate-900">{{ order?.id || '—' }}</p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-widest text-slate-500">Placed On</p>
              <p class="mt-1 font-medium text-slate-900">{{ order ? formatDate(order.createdAt) : '—' }}</p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-widest text-slate-500">Restaurant</p>
              <p class="mt-1 font-medium text-slate-900">{{ order?.restaurantName || '—' }}</p>
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
        <div class="rounded-xl bg-slate-900 p-6 text-white lg:sticky lg:top-6">
          <h3 class="mb-5 text-lg font-semibold">Order Summary</h3>

          <div class="space-y-4 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-400">Subtotal</span>
              <span>{{ formatCurrency(order?.subtotal ?? 0) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Delivery Fee</span>
              <span>{{ formatCurrency(order?.deliveryFee ?? 0) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Discount</span>
              <span>-{{ formatCurrency(order?.discount ?? 0) }}</span>
            </div>
          </div>

          <div class="my-6 border-t border-slate-700"></div>

          <div class="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{{ formatCurrency(order?.total ?? 0) }}</span>
          </div>

          <button class="mt-8 w-full rounded-xl bg-brand-500 py-4 font-semibold transition hover:bg-brand-600" :disabled="!order" @click="receiptOpen = true">
            View Full Receipt
          </button>
        </div>
      </div>
    </div>

    <AppModal :open="receiptOpen" title="Order Receipt" description="Review the current order items, charges, and delivery details before downloading the invoice." eyebrow="Receipt" size="lg" @close="receiptOpen = false">
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
                <p class="mt-1 text-sm text-slate-500">Qty {{ item.quantity }} × {{ formatCurrency(item.price) }}</p>
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
import { RouterLink, useRoute } from 'vue-router';
import AppModal from '@/components/common/AppModal.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import OrderTimeline from '@/components/orders/OrderTimeline.vue';
import { useAuthStore } from '@/stores/auth.store';
import { useOrderStore } from '@/stores/order.store';
import type { Order } from '@/types';

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

function buildInvoiceDocument(currentOrder: Order) {
  const itemMarkup = currentOrder.items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;">${item.name}</td>
          <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;text-align:center;">${item.quantity}</td>
          <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;text-align:right;">${formatCurrency(item.price)}</td>
          <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;text-align:right;">${formatCurrency(item.price * item.quantity)}</td>
        </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${currentOrder.id}</title>
</head>
<body style="margin:0;padding:32px;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a;">
  <div style="max-width:860px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;box-shadow:0 24px 80px rgba(15,23,42,0.08);">
    <div style="padding:32px;background:linear-gradient(135deg,#fff7ed,#ffffff);border-bottom:1px solid #e2e8f0;">
      <div style="display:flex;justify-content:space-between;gap:24px;align-items:flex-start;">
        <div>
          <div style="font-size:12px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;color:#f97316;">Flavor Fleet Invoice</div>
          <h1 style="margin:12px 0 0;font-size:32px;line-height:1.1;">${currentOrder.restaurantName}</h1>
          <p style="margin:12px 0 0;color:#475569;">Order ${currentOrder.id} placed ${formatDateTime(currentOrder.createdAt)}</p>
        </div>
        <div style="text-align:right;">
          <div style="font-size:14px;color:#64748b;">Total</div>
          <div style="margin-top:6px;font-size:28px;font-weight:700;">${formatCurrency(currentOrder.total)}</div>
        </div>
      </div>
    </div>
    <div style="padding:32px;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:28px;">
        <div style="padding:18px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;">
          <div style="font-size:12px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;color:#f97316;">Delivery Address</div>
          <p style="margin:10px 0 0;color:#334155;line-height:1.6;">${currentOrder.deliveryAddress}</p>
        </div>
        <div style="padding:18px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;">
          <div style="font-size:12px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;color:#f97316;">Delivery Status</div>
          <p style="margin:10px 0 0;color:#334155;line-height:1.6;">${formatStatus(currentOrder.status)}${currentOrder.riderName ? ` with ${currentOrder.riderName}` : ''}</p>
        </div>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="text-align:left;color:#64748b;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;">
            <th style="padding:0 0 12px;">Item</th>
            <th style="padding:0 0 12px;text-align:center;">Qty</th>
            <th style="padding:0 0 12px;text-align:right;">Price</th>
            <th style="padding:0 0 12px;text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>${itemMarkup}</tbody>
      </table>
      <div style="margin-top:28px;margin-left:auto;max-width:320px;">
        <div style="display:flex;justify-content:space-between;padding:8px 0;color:#475569;"><span>Subtotal</span><span>${formatCurrency(currentOrder.subtotal)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;color:#475569;"><span>Delivery Fee</span><span>${formatCurrency(currentOrder.deliveryFee)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;color:#475569;"><span>Discount</span><span>-${formatCurrency(currentOrder.discount)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:14px 0 0;margin-top:8px;border-top:1px solid #e2e8f0;font-size:18px;font-weight:700;"><span>Total</span><span>${formatCurrency(currentOrder.total)}</span></div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function downloadInvoice() {
  if (!order.value) {
    return;
  }

  const invoiceHtml = buildInvoiceDocument(order.value);
  const blob = new Blob([invoiceHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${order.value.id}-invoice.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
</script>

