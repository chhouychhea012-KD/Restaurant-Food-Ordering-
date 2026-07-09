<template>
  <div v-if="restaurant" class="space-y-6">
    <section class="surface-card overflow-hidden">
      <div class="relative h-72 bg-cover bg-center" :style="{ backgroundImage: `url(${restaurant.coverImage})` }">
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div class="absolute bottom-0 left-0 p-6 text-white sm:p-8">
          <StatusBadge :status="restaurant.status" :label="restaurant.status" />
          <h1 class="mt-4 text-4xl font-extrabold">{{ restaurant.name }}</h1>
          <p class="mt-3 text-sm text-slate-200">{{ restaurant.cuisine.join(' • ') }} • {{ restaurant.deliveryTime }} • ${{ restaurant.deliveryFee }} delivery fee</p>
        </div>
      </div>
    </section>

    <div class="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div class="space-y-8">
        <section v-for="category in displayedCategories" :key="category.id" class="space-y-4">
          <div class="px-1">
            <p class="text-xs font-bold uppercase tracking-[0.3em] text-brand-500">{{ category.name }}</p>
            <h2 class="mt-2 text-2xl font-bold text-slate-950">{{ category.items.length }} menu picks</h2>
            <p class="mt-2 text-sm text-slate-500">
              {{ isFocusedProductView ? 'Showing only the product you selected from the category preview.' : 'Choose from the full category lineup and add any item to your cart.' }}
            </p>
          </div>

          <div class="grid gap-5 lg:grid-cols-2">
            <MenuItemCard v-for="item in category.items" :key="item.id" :category="category.name" :item="item">
              <button class="btn-primary" @click="addToCart(item)">Add to cart</button>
            </MenuItemCard>
          </div>
        </section>

        <EmptyState
          v-if="!displayedCategories.length"
          title="Product not found"
          message="The selected product could not be found in this restaurant menu."
        />
      </div>
      <CartSummary :subtotal="subtotal" :delivery-fee="deliveryFee" :discount="discount" :total="total">
        <RouterLink to="/cart" class="btn-primary mt-5 w-full">Go to cart</RouterLink>
      </CartSummary>
    </div>
  </div>
  <EmptyState v-else title="Restaurant not found" message="This restaurant could not be loaded from the local dataset." />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import type { MenuCategory, MenuItem, Restaurant } from '@/types';
import CartSummary from '@/components/customer/CartSummary.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import MenuItemCard from '@/components/restaurants/MenuItemCard.vue';
import { useCartStore } from '@/stores/cart.store';
import { useRestaurantStore } from '@/stores/restaurant.store';

const route = useRoute();
const restaurantStore = useRestaurantStore();
const cartStore = useCartStore();
const restaurant = ref<Restaurant | null>(null);

const subtotal = computed(() => cartStore.subtotal);
const deliveryFee = computed(() => cartStore.deliveryFee);
const discount = computed(() => cartStore.discount);
const total = computed(() => cartStore.total);
const selectedItemId = computed(() => (typeof route.query.item === 'string' ? route.query.item : ''));
const isFocusedProductView = computed(() => Boolean(selectedItemId.value));

const displayedCategories = computed<MenuCategory[]>(() => {
  if (!restaurant.value) {
    return [];
  }

  if (!selectedItemId.value) {
    return restaurant.value.menuCategories;
  }

  const filteredCategories = restaurant.value.menuCategories
    .map((category) => ({
      ...category,
      items: category.items.filter((item) => item.id === selectedItemId.value),
    }))
    .filter((category) => category.items.length);

  return filteredCategories.length ? filteredCategories : restaurant.value.menuCategories;
});

async function loadRestaurant() {
  restaurant.value = await restaurantStore.loadBySlug(route.params.slug as string);
}

onMounted(loadRestaurant);
watch(() => route.params.slug, loadRestaurant);

function addToCart(item: MenuItem) {
  if (!restaurant.value) {
    return;
  }
  try {
    cartStore.addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      restaurantId: restaurant.value.id,
      restaurantName: restaurant.value.name,
    });
  } catch (error) {
    window.alert(error instanceof Error ? error.message : 'Unable to add item.');
  }
}
</script>
