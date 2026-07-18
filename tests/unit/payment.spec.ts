import { describe, expect, it } from 'vitest';
import { buildPaymentDetails, formatPaymentSummary, validatePayment } from '@/utils/payment';

const validForms = {
  visa: {
    cardholderName: 'Clara Customer',
    cardNumber: '4111 1111 1111 1111',
    expiry: '12/30',
    cvc: '123',
  },
  bank: {
    bankName: 'ABA Bank',
    accountName: 'Clara Customer',
    accountNumber: '1234567890',
  },
  paypal: {
    email: 'clara@example.com',
  },
  abaPayway: {
    accountName: 'Clara Customer',
    phone: '012345678',
  },
};

describe('checkout payment utilities', () => {
  it('accepts cash without extra payment details', () => {
    expect(validatePayment('cash', validForms)).toEqual([]);
    expect(formatPaymentSummary('cash', buildPaymentDetails('cash', validForms))).toBe('Cash on delivery');
  });

  it('validates Visa card details and creates a safe summary', () => {
    const details = buildPaymentDetails('visa_card', validForms);

    expect(validatePayment('visa_card', validForms, new Date('2026-07-19T00:00:00.000Z'))).toEqual([]);
    expect(details.last4).toBe('1111');
    expect(formatPaymentSummary('visa_card', details)).toBe('Visa ending 1111');
  });

  it('validates bank account details and creates a safe summary', () => {
    const details = buildPaymentDetails('bank_account', validForms);

    expect(validatePayment('bank_account', validForms)).toEqual([]);
    expect(details.bankName).toBe('ABA Bank');
    expect(details.last4).toBe('7890');
    expect(formatPaymentSummary('bank_account', details)).toBe('ABA Bank ending 7890');
  });

  it('validates PayPal details and creates a safe summary', () => {
    const details = buildPaymentDetails('paypal', validForms);

    expect(validatePayment('paypal', validForms)).toEqual([]);
    expect(details.email).toBe('clara@example.com');
    expect(formatPaymentSummary('paypal', details)).toBe('PayPal clara@example.com');
  });

  it('validates ABA PayWay details and creates a safe summary', () => {
    const details = buildPaymentDetails('aba_payway', validForms);

    expect(validatePayment('aba_payway', validForms)).toEqual([]);
    expect(details.phoneLast4).toBe('5678');
    expect(formatPaymentSummary('aba_payway', details)).toBe('ABA PayWay ending 5678');
  });

  it('returns clear issues for invalid card details', () => {
    const issues = validatePayment(
      'visa_card',
      {
        ...validForms,
        visa: { cardholderName: '', cardNumber: '5111', expiry: '01/20', cvc: '1' },
      },
      new Date('2026-07-19T00:00:00.000Z'),
    );

    expect(issues).toContain('Enter the cardholder name.');
    expect(issues).toContain('Enter a valid Visa card number.');
    expect(issues).toContain('Enter a valid future expiry date in MM/YY format.');
    expect(issues).toContain('Enter a valid card security code.');
  });
});