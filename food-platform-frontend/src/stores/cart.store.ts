import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import type { CartItem } from '@/types';
import { readStorage, storageKeys, writeStorage } from '@/utils/storage';

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>(readStorage<CartItem[]>(storageKeys.cart, []));

  watch(
    items,
    (value) => {
      writeStorage(storageKeys.cart, value);
    },
    { deep: true },
  );

  const restaurantId = computed(() => items.value[0]?.restaurantId ?? null);
  const restaurantName = computed(() => items.value[0]?.restaurantName ?? null);
  const subtotal = computed(() => items.value.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const deliveryFee = computed(() => (items.value.length ? 29 : 0));
  const discount = computed(() => (subtotal.value >= 300 ? 30 : 0));
  const total = computed(() => subtotal.value + deliveryFee.value - discount.value);

  function addItem(item: CartItem) {
    if (restaurantId.value && restaurantId.value !== item.restaurantId) {
      throw new Error('You can only order from one restaurant per cart.');
    }

    const existing = items.value.find((entry) => entry.id === item.id);
    if (existing) {
      existing.quantity += item.quantity;
      return;
    }

    items.value.push(item);
  }

  function removeItem(itemId: string) {
    items.value = items.value.filter((item) => item.id !== itemId);
  }

  function updateQuantity(itemId: string, quantity: number) {
    const target = items.value.find((item) => item.id === itemId);
    if (!target) {
      return;
    }

    target.quantity = Math.max(1, quantity);
  }

  function clearCart() {
    items.value = [];
  }

  return {
    items,
    restaurantId,
    restaurantName,
    subtotal,
    deliveryFee,
    discount,
    total,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
});
