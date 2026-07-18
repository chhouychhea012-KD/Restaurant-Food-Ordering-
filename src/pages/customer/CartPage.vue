<template>
  <div v-if="!canUseCart" class="space-y-6">
    <EmptyState title="Customer cart only" message="Use a customer account to build a cart and checkout." />
  </div>

  <div v-else class="grid gap-6 xl:grid-cols-[1fr_340px]">
    <SectionCard eyebrow="Customer Cart" title="Review your items" >
      <template #actions>
        <button v-if="cartStore.items.length" class="btn-secondary" type="button" @click="showClearCartModal = true">Clear cart</button>
      </template>

      <div v-if="cartStore.items.length" class="space-y-5">
        <div class="grid gap-4 lg:grid-cols-2">
          <div class="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <p class="text-sm font-semibold text-slate-900">Ordering branch</p>
            <p class="mt-2 text-base font-bold text-slate-950">{{ cartStore.branchName }}</p>
            <p class="mt-1 text-sm text-slate-500">{{ restaurant?.name }}</p>
            <div class="mt-4 flex flex-wrap gap-2">
              <span class="pill bg-brand-100 text-brand-700">{{ branchAvailability.label }}</span>
              <span class="pill bg-white text-slate-700">Minimum {{ formatCurrency(cartStore.minimumOrderAmount) }}</span>
            </div>
            <p class="mt-4 text-sm text-slate-600">{{ branchAvailability.detail }}</p>
          </div>

          <div class="rounded-lg border border-slate-200 bg-white p-5">
            <p class="text-sm font-semibold text-slate-900">Checkout readiness</p>
            <div class="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
              <div class="h-full rounded-full bg-brand-500 transition-all" :style="{ width: `${minimumOrderProgress}%` }" />
            </div>
            <p class="mt-3 text-sm text-slate-600">
              <span v-if="cartStore.minimumOrderGap > 0">Add {{ formatCurrency(cartStore.minimumOrderGap) }} more to reach the branch minimum order amount.</span>
              <span v-else>Ready for checkout.</span>
            </p>
            <div v-if="defaultAddress" class="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Delivering to <span class="font-semibold text-slate-900">{{ defaultAddress.label }}</span>: {{ defaultAddress.line1 }}, {{ defaultAddress.district }}
            </div>
          </div>
        </div>

        <div v-if="cartWarnings.length" class="space-y-2">
          <div v-for="warning in cartWarnings" :key="warning" class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {{ warning }}
          </div>
        </div>

        <div v-for="item in cartStore.items" :key="item.id" class="surface-muted flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div class="space-y-2">
            <div>
              <p class="text-lg font-semibold text-slate-950">{{ item.name }}</p>
              <p class="text-sm text-slate-500">{{ item.restaurantName }} • {{ item.branchName }}</p>
            </div>
            <p v-if="item.modifiers?.length" class="text-sm text-slate-600">Modifiers: {{ item.modifiers.join(', ') }}</p>
            <p v-if="item.note" class="text-sm text-slate-600">Note: {{ item.note }}</p>
          </div>
          <div class="flex items-center gap-3">
            <button class="btn-secondary px-3 py-2" @click="cartStore.updateQuantity(item.id, item.quantity - 1)">-</button>
            <span class="min-w-8 text-center text-sm font-semibold">{{ item.quantity }}</span>
            <button class="btn-secondary px-3 py-2" @click="cartStore.updateQuantity(item.id, item.quantity + 1)">+</button>
          </div>
          <div class="flex items-center gap-4">
            <p class="text-base font-bold text-slate-950">{{ formatCurrency(item.price * item.quantity) }}</p>
            <button class="text-sm font-semibold text-rose-500" @click="cartStore.removeItem(item.id)">Remove</button>
          </div>
        </div>

        <div class="rounded-lg border border-slate-200 bg-white p-5">
          <div class="grid gap-4 lg:grid-cols-[1fr_auto]">
            <div>
              <label class="field-label" for="voucher-code">Voucher code</label>
              <input id="voucher-code" v-model="voucherInput" class="field-input" type="text" placeholder="FLAVOR10, FEAST25, or FREEDELIVERY" />
              <p class="mt-2 text-xs text-slate-500">Try FLAVOR10, FEAST25, or FREEDELIVERY.</p>
            </div>
            <div class="flex flex-wrap items-end gap-3">
              <button class="btn-primary" type="button" @click="applyVoucher">Apply voucher</button>
              <button v-if="cartStore.voucherCode" class="btn-secondary" type="button" @click="clearVoucher">Remove voucher</button>
            </div>
          </div>
          <p v-if="voucherMessage" class="mt-4 rounded-2xl px-4 py-3 text-sm" :class="voucherSuccess ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'">
            {{ voucherMessage }}
          </p>
        </div>
      </div>
      <EmptyState v-else title="Your cart is empty" message="Browse a restaurant and add items to start a checkout flow." />
    </SectionCard>

    <CartSummary :subtotal="cartStore.subtotal" :delivery-fee="cartStore.deliveryFee" :discount="cartStore.discount" :total="cartStore.total">
      <div class="mt-5 space-y-3 text-sm text-slate-600">
        <div class="flex justify-between"><span>Automatic campaign</span><span>-{{ formatCurrency(cartStore.campaignDiscount) }}</span></div>
        <div class="flex justify-between"><span>Voucher</span><span>-{{ formatCurrency(cartStore.voucherDiscount) }}</span></div>
      </div>
      <p v-if="checkoutMessage" class="mt-5 rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-700">{{ checkoutMessage }}</p>
      <RouterLink v-if="cartStore.items.length && authStore.isAuthenticated && canProceedToCheckout" to="/checkout" class="btn-primary mt-5 block w-full text-center">Proceed to checkout</RouterLink>
      <RouterLink v-else-if="cartStore.items.length && !authStore.isAuthenticated" to="/auth/login" class="btn-primary mt-5 block w-full text-center">Sign in to checkout</RouterLink>
      <button v-else class="btn-primary mt-5 w-full" disabled>Proceed to checkout</button>
    </CartSummary>
  </div>

  <AppModal
    :open="showClearCartModal"
    eyebrow="Cart Confirmation"
    title="Clear your current cart?"
    description="This removes all items and vouchers."
    size="md"
    @close="showClearCartModal = false"
  >
    <div class="space-y-4 text-sm text-slate-600">
      <p>Your current cart contains {{ cartStore.itemsCount }} item(s) from {{ cartStore.restaurantName }}.</p>
      <div class="flex flex-wrap gap-3 pt-2">
        <button class="btn-primary" type="button" @click="confirmClearCart">Clear cart</button>
        <button class="btn-secondary" type="button" @click="showClearCartModal = false">Keep items</button>
      </div>
    </div>
  </AppModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import AppModal from '@/components/common/AppModal.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import SectionCard from '@/components/common/SectionCard.vue';
import CartSummary from '@/components/customer/CartSummary.vue';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { getRestaurantById } from '@/services/restaurant.service';
import type { Restaurant } from '@/types';
import { formatCurrency } from '@/utils/format';
import { evaluateBranchAvailability, getBranchById } from '@/utils/ordering';

const authStore = useAuthStore();
const cartStore = useCartStore();
const restaurant = ref<Restaurant | null>(null);
const voucherInput = ref(cartStore.voucherCode ?? '');
const voucherMessage = ref('');
const voucherSuccess = ref(true);
const showClearCartModal = ref(false);

const canUseCart = computed(() => !authStore.isAuthenticated || authStore.hasPermission('orders.create'));
const defaultAddress = computed(() => authStore.user?.addresses?.find((address) => address.isDefault) ?? authStore.user?.addresses?.[0] ?? null);
const branch = computed(() => getBranchById(restaurant.value, cartStore.branchId));
const branchAvailability = computed(() => evaluateBranchAvailability(branch.value));
const minimumOrderProgress = computed(() => {
  if (!cartStore.minimumOrderAmount) {
    return 100;
  }

  return Math.max(8, Math.min(100, Math.round((cartStore.subtotal / cartStore.minimumOrderAmount) * 100)));
});
const menuItems = computed(() => new Map((restaurant.value?.menuCategories ?? []).flatMap((category) => category.items.map((item) => [item.id, item] as const))));
const cartWarnings = computed(() => {
  const warnings: string[] = [];

  if (cartStore.items.length && !branchAvailability.value.isOpen) {
    warnings.push(branchAvailability.value.detail);
  }

  for (const item of cartStore.items) {
    const currentItem = menuItems.value.get(item.menuItemId ?? item.id);
    if (!currentItem) {
      warnings.push(`${item.name} is no longer listed on the menu.`);
      continue;
    }
    if (!currentItem.available) {
      warnings.push(`${item.name} is currently unavailable and should be removed before checkout.`);
    }
  }

  return [...new Set(warnings)];
});
const canProceedToCheckout = computed(() => cartStore.canCheckout && branchAvailability.value.isOpen && cartWarnings.value.length === 0);
const checkoutMessage = computed(() => {
  if (!cartStore.items.length) {
    return 'Add items to start checkout.';
  }
  if (cartStore.minimumOrderGap > 0) {
    return `Checkout stays disabled until you add ${formatCurrency(cartStore.minimumOrderGap)} more.`;
  }
  if (!branchAvailability.value.isOpen) {
    return branchAvailability.value.detail;
  }
  if (cartWarnings.value.length) {
    return cartWarnings.value[0] ?? 'Resolve the cart warnings before checkout.';
  }
  return 'Ready to place after review.';
});

async function syncRestaurant() {
  restaurant.value = cartStore.restaurantId ? await getRestaurantById(cartStore.restaurantId) : null;
}

function applyVoucher() {
  const result = cartStore.applyVoucher(voucherInput.value);
  voucherSuccess.value = result.valid;
  voucherMessage.value = result.message;
  if (result.valid) {
    voucherInput.value = cartStore.voucherCode ?? '';
  }
}

function clearVoucher() {
  cartStore.clearVoucher();
  voucherInput.value = '';
  voucherSuccess.value = true;
  voucherMessage.value = 'Voucher removed from the cart.';
}

function confirmClearCart() {
  cartStore.clearCart();
  voucherInput.value = '';
  voucherMessage.value = '';
  showClearCartModal.value = false;
}

watch(() => cartStore.restaurantId, syncRestaurant, { immediate: true });
watch(() => cartStore.voucherCode, (value) => {
  voucherInput.value = value ?? '';
});
</script>
