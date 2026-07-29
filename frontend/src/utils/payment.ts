export type CheckoutPaymentMethod = 'cash' | 'visa_card' | 'paypal' | 'aba_payway' | 'bakong';

export interface VisaPaymentDetails {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
}


export interface PaypalPaymentDetails {
  email: string;
}

export interface AbaPaywayPaymentDetails {
  accountName: string;
  phone: string;
}

export interface BakongPaymentDetails {
  accountName: string;
  phone: string;
}

export interface PaymentDetailsPayload {
  provider: 'cash' | 'visa' | 'paypal' | 'aba_payway' | 'bakong';
  label: string;
  last4?: string;
  accountName?: string;
  email?: string;
  phoneLast4?: string;
}

export interface CheckoutPaymentForms {
  visa: VisaPaymentDetails;
  paypal: PaypalPaymentDetails;
  abaPayway: AbaPaywayPaymentDetails;
  bakong: BakongPaymentDetails;
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

function isFutureExpiry(value: string, referenceDate = new Date()) {
  const match = value.trim().match(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/);
  if (!match) {
    return false;
  }

  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  const expiryEnd = new Date(year, month, 0, 23, 59, 59, 999);
  return expiryEnd >= referenceDate;
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function validatePayment(method: CheckoutPaymentMethod, forms: CheckoutPaymentForms, referenceDate = new Date()) {
  const issues: string[] = [];

  if (method === 'cash') {
    return issues;
  }

  if (method === 'visa_card') {
    const cardNumber = digitsOnly(forms.visa.cardNumber);
    const cvc = digitsOnly(forms.visa.cvc);

    if (forms.visa.cardholderName.trim().length < 3) {
      issues.push('Enter the cardholder name.');
    }
    if (!cardNumber.startsWith('4') || cardNumber.length < 13 || cardNumber.length > 19) {
      issues.push('Enter a valid Visa card number.');
    }
    if (!isFutureExpiry(forms.visa.expiry, referenceDate)) {
      issues.push('Enter a valid future expiry date in MM/YY format.');
    }
    if (cvc.length < 3 || cvc.length > 4) {
      issues.push('Enter a valid card security code.');
    }
  }


  if (method === 'paypal') {
    if (!isEmail(forms.paypal.email)) {
      issues.push('Enter a valid PayPal email address.');
    }
  }

  if (method === 'aba_payway') {
    const phone = digitsOnly(forms.abaPayway.phone);
    if (forms.abaPayway.accountName.trim().length < 3) {
      issues.push('Enter the ABA account name.');
    }
    if (phone.length < 8 || phone.length > 15) {
      issues.push('Enter a valid ABA phone number.');
    }
  }

  if (method === 'bakong') {
    const phone = digitsOnly(forms.bakong.phone);
    if (forms.bakong.accountName.trim().length < 3) {
      issues.push('Enter the Bakong account name.');
    }
    if (phone.length < 8 || phone.length > 15) {
      issues.push('Enter a valid Bakong phone number.');
    }
  }

  return issues;
}

export function buildPaymentDetails(method: CheckoutPaymentMethod, forms: CheckoutPaymentForms): PaymentDetailsPayload {
  if (method === 'visa_card') {
    const cardNumber = digitsOnly(forms.visa.cardNumber);
    return {
      provider: 'visa',
      label: 'Visa card',
      last4: cardNumber.slice(-4),
      accountName: forms.visa.cardholderName.trim(),
    };
  }


  if (method === 'paypal') {
    return {
      provider: 'paypal',
      label: 'PayPal',
      email: forms.paypal.email.trim().toLowerCase(),
    };
  }

  if (method === 'aba_payway') {
    const phone = digitsOnly(forms.abaPayway.phone);
    return {
      provider: 'aba_payway',
      label: 'ABA PayWay',
      accountName: forms.abaPayway.accountName.trim(),
      phoneLast4: phone.slice(-4),
    };
  }

  if (method === 'bakong') {
    const phone = digitsOnly(forms.bakong.phone);
    return {
      provider: 'bakong',
      label: 'Bakong',
      accountName: forms.bakong.accountName.trim(),
      phoneLast4: phone.slice(-4),
    };
  }

  return {
    provider: 'cash',
    label: 'Cash on delivery',
  };
}

export function formatPaymentSummary(method: CheckoutPaymentMethod, details?: PaymentDetailsPayload) {
  if (method === 'visa_card') {
    return `Visa ending ${details?.last4 || 'demo'}`;
  }


  if (method === 'paypal') {
    return `PayPal ${details?.email || 'demo account'}`;
  }

  if (method === 'aba_payway') {
    return `ABA PayWay ending ${details?.phoneLast4 || 'demo'}`;
  }

  if (method === 'bakong') {
    return `Bakong ending ${details?.phoneLast4 || 'demo'}`;
  }

  return 'Cash on delivery';
}