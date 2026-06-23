import { storeToRefs } from 'pinia';
import { useCartStore } from '@/stores/cart.store';

export function useCart() {
  const store = useCartStore();
  const { items, subtotal, deliveryFee, discount, total, restaurantId, restaurantName } = storeToRefs(store);

  return {
    items,
    subtotal,
    deliveryFee,
    discount,
    total,
    restaurantId,
    restaurantName,
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
  };
}
