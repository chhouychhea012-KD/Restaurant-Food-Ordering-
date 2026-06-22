<template>
  <div class="grid gap-6 xl:grid-cols-[1fr_340px]">
    <SectionCard eyebrow="Secure Checkout" title="Confirm address and place order" description="This checkout flow uses the authenticated customer profile and persists new orders into mock storage for tracking across customer, kitchen, admin, and rider pages.">
      <div class="grid gap-4 md:grid-cols-2">
        <div class="surface-muted p-5">
          <p class="text-sm font-semibold text-slate-900">Customer</p>
          <p class="mt-2 text-sm text-slate-600">{{ authStore.user?.name }}</p>
          <p class="text-sm text-slate-500">{{ authStore.user?.email }}</p>
        </div>
        <div class="surface-muted p-5">
          <p class="text-sm font-semibold text-slate-900">Delivery address</p>
          <p class="mt-2 text-sm text-slate-600">{{ defaultAddress?.line1 }}</p>
          <p class="text-sm text-slate-500">{{ defaultAddress?.district }}, {{ defaultAddress?.city }}</p>
        </div>
      </div>
      <div class="mt-6 rounded-[1.75rem] bg-slate-50 p-5">
        <p class="text-sm font-semibold text-slate-900">Security & validation</p>
        <ul class="mt-3 space-y-2 text-sm text-slate-600">
          <li>Authenticated route guard is active for this page.</li>
          <li>Single-restaurant cart validation is enforced before checkout.</li>
          <li>Delivery fee and promo discount are calculated before order placement.</li>
        </ul>
      </div>
      <button class="btn-primary mt-6 w-full sm:w-auto" :disabled="placing || !cartStore.items.length" @click="placeOrder">
        {{ placing ? 'Placing order...' : 'Place order' }}
      </button>
    </SectionCard>

    <CartSummary :subtotal="cartStore.subtotal" :delivery-fee="cartStore.deliveryFee" :discount="cartStore.discount" :total="cartStore.total" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import CartSummary from '@/components/customer/CartSummary.vue';
import SectionCard from '@/components/common/SectionCard.vue';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { useOrderStore } from '@/stores/order.store';

const authStore = useAuthStore();
const cartStore = useCartStore();
const orderStore = useOrderStore();
const router = useRouter();
const placing = ref(false);

const defaultAddress = computed(() => authStore.user?.addresses?.find((address) => address.isDefault) ?? authStore.user?.addresses?.[0]);

async function placeOrder() {
  if (!authStore.user || !defaultAddress.value || !cartStore.restaurantId || !cartStore.restaurantName) {
    return;
  }

  placing.value = true;
  const order = await orderStore.placeOrder({
    customerId: authStore.user.id,
    restaurantId: cartStore.restaurantId,
    restaurantName: cartStore.restaurantName,
    items: cartStore.items,
    subtotal: cartStore.subtotal,
    deliveryFee: cartStore.deliveryFee,
    discount: cartStore.discount,
    deliveryAddress: `${defaultAddress.value.line1}, ${defaultAddress.value.district}, ${defaultAddress.value.city}`,
  });
  cartStore.clearCart();
  placing.value = false;
  router.push({ name: 'track-order', query: { orderId: order.id } });
}
</script>
