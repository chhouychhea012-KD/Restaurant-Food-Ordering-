import { describe, expect, it } from 'vitest';
import type { Address, Branch, CartItem, Restaurant } from '@/types';
import { evaluateBranchAvailability, validateCheckoutCart } from '@/utils/ordering';

const branch: Branch = {
  id: 'branch-1',
  name: 'Central Kitchen',
  zone: 'Bangkok Core',
  lat: 13.7563,
  lng: 100.5018,
  status: 'open',
  phone: '+66 800 000 001',
  averagePrepMinutes: 18,
  minimumOrderAmount: 180,
  operatingHours: [
    { day: 1, label: 'Mon', open: '09:00', close: '21:00', closed: false },
    { day: 2, label: 'Tue', open: '09:00', close: '21:00', closed: false },
  ],
  holidayClosures: [],
};

const restaurant: Restaurant = {
  id: 'rest-1',
  name: 'Demo Restaurant',
  slug: 'demo-restaurant',
  cuisine: ['Thai'],
  description: 'A seeded restaurant.',
  rating: 4.7,
  reviewCount: 120,
  deliveryTime: '20-30 min',
  deliveryFee: 29,
  heroColor: 'from-orange-500 to-amber-400',
  coverImage: 'https://example.com/cover.jpg',
  status: 'Open',
  verified: true,
  partnerStatus: 'verified',
  suspensionReason: null,
  commissionRate: 0.18,
  branches: [branch],
  menuCategories: [
    {
      id: 'cat-1',
      name: 'Bowls',
      items: [
        {
          id: 'item-1',
          name: 'Rice Bowl',
          description: 'Warm bowl',
          price: 150,
          image: 'https://example.com/item.jpg',
          available: true,
          prepTime: 15,
          modifiers: ['Extra Egg'],
        },
      ],
    },
  ],
  createdAt: '2026-07-01T10:00:00.000Z',
  updatedAt: '2026-07-01T10:00:00.000Z',
};

const address: Address = {
  id: 'addr-1',
  label: 'Home',
  line1: '88 Sukhumvit Road',
  district: 'Watthana',
  city: 'Bangkok',
  isDefault: true,
  lat: 13.7565,
  lng: 100.502,
};

const cartItem: CartItem = {
  id: 'cart-1',
  menuItemId: 'item-1',
  name: 'Rice Bowl',
  quantity: 1,
  price: 150,
  modifiers: ['Extra Egg'],
  note: '',
  restaurantId: 'rest-1',
  restaurantName: 'Demo Restaurant',
  branchId: 'branch-1',
  branchName: 'Central Kitchen',
  deliveryFee: 29,
  minimumOrderAmount: 180,
};

describe('ordering utilities', () => {
  it('marks a branch as closed when the current time is outside service hours', () => {
    const availability = evaluateBranchAvailability(branch, new Date(2026, 6, 13, 2, 0, 0));

    expect(availability.isOpen).toBe(false);
    expect(availability.label).toBe('Outside service hours');
  });

  it('flags checkout issues for minimum order and long-distance delivery', () => {
    const result = validateCheckoutCart({
      restaurant,
      branch,
      items: [cartItem],
      address: {
        ...address,
        lat: 13.9,
        lng: 100.8,
      },
    });

    expect(result.issues).toContain('Add 30 more to reach the branch minimum order amount.');
    expect(result.issues.some((issue) => issue.includes('outside the demo delivery zone'))).toBe(true);
  });
});

