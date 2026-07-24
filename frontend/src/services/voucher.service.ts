import type { Voucher, VoucherInput, VoucherValidationResult } from '@/types';
import api from '@/services/api';
import { unwrap, useBackendApi } from '@/services/backend';
import { cachedGet, clearApiCache } from '@/services/request-cache';
import { createActivityLog } from '@/services/activity-log.service';
import { dbRestaurants } from '@/utils/mockDb';
import { readStorage, storageKeys, writeStorage } from '@/utils/storage';

const seedVouchers: Voucher[] = [
  {
    id: 'voucher-flavor10',
    code: 'FLAVOR10',
    title: 'Flavor 10',
    description: 'Customer voucher for 5 off orders above 15.',
    discountType: 'fixed',
    discountValue: 5,
    minSubtotal: 15,
    maxDiscount: null,
    usageLimit: null,
    usedCount: 0,
    startsAt: null,
    endsAt: null,
    active: true,
    restaurantId: null,
    restaurantName: null,
    createdBy: 'user-admin',
  },
  {
    id: 'voucher-feast25',
    code: 'FEAST25',
    title: 'Feast 25',
    description: 'Customer voucher for 25 percent off orders above 20.',
    discountType: 'percentage',
    discountValue: 25,
    minSubtotal: 20,
    maxDiscount: 5,
    usageLimit: null,
    usedCount: 0,
    startsAt: null,
    endsAt: null,
    active: true,
    restaurantId: null,
    restaurantName: null,
    createdBy: 'user-admin',
  },
  {
    id: 'voucher-freedelivery',
    code: 'FREEDELIVERY',
    title: 'Free Delivery',
    description: 'Customer voucher that removes the delivery fee.',
    discountType: 'free_delivery',
    discountValue: 0,
    minSubtotal: 0,
    maxDiscount: null,
    usageLimit: null,
    usedCount: 0,
    startsAt: null,
    endsAt: null,
    active: true,
    restaurantId: null,
    restaurantName: null,
    createdBy: 'user-admin',
  },
];

function normalizeCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, '');
}

function attachRestaurantName(voucher: Voucher): Voucher {
  const restaurant = voucher.restaurantId ? dbRestaurants().find((entry) => entry.id === voucher.restaurantId) : null;
  return {
    ...voucher,
    code: normalizeCode(voucher.code),
    discountValue: Number(voucher.discountValue || 0),
    minSubtotal: Number(voucher.minSubtotal || 0),
    maxDiscount: voucher.maxDiscount === null || voucher.maxDiscount === undefined ? null : Number(voucher.maxDiscount),
    usageLimit: voucher.usageLimit === null || voucher.usageLimit === undefined ? null : Number(voucher.usageLimit),
    usedCount: Number(voucher.usedCount || 0),
    restaurantName: restaurant?.name ?? null,
  };
}

function dbVouchers() {
  const stored = readStorage<Voucher[]>(storageKeys.vouchers, seedVouchers);
  const merged = seedVouchers.map((seed) => stored.find((entry) => entry.id === seed.id) ?? seed);
  const custom = stored.filter((entry) => !seedVouchers.some((seed) => seed.id === entry.id));
  return [...merged, ...custom].map(attachRestaurantName);
}

function saveVouchers(vouchers: Voucher[]) {
  writeStorage(storageKeys.vouchers, vouchers.map(attachRestaurantName));
}

function discountFor(voucher: Voucher, subtotal: number, deliveryFee: number) {
  if (voucher.discountType === 'free_delivery') return Math.max(0, deliveryFee);
  if (voucher.discountType === 'percentage') {
    const raw = Math.max(0, subtotal * (Number(voucher.discountValue) / 100));
    return voucher.maxDiscount ? Math.min(raw, Number(voucher.maxDiscount)) : raw;
  }
  return Math.min(Math.max(0, Number(voucher.discountValue)), Math.max(0, subtotal));
}

export async function listVouchers(params?: { restaurantId?: string | null }) {
  if (useBackendApi) return cachedGet<Voucher[]>('/vouchers', { params });
  return dbVouchers().filter((voucher) => !params?.restaurantId || voucher.restaurantId === params.restaurantId);
}


export async function listAvailableVouchers(params?: { restaurantId?: string | null }) {
  if (useBackendApi) return cachedGet<Voucher[]>('/vouchers/available', { params }, 15_000);
  const now = new Date();
  return dbVouchers().filter((voucher) => {
    if (!voucher.active) return false;
    if (voucher.restaurantId && params?.restaurantId && voucher.restaurantId !== params.restaurantId) return false;
    if (voucher.restaurantId && !params?.restaurantId) return false;
    if (voucher.startsAt && new Date(voucher.startsAt) > now) return false;
    if (voucher.endsAt && new Date(voucher.endsAt) < now) return false;
    if (voucher.usageLimit !== null && voucher.usageLimit !== undefined && voucher.usedCount >= voucher.usageLimit) return false;
    return true;
  });
}
export async function createPromoEvent(payload: VoucherInput & {
  notification: {
    title: string;
    message: string;
    scheduledAt?: string | null;
  };
}) {
  if (useBackendApi) {
    const result = unwrap<{ voucher: Voucher; notificationId: string; scheduledAt?: string | null }>(await api.post('/vouchers/promo-events', payload));
    clearApiCache('/vouchers');
    clearApiCache('/vouchers/available');
    clearApiCache('/notifications');
    return result;
  }

  const voucher = await createVoucher(payload);
  const { createNotification } = await import('@/services/notification.service');
  const scheduledAt = payload.notification.scheduledAt || null;
  await createNotification({
    title: payload.notification.title,
    message: payload.notification.message,
    kind: 'promo',
    audienceRole: 'customer',
    ctaLabel: 'Use promo code',
    ctaTo: '/cart',
    scheduledAt,
  });
  clearApiCache('/vouchers/available');
  return { voucher, notificationId: `local-${voucher.id}`, scheduledAt };
}

export async function createVoucher(payload: VoucherInput) {
  if (useBackendApi) {
    const voucher = unwrap<Voucher>(await api.post('/vouchers', payload));
    clearApiCache('/vouchers');
    clearApiCache('/vouchers/available');
    return voucher;
  }

  const vouchers = dbVouchers();
  const code = normalizeCode(payload.code);
  if (vouchers.some((voucher) => voucher.code === code)) throw new Error('This voucher code already exists.');
  const now = new Date().toISOString();
  const voucher = attachRestaurantName({
    id: `voucher-${crypto.randomUUID()}`,
    ...payload,
    code,
    usedCount: 0,
    createdAt: now,
    updatedAt: now,
  });
  saveVouchers([voucher, ...vouchers]);
  await createActivityLog({
    domain: 'promotion',
    action: 'voucher.created',
    title: `Voucher created: ${voucher.code}`,
    description: `${voucher.title} was created for customer checkout.`,
    restaurantId: voucher.restaurantId ?? null,
    restaurantName: voucher.restaurantName ?? null,
    metadata: { voucherId: voucher.id, code: voucher.code },
  });
  return voucher;
}

export async function updateVoucher(id: string, payload: VoucherInput) {
  if (useBackendApi) {
    const voucher = unwrap<Voucher>(await api.put('/vouchers/' + id, payload));
    clearApiCache('/vouchers');
    return voucher;
  }

  const vouchers = dbVouchers();
  const target = vouchers.find((voucher) => voucher.id === id);
  if (!target) throw new Error('Voucher not found.');
  const code = normalizeCode(payload.code);
  if (vouchers.some((voucher) => voucher.id !== id && voucher.code === code)) throw new Error('This voucher code already exists.');
  const updated = attachRestaurantName({ ...target, ...payload, code, updatedAt: new Date().toISOString() });
  saveVouchers(vouchers.map((voucher) => (voucher.id === id ? updated : voucher)));
  return updated;
}

export async function deleteVoucher(id: string) {
  if (useBackendApi) {
    await api.delete('/vouchers/' + id);
    clearApiCache('/vouchers');
    clearApiCache('/vouchers/available');
    return true;
  }
  saveVouchers(dbVouchers().filter((voucher) => voucher.id !== id));
  return true;
}

export async function validateVoucherCode(params: { code: string; subtotal: number; deliveryFee: number; restaurantId?: string | null }): Promise<VoucherValidationResult> {
  const code = normalizeCode(params.code);
  if (!code) return { valid: true, message: 'Voucher cleared.', discount: 0, voucher: null };
  if (useBackendApi) return unwrap<VoucherValidationResult>(await api.post('/vouchers/validate', { ...params, code }));

  const voucher = dbVouchers().find((entry) => entry.code === code) ?? null;
  const now = new Date();
  if (!voucher) return { valid: false, message: 'Voucher code not recognized.', discount: 0, voucher: null };
  if (!voucher.active) return { valid: false, message: 'This voucher is not active.', discount: 0, voucher: null };
  if (voucher.restaurantId && params.restaurantId && voucher.restaurantId !== params.restaurantId) return { valid: false, message: 'This voucher is not available for this restaurant.', discount: 0, voucher: null };
  if (voucher.startsAt && new Date(voucher.startsAt) > now) return { valid: false, message: 'This voucher is not active yet.', discount: 0, voucher: null };
  if (voucher.endsAt && new Date(voucher.endsAt) < now) return { valid: false, message: 'This voucher has expired.', discount: 0, voucher: null };
  if (voucher.usageLimit !== null && voucher.usageLimit !== undefined && voucher.usedCount >= voucher.usageLimit) return { valid: false, message: 'This voucher has reached its usage limit.', discount: 0, voucher: null };
  if (params.subtotal < voucher.minSubtotal) return { valid: false, message: `This voucher needs a subtotal of at least ${voucher.minSubtotal.toFixed(2)}.`, discount: 0, voucher: null };

  const discount = discountFor(voucher, params.subtotal, params.deliveryFee);
  if (discount <= 0) return { valid: false, message: 'This voucher does not apply to the current cart.', discount: 0, voucher: null };
  return { valid: true, message: `${voucher.code} applied to the current cart.`, discount, voucher };
}
