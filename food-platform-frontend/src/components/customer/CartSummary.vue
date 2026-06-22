<template>
  <div class="surface-card p-5">
    <h3 class="text-lg font-bold text-slate-950">Cart Summary</h3>
    <div class="mt-4 space-y-3 text-sm text-slate-600">
      <div class="flex justify-between"><span>Subtotal</span><span>{{ formatCurrency(subtotal) }}</span></div>
      <div class="flex justify-between"><span>Delivery fee</span><span>{{ formatCurrency(deliveryFee) }}</span></div>
      <div class="flex justify-between"><span>Discount</span><span>-{{ formatCurrency(discount) }}</span></div>
      <div class="flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-950">
        <span>Total</span>
        <span>{{ formatCurrency(total) }}</span>
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
