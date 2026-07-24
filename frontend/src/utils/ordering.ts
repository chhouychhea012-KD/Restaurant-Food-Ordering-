import type { Address, Branch, CartItem, Restaurant } from '@/types';

export interface BranchAvailability {
  isOpen: boolean;
  label: string;
  detail: string;
}

export interface CheckoutValidationResult {
  issues: string[];
  warnings: string[];
  distanceKm: number | null;
}

function toMinutes(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatTimeLabel(value: string) {
  const [hoursRaw, minutesRaw] = value.split(':');
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

export function calculateDistanceKm(fromLat: number, fromLng: number, toLat: number, toLng: number) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const latDistance = toRadians(toLat - fromLat);
  const lngDistance = toRadians(toLng - fromLng);
  const originLat = toRadians(fromLat);
  const destinationLat = toRadians(toLat);

  const a =
    Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
    Math.sin(lngDistance / 2) * Math.sin(lngDistance / 2) * Math.cos(originLat) * Math.cos(destinationLat);

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getBranchById(restaurant: Restaurant | null | undefined, branchId: string | null | undefined) {
  if (!restaurant || !branchId) {
    return null;
  }

  return restaurant.branches.find((branch) => branch.id === branchId) ?? null;
}

export function evaluateBranchAvailability(branch: Branch | null | undefined, now = new Date()): BranchAvailability {
  if (!branch) {
    return {
      isOpen: false,
      label: 'Branch unavailable',
      detail: 'Select a branch before adding items to the cart.',
    };
  }

  if (branch.status === 'suspended') {
    return {
      isOpen: false,
      label: 'Suspended',
      detail: 'This branch is currently suspended and cannot accept orders.',
    };
  }

  if (branch.status === 'paused') {
    return {
      isOpen: false,
      label: 'Temporarily paused',
      detail: 'This branch paused new orders for a short operational break.',
    };
  }

  if (branch.status === 'closed') {
    return {
      isOpen: false,
      label: 'Closed',
      detail: 'This branch is marked closed and is not accepting orders right now.',
    };
  }

  const today = now.toISOString().slice(0, 10);
  const holiday = branch.holidayClosures?.find((entry) => entry.date === today);
  if (holiday) {
    return {
      isOpen: false,
      label: 'Holiday closure',
      detail: `${branch.name} is closed today for ${holiday.label}.`,
    };
  }

  const hours = branch.operatingHours?.find((entry) => entry.day === now.getDay());
  if (!hours || hours.closed) {
    return {
      isOpen: false,
      label: 'Closed today',
      detail: `${branch.name} is not scheduled to open today.`,
    };
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = toMinutes(hours.open);
  const closeMinutes = toMinutes(hours.close);
  const isOvernight = closeMinutes <= openMinutes;
  const isOpen = isOvernight
    ? currentMinutes >= openMinutes || currentMinutes <= closeMinutes
    : currentMinutes >= openMinutes && currentMinutes <= closeMinutes;

  if (!isOpen) {
    return {
      isOpen: false,
      label: 'Outside service hours',
      detail: `${branch.name} serves orders from ${formatTimeLabel(hours.open)} to ${formatTimeLabel(hours.close)}.`,
    };
  }

  return {
    isOpen: true,
    label: 'Open now',
    detail: `${branch.name} is serving orders until ${formatTimeLabel(hours.close)}.`,
  };
}

export function validateCheckoutCart(params: {
  restaurant: Restaurant | null;
  branch: Branch | null;
  items: CartItem[];
  address: Address | null;
}) {
  const { restaurant, branch, items, address } = params;
  const issues: string[] = [];
  const warnings: string[] = [];

  if (!restaurant) {
    issues.push('The selected restaurant could not be loaded.');
  }

  if (restaurant?.partnerStatus === 'suspended') {
    issues.push('This restaurant is suspended and cannot accept new orders.');
  }

  if (restaurant?.partnerStatus === 'rejected') {
    issues.push('This restaurant is not approved for new customer orders.');
  }

  if (restaurant && !['open', 'active'].includes(restaurant.status.toLowerCase())) {
    warnings.push(`${restaurant.name} is currently marked ${restaurant.status}.`);
  }

  const branchAvailability = evaluateBranchAvailability(branch);
  if (!branchAvailability.isOpen) {
    const hardBlocked = ['Suspended', 'Temporarily paused', 'Closed', 'Holiday closure', 'Branch unavailable'].includes(branchAvailability.label);
    if (hardBlocked) {
      issues.push(branchAvailability.detail);
    } else {
      warnings.push(branchAvailability.detail);
    }
  }

  if (!items.length) {
    issues.push('Your cart is empty.');
  }

  if (branch && items.length) {
    const minimumOrderAmount = items[0]?.minimumOrderAmount ?? branch.minimumOrderAmount ?? 0;
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (subtotal < minimumOrderAmount) {
      issues.push(`Add ${minimumOrderAmount - subtotal} more to reach the branch minimum order amount.`);
    }
  }

  if (!address) {
    issues.push('Choose a delivery address before placing the order.');
  }

  let distanceKm: number | null = null;
  if (branch && address) {
    distanceKm = calculateDistanceKm(branch.lat, branch.lng, address.lat, address.lng);
    if (distanceKm > 15) {
      issues.push(`The selected address is outside the demo delivery zone at ${distanceKm.toFixed(1)} km away.`);
    } else if (distanceKm > 10) {
      warnings.push(`Delivery coverage is still available, but the destination is ${distanceKm.toFixed(1)} km from the branch.`);
    }
  }

  if (restaurant && items.length) {
    const menuItems = new Map(
      restaurant.menuCategories.flatMap((category) => category.items.map((item) => [item.id, item] as const)),
    );

    for (const item of items) {
      const currentItem = menuItems.get(item.menuItemId ?? item.id);
      if (!currentItem) {
        issues.push(`${item.name} is no longer listed on the restaurant menu.`);
        continue;
      }

      if (!currentItem.available) {
        issues.push(`${item.name} is currently unavailable.`);
      }

      if (currentItem.price !== item.price) {
        issues.push(`${item.name} changed price from ${item.price} to ${currentItem.price}. Refresh the cart before checkout.`);
      }

      const unavailableModifiers = (item.modifiers ?? []).filter((modifier) => !currentItem.modifiers.includes(modifier));
      if (unavailableModifiers.length) {
        warnings.push(`${item.name} has modifier selections that are no longer available: ${unavailableModifiers.join(', ')}.`);
      }
    }
  }

  return {
    issues: [...new Set(issues)],
    warnings: [...new Set(warnings)],
    distanceKm,
  } satisfies CheckoutValidationResult;
}
