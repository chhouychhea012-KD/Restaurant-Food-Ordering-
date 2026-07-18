<template>
  <div class="grid gap-6 xl:grid-cols-[1fr_340px]">
    <SectionCard eyebrow="Secure Checkout" title="Confirm order details" >
      <div v-if="!cartStore.items.length" class="rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
        Your cart is empty.
      </div>

      <div v-else class="space-y-6">
        <div class="grid gap-4 md:grid-cols-2">
          <div class="surface-muted p-5">
            <p class="text-sm font-semibold text-slate-900">Customer</p>
            <p class="mt-2 text-sm text-slate-600">{{ authStore.user?.name }}</p>
            <p class="text-sm text-slate-500">{{ authStore.user?.email }}</p>
          </div>
          <div class="surface-muted p-5">
            <p class="text-sm font-semibold text-slate-900">Branch</p>
            <p class="mt-2 text-sm text-slate-600">{{ branch?.name }}</p>
            <p class="text-sm text-slate-500">{{ restaurant?.name }}</p>
            <p class="mt-3 text-sm text-slate-500">{{ branchAvailability.detail }}</p>
          </div>
        </div>

        <div>
          <label class="field-label" for="address-select">Delivery address</label>
          <select id="address-select" v-model="selectedAddressId" class="field-input">
            <option v-for="address in addresses" :key="address.id" :value="address.id">
              {{ address.label }} • {{ address.line1 }} • {{ address.district }}
            </option>
          </select>
        </div>

        <div>
          <label class="field-label" for="delivery-instructions">Delivery instructions</label>
          <textarea id="delivery-instructions" v-model="deliveryInstructions" class="field-input min-h-28" placeholder="Leave at lobby, call on arrival, no doorbell, and similar delivery notes." />
        </div>

        <div class="rounded-xl border border-slate-200 bg-white p-5">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p class="text-sm font-semibold text-slate-900">Payment method</p>
              <p class="mt-1 text-sm text-slate-500">Choose how the customer will pay for this demo order.</p>
            </div>
            <span class="pill bg-emerald-50 text-emerald-700">Mock secure payment</span>
          </div>

          <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <label v-for="option in paymentOptions" :key="option.value" class="rounded-xl border px-4 py-4 text-sm transition" :class="paymentMethod === option.value ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:bg-orange-50'">
              <input v-model="paymentMethod" class="sr-only" type="radio" name="payment-method" :value="option.value" />
              <span class="block text-base font-semibold">{{ option.label }}</span>
              <span class="mt-1 block text-xs leading-5 text-slate-500">{{ option.help }}</span>
            </label>
          </div>

          <div v-if="paymentMethod === 'cash'" class="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            The rider collects cash on delivery. No online authorization is needed.
          </div>

          <div v-else-if="paymentMethod === 'visa_card'" class="mt-4 grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
            <div>
              <label class="field-label" for="cardholder-name">Cardholder name</label>
              <input id="cardholder-name" v-model="visaForm.cardholderName" class="field-input" type="text" autocomplete="cc-name" placeholder="Clara Customer" />
            </div>
            <div>
              <label class="field-label" for="card-number">Visa card number</label>
              <input id="card-number" v-model="visaForm.cardNumber" class="field-input" inputmode="numeric" autocomplete="cc-number" placeholder="4111 1111 1111 1111" />
            </div>
            <div>
              <label class="field-label" for="card-expiry">Expiry</label>
              <input id="card-expiry" v-model="visaForm.expiry" class="field-input" inputmode="numeric" autocomplete="cc-exp" placeholder="MM/YY" />
            </div>
            <div>
              <label class="field-label" for="card-cvc">Security code</label>
              <input id="card-cvc" v-model="visaForm.cvc" class="field-input" inputmode="numeric" autocomplete="cc-csc" placeholder="123" />
            </div>
          </div>

          <div v-else-if="paymentMethod === 'bank_account'" class="mt-4 grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
            <div>
              <label class="field-label" for="bank-name">Bank</label>
              <select id="bank-name" v-model="bankForm.bankName" class="field-input">
                <option value="">Select bank</option>
                <option v-for="bank in bankOptions" :key="bank" :value="bank">{{ bank }}</option>
              </select>
            </div>
            <div>
              <label class="field-label" for="account-name">Account name</label>
              <input id="account-name" v-model="bankForm.accountName" class="field-input" type="text" placeholder="Clara Customer" />
            </div>
            <div class="md:col-span-2">
              <label class="field-label" for="account-number">Account number</label>
              <input id="account-number" v-model="bankForm.accountNumber" class="field-input" inputmode="numeric" placeholder="1234567890" />
            </div>
          </div>


          <div v-else-if="paymentMethod === 'paypal'" class="mt-4 rounded-xl border border-sky-100 bg-sky-50 p-4">
            <label class="field-label" for="paypal-email">PayPal email</label>
            <input id="paypal-email" v-model="paypalForm.email" class="field-input bg-white" type="email" autocomplete="email" placeholder="customer@example.com" />
            <p class="mt-2 text-xs text-sky-700">Demo authorization records the PayPal account on the order summary.</p>
          </div>

          <div v-else-if="paymentMethod === 'aba_payway'" class="mt-4 grid gap-4 rounded-xl border border-sky-100 bg-sky-50 p-4 md:grid-cols-2">
            <div>
              <label class="field-label" for="aba-account-name">ABA account name</label>
              <input id="aba-account-name" v-model="abaPaywayForm.accountName" class="field-input bg-white" type="text" placeholder="Clara Customer" />
            </div>
            <div>
              <label class="field-label" for="aba-phone">ABA phone number</label>
              <input id="aba-phone" v-model="abaPaywayForm.phone" class="field-input bg-white" inputmode="tel" placeholder="012345678" />
            </div>
            <p class="text-xs text-sky-700 md:col-span-2">Demo ABA PayWay payment simulates a KHQR/mobile banking confirmation.</p>
          </div>
          <div v-if="paymentIssues.length" class="mt-4 space-y-2">
            <div v-for="issue in paymentIssues" :key="issue" class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {{ issue }}
            </div>
          </div>
        </div>

        <div class="rounded-lg border border-slate-200 bg-white p-5">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-sm font-semibold text-slate-900">Loyalty redemption</p>
              <p class="mt-1 text-sm text-slate-500">Apply available points.</p>
            </div>
            <span class="pill bg-brand-100 text-brand-700">{{ authStore.user?.loyaltyPoints ?? 0 }} pts available</span>
          </div>
          <label class="mt-4 flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <input v-model="redeemLoyalty" type="checkbox" :disabled="maxRedeemablePoints <= 0" />
            Redeem {{ maxRedeemablePoints }} points for {{ formatCurrency(loyaltyDiscount) }} off this checkout
          </label>
        </div>

        <div class="rounded-lg border border-slate-200 bg-white p-5">
          <p class="text-sm font-semibold text-slate-900">Order summary</p>
          <div class="mt-4 space-y-3 text-sm text-slate-600">
            <div v-for="item in cartStore.items" :key="item.id" class="flex items-start justify-between gap-4">
              <div>
                <p class="font-semibold text-slate-900">{{ item.quantity }} x {{ item.name }}</p>
                <p v-if="item.modifiers?.length" class="text-xs text-slate-500">{{ item.modifiers.join(', ') }}</p>
                <p v-if="item.note" class="text-xs text-slate-500">{{ item.note }}</p>
              </div>
              <span>{{ formatCurrency(item.price * item.quantity) }}</span>
            </div>
          </div>
        </div>

        <div v-if="validationResult.issues.length" class="space-y-2">
          <div v-for="issue in validationResult.issues" :key="issue" class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {{ issue }}
          </div>
        </div>
        <div v-if="validationResult.warnings.length" class="space-y-2">
          <div v-for="warning in validationResult.warnings" :key="warning" class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {{ warning }}
          </div>
        </div>
        <div v-if="orderMessage" class="rounded-lg px-4 py-3 text-sm" :class="orderMessageTone === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-700'">
          {{ orderMessage }}
        </div>

        <label class="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <input v-model="acceptTerms" type="checkbox" />
          I confirm this order.
        </label>

        <button class="btn-primary w-full sm:w-auto" :disabled="placing || !canPlaceOrder" @click="placeOrder">
          {{ placing ? 'Placing order...' : 'Place order' }}
        </button>
      </div>
    </SectionCard>

    <CartSummary :subtotal="cartStore.subtotal" :delivery-fee="cartStore.deliveryFee" :discount="totalDiscount" :total="checkoutTotal">
      <div class="mt-5 space-y-3 text-sm text-slate-600">
        <div class="flex justify-between"><span>Campaign discount</span><span>-{{ formatCurrency(cartStore.campaignDiscount) }}</span></div>
        <div class="flex justify-between"><span>Voucher discount</span><span>-{{ formatCurrency(cartStore.voucherDiscount) }}</span></div>
        <div class="flex justify-between"><span>Loyalty redemption</span><span>-{{ formatCurrency(loyaltyDiscount) }}</span></div>
        <div v-if="validationResult.distanceKm !== null" class="flex justify-between"><span>Distance</span><span>{{ validationResult.distanceKm.toFixed(1) }} km</span></div>
      </div>
    </CartSummary>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import CartSummary from '@/components/customer/CartSummary.vue';
import SectionCard from '@/components/common/SectionCard.vue';
import { applyCustomerLoyaltyTransaction } from '@/services/customer.service';
import { getRestaurantById } from '@/services/restaurant.service';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { useOrderStore } from '@/stores/order.store';
import type { Address, PaymentMethod, Restaurant } from '@/types';
import { formatCurrency } from '@/utils/format';
import { evaluateBranchAvailability, getBranchById, validateCheckoutCart } from '@/utils/ordering';
import type { CheckoutPaymentMethod } from '@/utils/payment';
import { buildPaymentDetails, validatePayment } from '@/utils/payment';

const authStore = useAuthStore();
const cartStore = useCartStore();
const orderStore = useOrderStore();
const router = useRouter();
const restaurant = ref<Restaurant | null>(null);
const placing = ref(false);
const selectedAddressId = ref('');
const deliveryInstructions = ref('');
const paymentMethod = ref<CheckoutPaymentMethod>('visa_card');
const visaForm = ref({
  cardholderName: authStore.user?.name ?? '',
  cardNumber: '',
  expiry: '',
  cvc: '',
});
const bankForm = ref({
  bankName: '',
  accountName: authStore.user?.name ?? '',
  accountNumber: '',
});
const paypalForm = ref({
  email: authStore.user?.email ?? '',
});
const abaPaywayForm = ref({
  accountName: authStore.user?.name ?? '',
  phone: authStore.user?.phone ?? '',
});
const redeemLoyalty = ref(false);
const acceptTerms = ref(false);
const orderMessage = ref('');
const orderMessageTone = ref<'success' | 'error'>('success');

const paymentOptions = [
  { value: 'cash' as const, label: 'Cash', help: 'Pay on delivery.' },
  { value: 'visa_card' as const, label: 'Visa card', help: 'Card authorization.' },
  { value: 'bank_account' as const, label: 'Bank account', help: 'Bank debit.' },
  { value: 'paypal' as const, label: 'PayPal', help: 'PayPal account.' },
  { value: 'aba_payway' as const, label: 'ABA PayWay', help: 'ABA/KHQR demo.' },
];

const bankOptions = ['ABA Bank', 'ACLEDA Bank', 'Wing Bank', 'Bangkok Bank', 'Kasikornbank', 'SCB', 'Krungthai Bank', 'Krungsri'];

const addresses = computed(() => authStore.user?.addresses ?? []);
const selectedAddress = computed<Address | null>(() => addresses.value.find((address) => address.id === selectedAddressId.value) ?? addresses.value[0] ?? null);
const branch = computed(() => getBranchById(restaurant.value, cartStore.branchId));
const branchAvailability = computed(() => evaluateBranchAvailability(branch.value));
const maxRedeemablePoints = computed(() => {
  const available = authStore.user?.loyaltyPoints ?? 0;
  return Math.min(available, Math.floor(cartStore.subtotal * 0.15), 80);
});
const loyaltyDiscount = computed(() => (redeemLoyalty.value ? maxRedeemablePoints.value : 0));
const totalDiscount = computed(() => cartStore.discount + loyaltyDiscount.value);
const checkoutTotal = computed(() => Math.max(0, cartStore.subtotal + cartStore.deliveryFee - totalDiscount.value));
const paymentIssues = computed(() =>
  validatePayment(paymentMethod.value, {
    visa: visaForm.value,
    bank: bankForm.value,
    paypal: paypalForm.value,
    abaPayway: abaPaywayForm.value,
  }),
);

const validationResult = computed(() =>
  validateCheckoutCart({
    restaurant: restaurant.value,
    branch: branch.value,
    items: cartStore.items,
    address: selectedAddress.value,
  }),
);
const canPlaceOrder = computed(() => cartStore.items.length > 0 && acceptTerms.value && validationResult.value.issues.length === 0 && paymentIssues.value.length === 0);

async function syncRestaurant() {
  restaurant.value = cartStore.restaurantId ? await getRestaurantById(cartStore.restaurantId) : null;
  if (!selectedAddressId.value) {
    selectedAddressId.value = addresses.value.find((address) => address.isDefault)?.id ?? addresses.value[0]?.id ?? '';
  }
}

async function placeOrder() {
  if (!authStore.user || !selectedAddress.value || !cartStore.restaurantId || !cartStore.restaurantName || !branch.value || !canPlaceOrder.value) {
    return;
  }

  placing.value = true;
  orderMessage.value = '';

  try {
    const earnedPoints = Math.max(5, Math.floor(cartStore.subtotal / 20));
    const order = await orderStore.placeOrder({
      customerId: authStore.user.id,
      restaurantId: cartStore.restaurantId,
      restaurantName: cartStore.restaurantName,
      branchId: branch.value.id,
      branchName: branch.value.name,
      items: cartStore.items,
      subtotal: cartStore.subtotal,
      deliveryFee: cartStore.deliveryFee,
      discount: totalDiscount.value,
      deliveryAddress: `${selectedAddress.value.line1}, ${selectedAddress.value.district}, ${selectedAddress.value.city}`,
      paymentMethod: paymentMethod.value as PaymentMethod,
      paymentDetails: buildPaymentDetails(paymentMethod.value, {
        visa: visaForm.value,
        bank: bankForm.value,
        paypal: paypalForm.value,
        abaPayway: abaPaywayForm.value,
      }),
      deliveryInstructions: deliveryInstructions.value.trim(),
      voucherCode: cartStore.voucherCode,
      loyaltyPointsRedeemed: loyaltyDiscount.value,
    });

    const updatedUser = await applyCustomerLoyaltyTransaction(authStore.user.id, {
      earnedPoints,
      redeemedPoints: loyaltyDiscount.value,
    });
    if (updatedUser) {
      authStore.setCurrentUser(updatedUser);
    }

    cartStore.clearCart();
    orderMessageTone.value = 'success';
    orderMessage.value = `Order ${order.id} was created successfully.`;
    router.push({ name: 'track-order', query: { orderId: order.id } });
  } catch (error) {
    orderMessageTone.value = 'error';
    orderMessage.value = error instanceof Error ? error.message : 'Unable to place order.';
  } finally {
    placing.value = false;
  }
}

watch(() => cartStore.restaurantId, syncRestaurant, { immediate: true });
watch(addresses, (value) => {
  if (!value.length) {
    selectedAddressId.value = '';
    return;
  }

  if (!value.some((address) => address.id === selectedAddressId.value)) {
    selectedAddressId.value = value.find((address) => address.isDefault)?.id ?? value[0]?.id ?? '';
  }
}, { deep: true, immediate: true });
</script>
