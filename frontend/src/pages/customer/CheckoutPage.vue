<template>
  <div class="grid min-w-0 gap-4 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
    <SectionCard eyebrow="Secure Checkout" title="Confirm order details" >
      <div v-if="!cartStore.items.length" class="rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
        Your cart is empty.
      </div>

      <div v-else class="space-y-4 sm:space-y-6">
        <div class="grid min-w-0 gap-4 md:grid-cols-2">
          <div class="surface-muted min-w-0 p-4 sm:p-5">
            <p class="text-sm font-semibold text-slate-900">Customer</p>
            <p class="mt-2 break-words text-sm text-slate-600">{{ authStore.user?.name }}</p>
            <p class="break-all text-sm leading-6 text-slate-500">{{ authStore.user?.email }}</p>
          </div>
          <div class="surface-muted min-w-0 p-4 sm:p-5">
            <p class="text-sm font-semibold text-slate-900">Branch</p>
            <p class="mt-2 break-words text-sm text-slate-600">{{ branch?.name }}</p>
            <p class="break-words text-sm text-slate-500">{{ restaurant?.name }}</p>
            <p class="mt-3 break-words text-sm leading-6 text-slate-500">{{ branchAvailability.detail }}</p>
          </div>
        </div>

        <div>
          <label class="field-label" for="address-select">Delivery address</label>
          <select id="address-select" v-model="selectedAddressId" class="field-input min-w-0 truncate">
            <option v-for="address in addresses" :key="address.id" :value="address.id">
              {{ address.label }} - {{ address.line1 }} - {{ address.district }}
            </option>
          </select>
        </div>

        <div>
          <label class="field-label" for="delivery-instructions">Delivery instructions</label>
          <textarea id="delivery-instructions" v-model="deliveryInstructions" class="field-input min-h-28" placeholder="Leave at lobby, call on arrival, no doorbell, and similar delivery notes." />
        </div>

        <div class="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p class="text-sm font-semibold text-slate-900">Payment method</p>
              <p class="mt-1 text-sm text-slate-500">Choose how the customer will pay for this demo order.</p>
            </div>
            <span class="pill bg-emerald-50 text-emerald-700">Mock secure payment</span>
          </div>

          <div class="mt-4 grid min-w-0 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-3 min-[1180px]:grid-cols-5">
            <label
              v-for="option in paymentOptions"
              :key="option.value"
              class="group relative flex min-h-[136px] cursor-pointer flex-col justify-between overflow-hidden rounded-lg border p-3 text-sm transition sm:p-4"
              :class="paymentMethod === option.value ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-100' : 'border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:bg-orange-50'"
            >
              <input v-model="paymentMethod" class="sr-only" type="radio" name="payment-method" :value="option.value" />
              <span class="flex min-h-[50px] items-start pr-12">
                <span class="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
                  <img
                    v-if="option.imageUrl && !failedPaymentImages[option.value]"
                    :src="option.imageUrl"
                    :alt="`${option.label} logo`"
                    class="max-h-8 max-w-14 object-contain"
                    loading="lazy"
                    referrerpolicy="no-referrer"
                    @error="markPaymentImageFailed(option.value)"
                  />
                  <span v-else class="text-sm font-black" :class="option.logoTextClass">{{ option.logoText }}</span>
                </span>
                <span class="pill absolute right-3 top-3 max-w-[64px] truncate px-2 py-1 text-[10px] leading-4" :class="option.badgeClass" :title="option.badge">{{ option.badge }}</span>
              </span>
              <span class="mt-3 block min-w-0">
                <span class="block break-words text-base font-bold leading-5" :class="paymentMethod === option.value ? 'text-brand-700' : 'text-slate-950'">{{ option.label }}</span>
                <span class="mt-1 block max-w-full break-words text-xs leading-5 text-slate-500">{{ option.help }}</span>
              </span>
            </label>
          </div>

          <div v-if="paymentMethod === 'cash'" class="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            The rider collects cash on delivery. No online authorization is needed.
          </div>

          <div v-else-if="paymentMethod === 'visa_card'" class="mt-4 grid min-w-0 gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
            <div>
              <label class="field-label" for="cardholder-name">Cardholder name</label>
              <input id="cardholder-name" v-model="visaForm.cardholderName" class="field-input" :class="paymentFieldErrors.cardholderName ? paymentErrorInputClass : ''" type="text" autocomplete="cc-name" placeholder="Clara Customer" />
              <p v-if="paymentFieldErrors.cardholderName" class="mt-1 text-xs text-rose-600">{{ paymentFieldErrors.cardholderName }}</p>
            </div>
            <div>
              <label class="field-label" for="card-number">Visa card number</label>
              <input id="card-number" v-model="visaForm.cardNumber" class="field-input" :class="paymentFieldErrors.cardNumber ? paymentErrorInputClass : ''" inputmode="numeric" autocomplete="cc-number" maxlength="23" placeholder="4026 4503 5810 4502" @input="formatVisaCardNumber" />
              <p v-if="paymentFieldErrors.cardNumber" class="mt-1 text-xs text-rose-600">{{ paymentFieldErrors.cardNumber }}</p>
            </div>
            <div>
              <label class="field-label" for="card-expiry">Expiry</label>
              <input id="card-expiry" v-model="visaForm.expiry" class="field-input" :class="paymentFieldErrors.expiry ? paymentErrorInputClass : ''" inputmode="numeric" autocomplete="cc-exp" maxlength="5" placeholder="12/26" @input="formatVisaExpiry" />
              <p v-if="paymentFieldErrors.expiry" class="mt-1 text-xs text-rose-600">{{ paymentFieldErrors.expiry }}</p>
            </div>
            <div>
              <label class="field-label" for="card-cvc">Security code</label>
              <input id="card-cvc" v-model="visaForm.cvc" class="field-input" :class="paymentFieldErrors.cvc ? paymentErrorInputClass : ''" inputmode="numeric" autocomplete="cc-csc" maxlength="4" placeholder="123" />
              <p v-if="paymentFieldErrors.cvc" class="mt-1 text-xs text-rose-600">{{ paymentFieldErrors.cvc }}</p>
            </div>
          </div>
          <div v-else-if="paymentMethod === 'paypal'" class="mt-4 rounded-xl border border-sky-100 bg-sky-50 p-4">
            <label class="field-label" for="paypal-email">PayPal email</label>
            <input id="paypal-email" v-model="paypalForm.email" class="field-input bg-white" :class="paymentFieldErrors.paypalEmail ? paymentErrorInputClass : ''" type="email" autocomplete="email" placeholder="customer@example.com" />
            <p v-if="paymentFieldErrors.paypalEmail" class="mt-1 text-xs text-rose-600">{{ paymentFieldErrors.paypalEmail }}</p>
            <p class="mt-2 text-xs text-sky-700">Demo authorization records the PayPal account on the order summary.</p>
          </div>

          <div v-else-if="paymentMethod === 'aba_payway'" class="mt-4 grid min-w-0 gap-4 rounded-lg border border-sky-100 bg-sky-50 p-4 md:grid-cols-2">
            <div>
              <label class="field-label" for="aba-account-name">ABA account name</label>
              <input id="aba-account-name" v-model="abaPaywayForm.accountName" class="field-input bg-white" :class="paymentFieldErrors.abaAccountName ? paymentErrorInputClass : ''" type="text" placeholder="Clara Customer" />
              <p v-if="paymentFieldErrors.abaAccountName" class="mt-1 text-xs text-rose-600">{{ paymentFieldErrors.abaAccountName }}</p>
            </div>
            <div>
              <label class="field-label" for="aba-phone">ABA phone number</label>
              <input id="aba-phone" v-model="abaPaywayForm.phone" class="field-input bg-white" :class="paymentFieldErrors.abaPhone ? paymentErrorInputClass : ''" inputmode="tel" placeholder="012345678" />
              <p v-if="paymentFieldErrors.abaPhone" class="mt-1 text-xs text-rose-600">{{ paymentFieldErrors.abaPhone }}</p>
            </div>
            <p class="text-xs text-sky-700 md:col-span-2">Demo ABA PayWay payment simulates a KHQR/mobile banking confirmation.</p>
          </div>

          <div v-else-if="paymentMethod === 'bakong'" class="mt-4 grid min-w-0 gap-4 rounded-lg border border-rose-100 bg-rose-50 p-4 md:grid-cols-2">
            <div>
              <label class="field-label" for="bakong-account-name">Bakong account name</label>
              <input id="bakong-account-name" v-model="bakongForm.accountName" class="field-input bg-white" :class="paymentFieldErrors.bakongAccountName ? paymentErrorInputClass : ''" type="text" placeholder="Clara Customer" />
              <p v-if="paymentFieldErrors.bakongAccountName" class="mt-1 text-xs text-rose-600">{{ paymentFieldErrors.bakongAccountName }}</p>
            </div>
            <div>
              <label class="field-label" for="bakong-phone">Bakong phone number</label>
              <input id="bakong-phone" v-model="bakongForm.phone" class="field-input bg-white" :class="paymentFieldErrors.bakongPhone ? paymentErrorInputClass : ''" inputmode="tel" placeholder="012345678" />
              <p v-if="paymentFieldErrors.bakongPhone" class="mt-1 text-xs text-rose-600">{{ paymentFieldErrors.bakongPhone }}</p>
            </div>
            <p class="text-xs text-rose-700 md:col-span-2">Demo Bakong payment simulates a KHQR/mobile banking confirmation.</p>
          </div>
          <div v-if="nonFieldPaymentIssues.length" class="mt-4 space-y-2">
            <div v-for="issue in nonFieldPaymentIssues" :key="issue" class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {{ issue }}
            </div>
          </div>
        </div>

        <div class="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
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

        <div class="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
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

        <label class="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700 mobile-text-wrap">
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
const paymentMethod = ref<CheckoutPaymentMethod>('cash');
const visaForm = ref({
  cardholderName: authStore.user?.name ?? '',
  cardNumber: '',
  expiry: '',
  cvc: '',
});
const paypalForm = ref({
  email: authStore.user?.email ?? '',
});
const abaPaywayForm = ref({
  accountName: authStore.user?.name ?? '',
  phone: authStore.user?.phone ?? '',
});
const bakongForm = ref({
  accountName: authStore.user?.name ?? '',
  phone: authStore.user?.phone ?? '',
});
const redeemLoyalty = ref(false);
const acceptTerms = ref(false);
const orderMessage = ref('');
const orderMessageTone = ref<'success' | 'error'>('success');
const paymentErrorInputClass = 'border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-rose-100';

const paymentOptions = [
  {
    value: 'cash' as const,
    label: 'Cash',
    help: 'Pay on delivery.',
    badge: 'Delivery',
    imageUrl: 'https://www.svgrepo.com/show/425138/cash-on-delivery.svg',
    logoText: 'COD',
    badgeClass: 'bg-emerald-50 text-emerald-700',
    logoTextClass: 'text-emerald-700',
  },
  {
    value: 'visa_card' as const,
    label: 'Visa card',
    help: 'Card authorization.',
    badge: 'Card',
    imageUrl: 'https://logos-world.net/wp-content/uploads/2020/04/Visa-Symbol.png',
    logoText: 'VISA',
    badgeClass: 'bg-blue-50 text-blue-700',
    logoTextClass: 'text-blue-700',
  },
  {
    value: 'paypal' as const,
    label: 'PayPal',
    help: 'PayPal account.',
    badge: 'Wallet',
    imageUrl: 'https://freelogopng.com/images/all_img/1655979457paypal-logo.png',
    logoText: 'PP',
    badgeClass: 'bg-sky-50 text-sky-700',
    logoTextClass: 'text-sky-700',
  },
  {
    value: 'aba_payway' as const,
    label: 'ABA PayWay',
    help: 'ABA/KHQR demo.',
    badge: 'KHQR',
    imageUrl: 'https://i.pinimg.com/originals/e2/33/f5/e233f5b0c5a358449398f202b03f063a.jpg',
    logoText: 'ABA',
    badgeClass: 'bg-indigo-50 text-indigo-700',
    logoTextClass: 'text-indigo-700',
  },
  {
    value: 'bakong' as const,
    label: 'Bakong',
    help: 'Bakong/KHQR demo.',
    badge: 'NBC',
    imageUrl: 'https://www.des.gov.kh/uploads/Bakong_Logo_6981db9114.png',
    logoText: 'BK',
    badgeClass: 'bg-rose-50 text-rose-700',
    logoTextClass: 'text-rose-700',
  },
];
const failedPaymentImages = ref<Partial<Record<CheckoutPaymentMethod, boolean>>>({});

function markPaymentImageFailed(method: CheckoutPaymentMethod) {
  failedPaymentImages.value[method] = true;
}

function formatVisaCardNumber() {
  const digits = visaForm.value.cardNumber.replace(/\D/g, '').slice(0, 19);
  visaForm.value.cardNumber = digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatVisaExpiry() {
  const digits = visaForm.value.expiry.replace(/\D/g, '').slice(0, 4);
  const month = digits.slice(0, 2);
  const year = digits.slice(2);
  visaForm.value.expiry = year ? `${month}/${year}` : month;
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

function isExpiryInFuture(value: string) {
  const match = value.trim().match(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/);
  if (!match) {
    return false;
  }
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  return new Date(year, month, 0, 23, 59, 59, 999) >= new Date();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

const paymentFieldErrors = computed(() => {
  const errors: Record<string, string> = {};

  if (paymentMethod.value === 'visa_card') {
    const cardNumber = onlyDigits(visaForm.value.cardNumber);
    const cvc = onlyDigits(visaForm.value.cvc);
    if (visaForm.value.cardholderName.trim().length < 3) {
      errors.cardholderName = 'Enter the cardholder name.';
    }
    if (!cardNumber.startsWith('4') || cardNumber.length < 13 || cardNumber.length > 19) {
      errors.cardNumber = 'Enter a valid Visa card number.';
    }
    if (!isExpiryInFuture(visaForm.value.expiry)) {
      errors.expiry = 'Enter a valid future expiry date in MM/YY format.';
    }
    if (cvc.length < 3 || cvc.length > 4) {
      errors.cvc = 'Enter a valid card security code.';
    }
  }

  if (paymentMethod.value === 'paypal' && !isValidEmail(paypalForm.value.email)) {
    errors.paypalEmail = 'Enter a valid PayPal email address.';
  }

  if (paymentMethod.value === 'aba_payway') {
    const phone = onlyDigits(abaPaywayForm.value.phone);
    if (abaPaywayForm.value.accountName.trim().length < 3) {
      errors.abaAccountName = 'Enter the ABA account name.';
    }
    if (phone.length < 8 || phone.length > 15) {
      errors.abaPhone = 'Enter a valid ABA phone number.';
    }
  }

  if (paymentMethod.value === 'bakong') {
    const phone = onlyDigits(bakongForm.value.phone);
    if (bakongForm.value.accountName.trim().length < 3) {
      errors.bakongAccountName = 'Enter the Bakong account name.';
    }
    if (phone.length < 8 || phone.length > 15) {
      errors.bakongPhone = 'Enter a valid Bakong phone number.';
    }
  }

  return errors;
});

const inlinePaymentIssueMessages = computed(() => new Set(Object.values(paymentFieldErrors.value)));
const nonFieldPaymentIssues = computed(() => paymentIssues.value.filter((issue) => !inlinePaymentIssueMessages.value.has(issue)));

const phnomPenhCheckoutAddress: Address = {
  id: 'checkout-phnom-penh-fallback',
  label: 'Home',
  line1: 'Street 310, BKK1',
  district: 'Boeung Keng Kang',
  city: 'Phnom Penh',
  isDefault: true,
  lat: 11.5526,
  lng: 104.9282,
};

function normalizeCheckoutAddress(address: Address): Address {
  const lowerText = `${address.line1} ${address.district} ${address.city}`.toLowerCase();
  const isOldPlaceholder = lowerText.includes('bangkok') || lowerText.includes('set your delivery address');
  return isOldPlaceholder ? { ...phnomPenhCheckoutAddress, id: address.id, label: address.label === 'Primary' ? 'Home' : address.label, isDefault: address.isDefault } : address;
}

const addresses = computed(() => (authStore.user?.addresses?.length ? authStore.user.addresses.map(normalizeCheckoutAddress) : [phnomPenhCheckoutAddress]));
const selectedAddress = computed<Address | null>(() => addresses.value.find((address) => address.id === selectedAddressId.value) ?? addresses.value.find((address) => address.isDefault) ?? addresses.value[0] ?? null);
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
    paypal: paypalForm.value,
    abaPayway: abaPaywayForm.value,
    bakong: bakongForm.value,
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
        paypal: paypalForm.value,
        abaPayway: abaPaywayForm.value,
        bakong: bakongForm.value,
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
