<template>
  <div class="grid gap-6 xl:grid-cols-[1fr_340px]">
    <SectionCard eyebrow="Customer Cart" title="Review your items" description="Cart validation prevents mixing restaurants in the same checkout session.">
      <div v-if="cartStore.items.length" class="space-y-4">
        <div v-for="item in cartStore.items" :key="item.id" class="surface-muted flex flex-wrap items-center justify-between gap-4 p-4">
          <div>
            <p class="text-lg font-semibold text-slate-950">{{ item.name }}</p>
            <p class="text-sm text-slate-500">{{ item.restaurantName }}</p>
          </div>
          <div class="flex items-center gap-3">
            <button class="btn-secondary px-3 py-2" @click="cartStore.updateQuantity(item.id, item.quantity - 1)">-</button>
            <span class="min-w-8 text-center text-sm font-semibold">{{ item.quantity }}</span>
            <button class="btn-secondary px-3 py-2" @click="cartStore.updateQuantity(item.id, item.quantity + 1)">+</button>
          </div>
          <div class="flex items-center gap-4">
            <p class="text-base font-bold text-slate-950">${{ item.price * item.quantity }}</p>
            <button class="text-sm font-semibold text-rose-500" @click="cartStore.removeItem(item.id)">Remove</button>
          </div>
        </div>
      </div>
      <EmptyState v-else title="Your cart is empty" message="Browse a restaurant and add items to start a checkout flow." />
    </SectionCard>

    <CartSummary :subtotal="cartStore.subtotal" :delivery-fee="cartStore.deliveryFee" :discount="cartStore.discount" :total="cartStore.total">
      <RouterLink v-if="cartStore.items.length" to="/checkout" class="btn-primary mt-5 w-full">Proceed to checkout</RouterLink>
    </CartSummary>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import CartSummary from '@/components/customer/CartSummary.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import SectionCard from '@/components/common/SectionCard.vue';
import { useCartStore } from '@/stores/cart.store';

const cartStore = useCartStore();
</script>
