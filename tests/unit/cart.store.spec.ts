import { nextTick } from 'vue';
import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useCartStore } from '@/stores/cart.store';
import { storageKeys } from '@/utils/storage';

function createItem(overrides?: Partial<ReturnType<typeof buildBaseItem>>) {
  return {
    ...buildBaseItem(),
    ...overrides,
  };
}

function buildBaseItem() {
  return {
    id: 'cart-1',
    menuItemId: 'item-1',
    name: 'Crispy Bowl',
    quantity: 1,
    price: 150,
    modifiers: ['Extra Egg'],
    note: '',
    restaurantId: 'rest-01',
    restaurantName: 'Bangkok Bowl Lab',
    branchId: 'branch-01a',
    branchName: 'Thonglor Hub',
    deliveryFee: 29,
    minimumOrderAmount: 150,
  };
}

describe('cart store', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  it('migrates a legacy array payload from storage', () => {
    localStorage.setItem(
      storageKeys.cart,
      JSON.stringify([
        {
          id: 'legacy-item',
          name: 'Legacy Item',
          quantity: 2,
          price: 75,
          restaurantId: 'rest-legacy',
          restaurantName: 'Legacy Restaurant',
        },
      ]),
    );

    const store = useCartStore();

    expect(store.items).toHaveLength(1);
    expect(store.items[0]?.menuItemId).toBe('legacy-item');
    expect(store.items[0]?.branchId).toBe('legacy-branch');
  });

  it('requires confirmation before mixing restaurant branches', () => {
    const store = useCartStore();

    const firstResult = store.addItem(createItem());
    const secondResult = store.addItem(
      createItem({
        id: 'cart-2',
        menuItemId: 'item-2',
        branchId: 'branch-01b',
        branchName: 'Ari Kitchen',
      }),
    );

    expect(firstResult.status).toBe('added');
    expect(secondResult.status).toBe('requires_confirmation');
    expect(store.items).toHaveLength(1);
    expect(store.pendingReplacementItem?.branchId).toBe('branch-01b');

    const confirmationResult = store.confirmPendingReplacement();
    expect(confirmationResult.status).toBe('replaced');
    expect(store.items).toHaveLength(1);
    expect(store.branchId).toBe('branch-01b');
  });

  it('merges the same customized item into one cart line', () => {
    const store = useCartStore();

    store.addItem(createItem({ id: 'cart-1', quantity: 1, modifiers: ['Soy on Side', 'Extra Wasabi'], note: 'Pack neatly' }));
    store.addItem(createItem({ id: 'cart-2', quantity: 2, modifiers: ['Extra Wasabi', 'Soy on Side'], note: 'Pack neatly' }));

    expect(store.items).toHaveLength(1);
    expect(store.items[0]?.quantity).toBe(3);
    expect(store.subtotal).toBe(450);
  });

  it('keeps separate cart lines for different customization choices', () => {
    const store = useCartStore();

    store.addItem(createItem({ id: 'cart-1', modifiers: ['Extra Wasabi'], note: '' }));
    store.addItem(createItem({ id: 'cart-2', modifiers: ['Soy on Side'], note: '' }));

    expect(store.items).toHaveLength(2);
    expect(store.itemsCount).toBe(2);
  });
  it('applies supported voucher codes and persists the versioned payload', async () => {
    const store = useCartStore();
    store.addItem(createItem({ quantity: 2 }));

    const result = store.applyVoucher('feast25');
    await nextTick();

    const persisted = JSON.parse(localStorage.getItem(storageKeys.cart) ?? '{}') as { version?: number; voucherCode?: string };

    expect(result.valid).toBe(true);
    expect(store.voucherCode).toBe('FEAST25');
    expect(store.voucherDiscount).toBe(25);
    expect(persisted.version).toBe(2);
    expect(persisted.voucherCode).toBe('FEAST25');
  });
});
