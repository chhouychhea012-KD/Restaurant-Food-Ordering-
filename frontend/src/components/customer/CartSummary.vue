<template>
  <div class="surface-card p-4 sm:p-5">
    <h3 class="text-lg font-bold text-slate-950">Cart Summary</h3>
    <div class="mt-4 space-y-3 text-sm text-slate-600">
      <div class="flex min-w-0 justify-between gap-4"><span class="mobile-text-wrap">Subtotal</span><span class="shrink-0">{{ formatCurrency(subtotal) }}</span></div>
      <div class="flex min-w-0 justify-between gap-4"><span class="mobile-text-wrap">Delivery fee</span><span class="shrink-0">{{ formatCurrency(deliveryFee) }}</span></div>
      <div class="flex min-w-0 justify-between gap-4"><span class="mobile-text-wrap">Discount</span><span class="shrink-0">-{{ formatCurrency(discount) }}</span></div>
      <div class="flex min-w-0 justify-between gap-4 border-t border-slate-200 pt-3 text-base font-bold text-slate-950">
        <span>Total</span>
        <span class="shrink-0">{{ formatCurrency(total) }}</span>
      </div>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { formatCurrency } from '@/utils/format';

defineProps<{
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
}>();
</script>
