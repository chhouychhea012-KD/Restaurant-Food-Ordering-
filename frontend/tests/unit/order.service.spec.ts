import { describe, expect, it } from 'vitest';
import { listRiderOrders } from '@/services/order.service';

describe('order service role scoping', () => {
  it('returns only orders assigned to the requested rider', async () => {
    const orders = await listRiderOrders('Rico Rider');

    expect(orders.length).toBeGreaterThan(0);
    expect(orders.every((order) => order.riderName === 'Rico Rider')).toBe(true);
  });

  it('does not expose assigned orders to another rider', async () => {
    await expect(listRiderOrders('Mina Rider')).resolves.toEqual([]);
  });
});