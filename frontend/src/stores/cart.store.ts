import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import type { CartItem } from '@/types';
import { storageKeys, writeStorage } from '@/utils/storage';

const CART_SCHEMA_VERSION = 2;

interface StoredCartState {
  version: number;
  items: CartItem[];
  voucherCode: string | null;
}

function normalizeCartItem(value: unknown): CartItem | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const item = value as Partial<CartItem> & { id?: string; restaurantId?: string; restaurantName?: string };
  if (!item.id || !item.restaurantId || !item.restaurantName) {
    return null;
  }

  return {
    id: item.id,
    menuItemId: item.menuItemId ?? item.id,
    name: item.name ?? 'Untitled item',
    quantity: Math.max(1, Number(item.quantity ?? 1)),
    price: Number(item.price ?? 0),
    modifiers: Array.isArray(item.modifiers) ? item.modifiers.filter((entry): entry is string => typeof entry === 'string') : [],
    note: typeof item.note === 'string' ? item.note : '',
    restaurantId: item.restaurantId,
    restaurantName: item.restaurantName,
    branchId: item.branchId ?? 'legacy-branch',
    branchName: item.branchName ?? 'Saved branch',
    deliveryFee: Number(item.deliveryFee ?? 29),
    minimumOrderAmount: Number(item.minimumOrderAmount ?? 150),
  };
}

function readStoredCartState(): StoredCartState {
  const raw = localStorage.getItem(storageKeys.cart);
  if (!raw) {
    return { version: CART_SCHEMA_VERSION, items: [], voucherCode: null };
  }

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (Array.isArray(parsed)) {
      return {
        version: CART_SCHEMA_VERSION,
        items: parsed.map(normalizeCartItem).filter((item): item is CartItem => Boolean(item)),
        voucherCode: null,
      };
    }

    if (parsed && typeof parsed === 'object') {
      const state = parsed as Partial<StoredCartState> & { items?: unknown[] };
      return {
        version: CART_SCHEMA_VERSION,
        items: Array.isArray(state.items) ? state.items.map(normalizeCartItem).filter((item): item is CartItem => Boolean(item)) : [],
        voucherCode: typeof state.voucherCode === 'string' ? state.voucherCode.toUpperCase() : null,
      };
    }
  } catch {
    return { version: CART_SCHEMA_VERSION, items: [], voucherCode: null };
  }

  return { version: CART_SCHEMA_VERSION, items: [], voucherCode: null };
}

function getVoucherDiscount(subtotal: number, deliveryFee: number, voucherCode: string | null) {
  switch (voucherCode) {
    case 'FLAVOR10':
      return subtotal >= 180 ? 10 : 0;
    case 'FEAST25':
      return subtotal >= 250 ? 25 : 0;
    case 'FREEDELIVERY':
      return deliveryFee;
    default:
      return 0;
  }
}

function buildLineSignature(item: CartItem) {
  const modifiers = [...(item.modifiers ?? [])].map((modifier) => modifier.trim()).filter(Boolean).sort();
  return [item.menuItemId ?? item.id, item.note?.trim() ?? '', ...modifiers].join('|');
}

export const useCartStore = defineStore('cart', () => {
  const initialState = readStoredCartState();
  const items = ref<CartItem[]>(initialState.items);
  const voucherCode = ref<string | null>(initialState.voucherCode);
  const pendingReplacementItem = ref<CartItem | null>(null);

  watch(
    [items, voucherCode],
    ([nextItems, nextVoucherCode]) => {
      writeStorage(storageKeys.cart, {
        version: CART_SCHEMA_VERSION,
        items: nextItems,
        voucherCode: nextVoucherCode,
      } satisfies StoredCartState);
    },
    { deep: true },
  );

  const restaurantId = computed(() => items.value[0]?.restaurantId ?? null);
  const restaurantName = computed(() => items.value[0]?.restaurantName ?? null);
  const branchId = computed(() => items.value[0]?.branchId ?? null);
  const branchName = computed(() => items.value[0]?.branchName ?? null);
  const minimumOrderAmount = computed(() => items.value[0]?.minimumOrderAmount ?? 0);
  const itemsCount = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0));
  const subtotal = computed(() => items.value.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const deliveryFee = computed(() => (items.value.length ? items.value[0]?.deliveryFee ?? 0 : 0));
  const campaignDiscount = computed(() => (subtotal.value >= 300 ? 30 : 0));
  const voucherDiscount = computed(() => getVoucherDiscount(subtotal.value, deliveryFee.value, voucherCode.value));
  const discount = computed(() => campaignDiscount.value + voucherDiscount.value);
  const total = computed(() => Math.max(0, subtotal.value + deliveryFee.value - discount.value));
  const minimumOrderGap = computed(() => Math.max(0, minimumOrderAmount.value - subtotal.value));
  const canCheckout = computed(() => items.value.length > 0 && minimumOrderGap.value <= 0);

  function hasSourceConflict(item: CartItem) {
    return Boolean(
      items.value.length &&
        (restaurantId.value !== item.restaurantId || branchId.value !== item.branchId),
    );
  }

  function upsertItem(item: CartItem) {
    const signature = buildLineSignature(item);
    const existing = items.value.find((entry) => buildLineSignature(entry) === signature && entry.branchId === item.branchId);
    if (existing) {
      existing.quantity += item.quantity;
      return;
    }

    items.value.push(item);
  }

  function addItem(item: CartItem, options?: { forceReplace?: boolean }) {
    if (hasSourceConflict(item) && !options?.forceReplace) {
      pendingReplacementItem.value = item;
      return { status: 'requires_confirmation' as const };
    }

    if (hasSourceConflict(item) && options?.forceReplace) {
      items.value = [];
    }

    pendingReplacementItem.value = null;
    upsertItem(item);
    return { status: 'added' as const };
  }

  function confirmPendingReplacement() {
    if (!pendingReplacementItem.value) {
      return { status: 'idle' as const };
    }

    const item = { ...pendingReplacementItem.value };
    items.value = [];
    pendingReplacementItem.value = null;
    upsertItem(item);
    return { status: 'replaced' as const };
  }

  function cancelPendingReplacement() {
    pendingReplacementItem.value = null;
  }

  function removeItem(itemId: string) {
    items.value = items.value.filter((item) => item.id !== itemId);
  }

  function updateQuantity(itemId: string, quantity: number) {
    const target = items.value.find((item) => item.id === itemId);
    if (!target) {
      return;
    }

    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    target.quantity = quantity;
  }

  function applyVoucher(code: string) {
    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      voucherCode.value = null;
      return { valid: true, message: 'Voucher cleared.' };
    }

    if (!['FLAVOR10', 'FEAST25', 'FREEDELIVERY'].includes(normalized)) {
      return { valid: false, message: 'Voucher code not recognized in the demo environment.' };
    }

    voucherCode.value = normalized;
    if (getVoucherDiscount(subtotal.value, deliveryFee.value, voucherCode.value) <= 0) {
      return { valid: false, message: 'This voucher needs a larger subtotal before it can be applied.' };
    }

    return { valid: true, message: `${normalized} applied to the current cart.` };
  }

  function clearVoucher() {
    voucherCode.value = null;
  }

  function clearCart() {
    items.value = [];
    voucherCode.value = null;
    pendingReplacementItem.value = null;
  }

  return {
    items,
    voucherCode,
    pendingReplacementItem,
    restaurantId,
    restaurantName,
    branchId,
    branchName,
    minimumOrderAmount,
    itemsCount,
    subtotal,
    deliveryFee,
    campaignDiscount,
    voucherDiscount,
    discount,
    total,
    minimumOrderGap,
    canCheckout,
    addItem,
    confirmPendingReplacement,
    cancelPendingReplacement,
    removeItem,
    updateQuantity,
    applyVoucher,
    clearVoucher,
    clearCart,
  };
});

