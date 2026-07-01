<template>
  <footer class="mt-10 border-t border-slate-200 bg-white">
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div class="grid gap-10 md:grid-cols-2 lg:grid-cols-12">
        
        <!-- Brand -->
        <div class="lg:col-span-5">
          <AppLogo />
          <p class="mt-4 text-slate-600 max-w-md">
            Simple, fast, and reliable food delivery.
          </p>
          
          <div class="mt-8 flex gap-8">
            <div>
              <p class="text-xs uppercase tracking-widest text-orange-500 font-semibold">Delivery</p>
              <p class="text-2xl font-semibold text-slate-900 mt-1">City-wide</p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-widest text-sky-500 font-semibold">Secure</p>
              <p class="text-2xl font-semibold text-slate-900 mt-1">Checkout</p>
            </div>
          </div>
        </div>

        <!-- For Customers - Cleaned Up -->
        <div class="lg:col-span-4">
          <p class="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-6">For Customers</p>
          
          <div class="space-y-8">
            <div class="flex gap-4">
              <div class="w-6 h-6 rounded-full bg-orange-100 flex-shrink-0 flex items-center justify-center text-orange-500 text-sm font-medium mt-0.5">1</div>
              <div>
                <p class="font-medium text-slate-900">Order in Minutes</p>
                <p class="text-sm text-slate-600 mt-1">Browse restaurants, add to cart, and checkout securely.</p>
              </div>
            </div>

            <div class="flex gap-4">
              <div class="w-6 h-6 rounded-full bg-sky-100 flex-shrink-0 flex items-center justify-center text-sky-500 text-sm font-medium mt-0.5">2</div>
              <div>
                <p class="font-medium text-slate-900">Live Tracking</p>
                <p class="text-sm text-slate-600 mt-1">Follow your order from kitchen to your doorstep in real-time.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="lg:col-span-3">
          <p class="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-6">Quick Links</p>
          <div class="flex flex-col gap-3 text-sm">
            <RouterLink to="/" class="text-slate-600 hover:text-slate-900 transition">Home</RouterLink>
            <RouterLink to="/restaurants" class="text-slate-600 hover:text-slate-900 transition">Restaurants</RouterLink>
            <!-- <RouterLink to="/categories" class="text-slate-600 hover:text-slate-900 transition">Categories</RouterLink> -->
            <RouterLink to="/track-order" class="text-slate-600 hover:text-slate-900 transition">Track Order</RouterLink>
            <RouterLink to="/auth/login" class="text-slate-600 hover:text-slate-900 transition">Login</RouterLink>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between text-sm text-slate-500">
        <p>© {{ currentYear }} Flavor Fleet. All rights reserved.</p>
        <div class="flex gap-6 mt-4 md:mt-0 text-xs uppercase tracking-widest">
          <span>Fast Delivery</span>
          <span>Secure Payments</span>
          <span>Real-time Tracking</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import AppLogo from './AppLogo.vue';

const currentYear = new Date().getFullYear();
</script>