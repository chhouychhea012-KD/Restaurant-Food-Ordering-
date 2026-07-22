<template>
  <div v-if="restaurant" class="space-y-6">
    <section class="surface-card overflow-hidden">
      <div class="relative h-64 bg-cover bg-center" :style="{ backgroundImage: `url(${restaurant.coverImage})` }">
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent" />
        <div class="absolute bottom-0 left-0 p-6 text-white sm:p-8">
          <StatusBadge :status="restaurant.status" :label="restaurant.status" />
          <h1 class="mt-3 text-3xl font-extrabold sm:text-4xl">{{ restaurant.name }}</h1>
          <p class="mt-3 max-w-3xl text-sm text-slate-200">{{ restaurant.description }}</p>
          <p class="mt-3 text-sm text-slate-200">
            {{ restaurant.cuisine.join(' • ') }} • {{ restaurant.deliveryTime }} • {{ formatCurrency(restaurant.deliveryFee) }} delivery fee
          </p>
        </div>
      </div>
    </section>

    <div class="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div class="space-y-6">
        <section class="surface-card p-5 sm:p-6">
          <div class="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div class="space-y-4">
              <div>
                <p class="text-xs font-bold uppercase tracking-[0.18em] text-brand-500">Branch</p>
                <h2 class="mt-2 text-xl font-bold text-slate-950">Select pickup kitchen</h2>
              </div>
              <label class="block text-sm font-semibold text-slate-700" for="branch-select">Branch</label>
              <select id="branch-select" v-model="selectedBranchId" class="field-input">
                <option v-for="branch in restaurant.branches" :key="branch.id" :value="branch.id">
                  {{ branch.name }} • {{ branch.zone }}
                </option>
              </select>
            </div>

            <div class="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <p class="text-sm font-semibold text-slate-900">{{ activeBranch?.name }}</p>
              <p class="mt-1 text-sm text-slate-500">{{ activeBranch?.zone }}</p>
              <div class="mt-4 flex flex-wrap gap-2">
                <span class="pill bg-brand-100 text-brand-700">{{ branchAvailability.label }}</span>
                <span class="pill bg-white text-slate-700">Minimum {{ formatCurrency(activeBranch?.minimumOrderAmount ?? 0) }}</span>
              </div>
              <p class="mt-4 text-sm text-slate-600">{{ branchAvailability.detail }}</p>
            </div>
          </div>

          <div v-if="cartConflictNotice" class="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {{ cartConflictNotice }}
          </div>
          <div v-if="feedbackMessage" class="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {{ feedbackMessage }}
          </div>
        </section>

        <section v-for="category in displayedCategories" :key="category.id" class="space-y-4">
          <div class="px-1">
            <p class="text-xs font-bold uppercase tracking-[0.18em] text-brand-500">{{ category.name }}</p>
            <h2 class="mt-2 text-xl font-bold text-slate-950">{{ category.items.length }} menu picks</h2>
            <p class="mt-2 text-sm text-slate-500">
              {{ isFocusedProductView ? 'Focused item view.' : 'Choose an item to customize.' }}
            </p>
          </div>

          <div class="grid gap-5">
            <MenuItemCard v-for="item in category.items" :key="item.id" :category="category.name" :item="item">
              <button v-if="canOrder" class="btn-primary" :disabled="!item.available || !branchAvailability.isOpen" @click="openConfigurator(item)">
                {{ item.available ? 'Customize' : 'Unavailable' }}
              </button>
              <button v-else class="btn-secondary" disabled>Customer only</button>
            </MenuItemCard>
          </div>
        </section>

        <EmptyState
          v-if="!displayedCategories.length"
          title="Product not found"
          message="The selected product could not be found in this restaurant menu."
        />
      </div>

      <CartSummary v-if="canOrder" :subtotal="subtotal" :delivery-fee="deliveryFee" :discount="discount" :total="total">
        <div class="mt-5 space-y-3 text-sm text-slate-600">
          <div class="flex items-center justify-between">
            <span>Cart items</span>
            <span class="font-semibold text-slate-900">{{ cartStore.itemsCount }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span>Selected branch</span>
            <span class="font-semibold text-slate-900">{{ cartStore.branchName ?? activeBranch?.name ?? 'Not set' }}</span>
          </div>
        </div>
        <RouterLink to="/cart" class="btn-primary mt-5 w-full">Go to cart</RouterLink>
      </CartSummary>
    </div>
  </div>
  <EmptyState v-else title="Restaurant not found" message="This restaurant could not be loaded from the local dataset." />

  <AppModal
    :open="Boolean(configuringItem)"
    eyebrow="Menu Item"
    :title="configuringItem?.name ?? 'Customize order item'"
    :description="configuringItem?.description ?? 'Choose quantity and options.'"
    size="md"
    @close="closeConfigurator"
  >
    <div v-if="configuringItem" class="space-y-5">
      <img :src="configuringItem.image" :alt="configuringItem.name" class="h-56 w-full rounded-lg object-cover" />
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <p class="text-sm font-semibold text-slate-900">Branch</p>
          <p class="mt-2 text-sm text-slate-600">{{ activeBranch?.name }} • {{ activeBranch?.zone }}</p>
        </div>
        <div>
          <p class="text-sm font-semibold text-slate-900">Price</p>
          <p class="mt-2 text-sm text-slate-600">{{ formatCurrency(configuringItem.price) }} each</p>
        </div>
      </div>

      <div>
        <p class="text-sm font-semibold text-slate-900">Quantity</p>
        <div class="mt-3 flex items-center gap-3">
          <button class="btn-secondary px-3 py-2" type="button" @click="quantity = Math.max(1, quantity - 1)">-</button>
          <span class="min-w-10 text-center text-base font-semibold text-slate-950">{{ quantity }}</span>
          <button class="btn-secondary px-3 py-2" type="button" @click="quantity += 1">+</button>
        </div>
      </div>

      <div v-if="configuringItem.modifiers.length">
        <p class="text-sm font-semibold text-slate-900">Optional modifiers</p>
        <div class="mt-3 flex flex-wrap gap-2">
          <button
            v-for="modifier in configuringItem.modifiers"
            :key="modifier"
            class="rounded-full border px-4 py-2 text-sm font-semibold transition"
            :class="selectedModifiers.includes(modifier) ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'"
            type="button"
            @click="toggleModifier(modifier)"
          >
            {{ modifier }}
          </button>
        </div>
      </div>

      <div>
        <label class="field-label" for="special-note">Special instructions</label>
        <textarea id="special-note" v-model="specialInstructions" class="field-input min-h-28" placeholder="No onions, pack sauce separately, extra cutlery, and so on." />
      </div>

      <div class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
        <div class="flex items-center justify-between text-sm text-slate-600">
          <span>Item total</span>
          <span class="text-base font-bold text-slate-950">{{ formatCurrency(itemTotal) }}</span>
        </div>
      </div>

      <div class="flex flex-wrap gap-3">
        <button class="btn-primary" type="button" :disabled="!branchAvailability.isOpen" @click="addConfiguredItem">
          Add to cart
        </button>
        <button class="btn-secondary" type="button" @click="closeConfigurator">Cancel</button>
      </div>
    </div>
  </AppModal>

  <AppModal
    :open="replaceCartDialogOpen"
    eyebrow="Cart Confirmation"
    title="Replace your current cart?"
    description="This will clear the current cart."
    size="md"
    @close="closeReplaceDialog"
  >
    <div class="space-y-4 text-sm text-slate-600">
      <p>
        Current cart: <span class="font-semibold text-slate-900">{{ cartStore.restaurantName }} • {{ cartStore.branchName }}</span>
      </p>
      <p>
        New item source: <span class="font-semibold text-slate-900">{{ restaurant?.name }} • {{ activeBranch?.name }}</span>
      </p>
      <div class="flex flex-wrap gap-3 pt-2">
        <button class="btn-primary" type="button" @click="confirmReplaceCart">Clear cart and add item</button>
        <button class="btn-secondary" type="button" @click="closeReplaceDialog">Keep current cart</button>
      </div>
    </div>
  </AppModal>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import AppModal from '@/components/common/AppModal.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import CartSummary from '@/components/customer/CartSummary.vue';
import MenuItemCard from '@/components/restaurants/MenuItemCard.vue';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { useRestaurantStore } from '@/stores/restaurant.store';
import type { MenuCategory, MenuItem, Restaurant } from '@/types';
import { formatCurrency } from '@/utils/format';
import { evaluateBranchAvailability, getBranchById } from '@/utils/ordering';

const route = useRoute();
const authStore = useAuthStore();
const restaurantStore = useRestaurantStore();
const cartStore = useCartStore();
const restaurant = ref<Restaurant | null>(null);
const selectedBranchId = ref('');
const configuringItem = ref<MenuItem | null>(null);
const quantity = ref(1);
const selectedModifiers = ref<string[]>([]);
const specialInstructions = ref('');
const feedbackMessage = ref('');
const replaceCartDialogOpen = ref(false);

const subtotal = computed(() => cartStore.subtotal);
const canOrder = computed(() => !authStore.isAuthenticated || authStore.hasPermission('orders.create'));
const deliveryFee = computed(() => cartStore.deliveryFee);
const discount = computed(() => cartStore.discount);
const total = computed(() => cartStore.total);
const selectedItemId = computed(() => (typeof route.query.item === 'string' ? route.query.item : ''));
const isFocusedProductView = computed(() => Boolean(selectedItemId.value));
const activeBranch = computed(() => getBranchById(restaurant.value, selectedBranchId.value));
const branchAvailability = computed(() => evaluateBranchAvailability(activeBranch.value));
const itemTotal = computed(() => (configuringItem.value ? configuringItem.value.price * quantity.value : 0));
const cartConflictNotice = computed(() => {
  if (!cartStore.items.length || !restaurant.value || !activeBranch.value) {
    return '';
  }

  if (cartStore.restaurantId === restaurant.value.id && cartStore.branchId === activeBranch.value.id) {
    return '';
  }

  return `Current cart: ${cartStore.restaurantName} / ${cartStore.branchName}.`;
});

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

  return filteredCategories;
});

async function loadRestaurant() {
  restaurant.value = await restaurantStore.loadBySlug(route.params.slug as string);
  selectedBranchId.value = restaurant.value?.branches[0]?.id ?? '';
  feedbackMessage.value = '';
}

function openConfigurator(item: MenuItem) {
  if (!canOrder.value) {
    return;
  }

  feedbackMessage.value = '';
  configuringItem.value = item;
  quantity.value = 1;
  selectedModifiers.value = [];
  specialInstructions.value = '';
}

function closeConfigurator() {
  configuringItem.value = null;
  quantity.value = 1;
  selectedModifiers.value = [];
  specialInstructions.value = '';
}

function toggleModifier(modifier: string) {
  if (selectedModifiers.value.includes(modifier)) {
    selectedModifiers.value = selectedModifiers.value.filter((entry) => entry !== modifier);
    return;
  }

  selectedModifiers.value = [...selectedModifiers.value, modifier];
}

function addConfiguredItem() {
  if (!restaurant.value || !activeBranch.value || !configuringItem.value) {
    return;
  }

  const result = cartStore.addItem({
    id: `cart-${crypto.randomUUID()}`,
    menuItemId: configuringItem.value.id,
    name: configuringItem.value.name,
    quantity: quantity.value,
    price: configuringItem.value.price,
    modifiers: [...selectedModifiers.value],
    note: specialInstructions.value.trim(),
    restaurantId: restaurant.value.id,
    restaurantName: restaurant.value.name,
    branchId: activeBranch.value.id,
    branchName: activeBranch.value.name,
    deliveryFee: restaurant.value.deliveryFee,
    minimumOrderAmount: activeBranch.value.minimumOrderAmount ?? 0,
  });

  if (result.status === 'requires_confirmation') {
    replaceCartDialogOpen.value = true;
    closeConfigurator();
    return;
  }

  feedbackMessage.value = `${configuringItem.value.name} added.`;
  closeConfigurator();
}

function confirmReplaceCart() {
  const result = cartStore.confirmPendingReplacement();
  replaceCartDialogOpen.value = false;
  if (result.status === 'replaced') {
    feedbackMessage.value = 'Cart replaced.';
  }
}

function closeReplaceDialog() {
  replaceCartDialogOpen.value = false;
  cartStore.cancelPendingReplacement();
}

onMounted(loadRestaurant);
watch(() => route.params.slug, loadRestaurant);
</script>
