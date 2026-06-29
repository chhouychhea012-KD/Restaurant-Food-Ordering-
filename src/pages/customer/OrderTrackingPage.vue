<template>
  <div class="max-w-6xl mx-auto">
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-slate-900">Order Details</h1>
        <p class="text-slate-500 mt-1">#{{ order?.id || 'N/A' }}</p>
      </div>
      <button class="btn-primary px-6 py-3">Download Invoice</button>
    </div>

    <div class="grid gap-8 lg:grid-cols-12">
      <!-- Main Content -->
      <div class="lg:col-span-8 space-y-8">
        <!-- Order Header -->
        <div class="bg-white rounded-3xl p-6 border border-slate-100">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-y-6">
            <div>
              <p class="text-xs uppercase tracking-widest text-slate-500">Order Number</p>
              <p class="font-mono font-medium text-slate-900 mt-1">{{ order?.id || '—' }}</p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-widest text-slate-500">Placed On</p>
              <p class="font-medium text-slate-900 mt-1">{{ order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—' }}</p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-widest text-slate-500">Restaurant</p>
              <p class="font-medium text-slate-900 mt-1">{{ order?.restaurantName }}</p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-widest text-slate-500">Status</p>
              <div class="mt-1">
                <StatusBadge :status="order?.status || 'pending'" />
              </div>
            </div>
          </div>
        </div>

        <!-- Order Tracking -->
        <div class="bg-white rounded-3xl p-6 border border-slate-100">
          <h2 class="font-semibold mb-6">Order Progress</h2>
          <OrderTimeline :timeline="order?.timeline || []" />
        </div>

        <!-- Delivery Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white rounded-3xl p-6 border border-slate-100">
            <p class="font-semibold mb-3">Delivery Address</p>
            <p class="text-slate-600">{{ order?.deliveryAddress || 'No address available' }}</p>
          </div>
          <div class="bg-white rounded-3xl p-6 border border-slate-100">
            <p class="font-semibold mb-3">Assigned Rider</p>
            <p class="text-slate-600">{{ order?.riderName ?? 'Waiting for rider assignment' }}</p>
          </div>
        </div>
      </div>

      <!-- Sticky Sidebar -->
      <div class="lg:col-span-4">
        <div class="bg-slate-900 text-white rounded-3xl p-6 lg:sticky lg:top-6">
          <h3 class="text-lg font-semibold mb-5">Order Summary</h3>
          
          <div class="space-y-4 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-400">Subtotal</span>
              <span>$ {{ order?.subtotal ?? 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Delivery Fee</span>
              <span>$ {{ order?.deliveryFee ?? 0 }}</span>
            </div>
          </div>

          <div class="border-t border-slate-700 my-6"></div>

          <div class="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>$ {{ order?.total ?? 0 }}</span>
          </div>

          <button class="w-full mt-8 bg-brand-500 hover:bg-brand-600 py-4 rounded-2xl font-semibold transition">
            View Full Receipt
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import StatusBadge from '@/components/common/StatusBadge.vue';
import OrderTimeline from '@/components/orders/OrderTimeline.vue';
import { useAuthStore } from '@/stores/auth.store';
import { useOrderStore } from '@/stores/order.store';

const authStore = useAuthStore();
const orderStore = useOrderStore();
const route = useRoute();

const requestedOrderId = computed(() => (typeof route.query.orderId === 'string' ? route.query.orderId : null));

const order = computed(() => {
  if (requestedOrderId.value) {
    return orderStore.orders.find((entry) => entry.id === requestedOrderId.value) ?? null;
  }
  return orderStore.activeOrder ?? orderStore.orders[0] ?? null;
});

onMounted(() => {
  if (authStore.user) {
    orderStore.loadForCustomer(authStore.user.id);
  }
});
</script>