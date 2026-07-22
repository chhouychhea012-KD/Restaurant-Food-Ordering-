import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { Order } from '@/types';
import { createOrder, listOrders, listOrdersForCustomer, updateOrderStatus } from '@/services/order.service';

export const useOrderStore = defineStore('orders', () => {
  const orders = ref<Order[]>([]);
  const loading = ref(false);

  const activeOrder = computed(() => orders.value.find((order) => !['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(order.status)) ?? null);

  async function loadAll() {
    loading.value = true;
    orders.value = await listOrders();
    loading.value = false;
  }

  async function loadForCustomer(customerId: string) {
    loading.value = true;
    orders.value = await listOrdersForCustomer(customerId);
    loading.value = false;
  }

  async function placeOrder(payload: Parameters<typeof createOrder>[0]) {
    const order = await createOrder(payload);
    orders.value = [order, ...orders.value];
    return order;
  }

  async function changeStatus(orderId: string, status: string, label?: string) {
    const order = await updateOrderStatus(orderId, status, label);
    if (order) {
      orders.value = orders.value.map((entry) => (entry.id === order.id ? order : entry));
    }
    return order;
  }

  return {
    orders,
    loading,
    activeOrder,
    loadAll,
    loadForCustomer,
    placeOrder,
    changeStatus,
  };
});
