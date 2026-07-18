import { describe, expect, it } from 'vitest';
import orders from '@/assets/data/orders.json';
import type { Order } from '@/types';
import { buildInvoicePdf, createInvoicePdfBlob } from '@/utils/invoice-pdf';

const order = orders[0] as Order;
const formatter = {
  currency: (value: number) => `$${value}`,
  dateTime: (value: string) => new Date(value).toISOString(),
  payment: () => 'Cash on delivery',
  status: (value: string) => value,
};

describe('invoice PDF', () => {
  it('builds a PDF document for an order invoice', () => {
    const pdf = buildInvoicePdf(order, formatter);

    expect(pdf.startsWith('%PDF-1.4')).toBe(true);
    expect(pdf).toContain(`Invoice ${order.id}`);
    expect(pdf).toContain('Flavor Fleet Invoice');
  });

  it('creates a downloadable PDF blob', () => {
    const blob = createInvoicePdfBlob(order, formatter);

    expect(blob.type).toBe('application/pdf');
    expect(blob.size).toBeGreaterThan(500);
  });
});