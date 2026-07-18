<template>
  <div class="space-y-6">
    <SectionCard eyebrow="Menu Management" title="Assigned restaurant products" description="Manage products, categories, modifiers, and availability for your owned restaurant.">
      <template #actions>
        <div class="flex flex-wrap gap-3">
          <input v-model="query" class="field-input w-64" type="search" placeholder="Search product or category" />
          <button class="btn-secondary" type="button" @click="openCreateCategoryModal">Create category</button>
          <button class="btn-primary" type="button" @click="openCreateProductModal">Create item</button>
        </div>
      </template>

      <div v-if="!restaurant" class="space-y-4">
        <EmptyState title="No assigned restaurant" message="This owner account does not currently have a restaurant assignment." />
      </div>

      <div v-else class="space-y-6">
        <div class="grid gap-4 md:grid-cols-3">
          <div class="surface-muted rounded-lg p-5">
            <p class="text-sm font-semibold text-slate-500">Categories</p>
            <p class="mt-3 text-3xl font-bold text-slate-950">{{ restaurant.menuCategories.length }}</p>
          </div>
          <div class="surface-muted rounded-lg p-5">
            <p class="text-sm font-semibold text-slate-500">Products</p>
            <p class="mt-3 text-3xl font-bold text-slate-950">{{ totalItems }}</p>
          </div>
          <div class="surface-muted rounded-lg p-5">
            <p class="text-sm font-semibold text-slate-500">Available now</p>
            <p class="mt-3 text-3xl font-bold text-slate-950">{{ availableItems }}</p>
          </div>
        </div>

        <div class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div class="thin-scrollbar overflow-x-auto">
            <table class="w-full min-w-[920px] text-left text-sm">
              <thead class="bg-slate-50 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                <tr>
                  <th class="px-5 py-4">Product</th>
                  <th class="px-5 py-4">Category</th>
                  <th class="px-5 py-4">Modifiers</th>
                  <th class="px-5 py-4">Status</th>
                  <th class="px-5 py-4">Prep</th>
                  <th class="px-5 py-4">Price</th>
                  <th class="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody v-if="filteredProducts.length" class="divide-y divide-slate-100">
                <tr v-for="product in filteredProducts" :key="product.item.id" class="transition hover:bg-orange-50/40">
                  <td class="px-5 py-4">
                    <div class="flex min-w-0 items-center gap-3">
                      <img :src="product.item.image" :alt="product.item.name" class="h-12 w-12 rounded-lg object-cover" />
                      <div class="min-w-0">
                        <p class="truncate font-bold text-slate-950">{{ product.item.name }}</p>
                        <p class="mt-1 max-w-64 truncate text-xs text-slate-500">{{ product.item.description }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-5 py-4"><span class="pill bg-slate-100 text-slate-700">{{ product.categoryName }}</span></td>
                  <td class="px-5 py-4 text-slate-600">{{ product.item.modifiers.length ? product.item.modifiers.slice(0, 2).join(', ') : 'None' }}</td>
                  <td class="px-5 py-4"><span class="pill" :class="product.item.available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'">{{ product.item.available ? 'Available' : 'Paused' }}</span></td>
                  <td class="px-5 py-4 text-slate-600">{{ product.item.prepTime }} min</td>
                  <td class="px-5 py-4 font-bold text-slate-950">{{ formatCurrency(product.item.price) }}</td>
                  <td class="px-5 py-4">
                    <div class="relative flex justify-end">
                      <button class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-900" type="button" @click.stop="toggleProductMenu(product.item.id)">
                        <MoreVertical :size="18" />
                      </button>
                      <div v-if="openActionMenuProductId === product.item.id" class="absolute right-0 top-11 z-30 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
                        <button class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50" type="button" @click="editProductFromMenu(product.item.id)"><Pencil :size="15" /> Edit</button>
                        <button class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50" type="button" @click="availabilityFromMenu(product.item.id)"><ToggleLeft :size="15" /> {{ product.item.available ? 'Pause' : 'Activate' }}</button>
                        <button class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50" type="button" @click="deleteProductFromMenu(product.item.id)"><Trash2 :size="15" /> Delete</button>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <EmptyState v-if="!filteredProducts.length" title="No products found" message="Create a product or adjust the search filter." class="border-t border-slate-100" />
        </div>
      </div>

      <p v-if="message" class="mt-5 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ message }}</p>
      <p v-if="error" class="mt-5 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600">{{ error }}</p>
    </SectionCard>

    <SectionCard v-if="restaurant" eyebrow="Category Control" title="Categories" description="Keep menu groups clean for customer browsing.">
      <template #actions>
        <button class="btn-primary" type="button" @click="openCreateCategoryModal">Create category</button>
      </template>

      <div class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="thin-scrollbar overflow-x-auto">
          <table class="w-full min-w-[680px] text-left text-sm">
            <thead class="bg-slate-50 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              <tr>
                <th class="px-5 py-4">Category</th>
                <th class="px-5 py-4">Products</th>
                <th class="px-5 py-4">Available</th>
                <th class="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody v-if="filteredCategories.length" class="divide-y divide-slate-100">
              <tr v-for="category in filteredCategories" :key="category.id" class="transition hover:bg-orange-50/40">
                <td class="px-5 py-4 font-bold text-slate-950">{{ category.name }}</td>
                <td class="px-5 py-4"><span class="pill bg-slate-100 text-slate-700">{{ category.items.length }} items</span></td>
                <td class="px-5 py-4 text-slate-600">{{ category.items.filter((item) => item.available).length }} active</td>
                <td class="px-5 py-4">
                  <div class="relative flex justify-end">
                    <button class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-900" type="button" @click.stop="toggleCategoryMenu(category.id)">
                      <MoreVertical :size="18" />
                    </button>
                    <div v-if="openActionMenuCategoryId === category.id" class="absolute right-0 top-11 z-30 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
                      <button class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50" type="button" @click="editCategoryFromMenu(category.id)"><Pencil :size="15" /> Edit</button>
                      <button class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50" type="button" @click="deleteCategoryFromMenu(category.id)"><Trash2 :size="15" /> Delete</button>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <EmptyState v-if="!filteredCategories.length" title="No categories found" message="Create a category before adding menu products." class="border-t border-slate-100" />
      </div>
    </SectionCard>

    <AppModal
      :open="isProductModalOpen"
      eyebrow="Partner Menu"
      :title="editingItemId ? 'Edit menu item' : 'Create menu item'"
      description="Changes here update the customer storefront data and branch-facing menu availability."
      size="lg"
      @close="closeProductModal"
    >
      <form class="space-y-4" @submit.prevent="submitProduct">
        <div>
          <label class="field-label" for="partner-category">Category</label>
          <select id="partner-category" v-model="productForm.categoryId" class="field-input" required>
            <option value="">Select a category</option>
            <option v-for="category in restaurant?.menuCategories ?? []" :key="category.id" :value="category.id">{{ category.name }}</option>
          </select>
        </div>
        <div>
          <label class="field-label" for="partner-name">Item name</label>
          <input id="partner-name" v-model="productForm.name" class="field-input" type="text" required />
        </div>
        <div>
          <label class="field-label" for="partner-description">Description</label>
          <textarea id="partner-description" v-model="productForm.description" class="field-input min-h-28" required />
        </div>
        <div class="grid gap-4 md:grid-cols-3">
          <div>
            <label class="field-label" for="partner-price">Price</label>
            <input id="partner-price" v-model.number="productForm.price" class="field-input" type="number" min="1" required />
          </div>
          <div>
            <label class="field-label" for="partner-prep-time">Prep time</label>
            <input id="partner-prep-time" v-model.number="productForm.prepTime" class="field-input" type="number" min="1" required />
          </div>
          <label class="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700 md:mt-8">
            <input v-model="productForm.available" type="checkbox" />
            Available now
          </label>
        </div>
        <ImageUploadField
          v-model="productForm.image"
          label="Item image"
          help="Upload a clear menu item photo. JPG, PNG, or WebP. Max 3 MB."
          :preview-alt="productForm.name || 'Menu item image preview'"
          @error="error = $event"
        />
        <div>
          <label class="field-label" for="partner-modifiers">Modifiers</label>
          <input id="partner-modifiers" v-model="modifierInput" class="field-input" type="text" placeholder="Extra Egg, Spicy Boost, Brown Rice" />
        </div>
        <div class="flex gap-3 pt-2">
          <button class="btn-primary" :disabled="saving">{{ saving ? 'Saving...' : editingItemId ? 'Update item' : 'Create item' }}</button>
          <button class="btn-secondary" type="button" @click="closeProductModal">Cancel</button>
        </div>
      </form>
    </AppModal>

    <AppModal
      :open="isCategoryModalOpen"
      eyebrow="Partner Menu"
      :title="editingCategoryId ? 'Edit category' : 'Create category'"
      description="Keep the assigned restaurant categories organised for storefront browsing and operations."
      size="md"
      @close="closeCategoryModal"
    >
      <form class="space-y-4" @submit.prevent="submitCategory">
        <div>
          <label class="field-label" for="partner-category-name">Category name</label>
          <input id="partner-category-name" v-model="categoryForm.name" class="field-input" type="text" required />
        </div>
        <div class="flex gap-3 pt-2">
          <button class="btn-primary" :disabled="saving">{{ saving ? 'Saving...' : editingCategoryId ? 'Update category' : 'Create category' }}</button>
          <button class="btn-secondary" type="button" @click="closeCategoryModal">Cancel</button>
        </div>
      </form>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { MoreVertical, Pencil, ToggleLeft, Trash2 } from 'lucide-vue-next';
import type { MenuCategory, MenuCategoryInput, MenuItem, MenuItemInput, Restaurant } from '@/types';
import AppModal from '@/components/common/AppModal.vue';
import { useAppDialog } from '@/composables/useAppDialog';
import EmptyState from '@/components/common/EmptyState.vue';
import SectionCard from '@/components/common/SectionCard.vue';
import ImageUploadField from '@/components/forms/ImageUploadField.vue';
import {
  createMenuCategory,
  createMenuItem,
  deleteMenuCategory,
  deleteMenuItem,
  getMenuForRestaurant,
  toggleItemAvailability as toggleRestaurantItemAvailability,
  updateMenuCategory,
  updateMenuItem,
} from '@/services/menu.service';
import { getRestaurantById } from '@/services/restaurant.service';
import { useAuthStore } from '@/stores/auth.store';
import { getPrimaryRestaurantId } from '@/utils/access';
import { formatCurrency } from '@/utils/format';

interface ProductRow {
  categoryId: string;
  categoryName: string;
  item: MenuItem;
}

const { confirmDialog } = useAppDialog();
const authStore = useAuthStore();
const restaurant = ref<Restaurant | null>(null);
const query = ref('');
const message = ref('');
const error = ref('');
const saving = ref(false);
const isProductModalOpen = ref(false);
const isCategoryModalOpen = ref(false);
const editingItemId = ref<string | null>(null);
const editingCategoryId = ref<string | null>(null);
const openActionMenuProductId = ref<string | null>(null);
const openActionMenuCategoryId = ref<string | null>(null);
const modifierInput = ref('');

const blankProductForm = (): MenuItemInput => ({
  restaurantId: '',
  categoryId: '',
  categoryName: '',
  name: '',
  description: '',
  price: 120,
  image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80',
  available: true,
  prepTime: 12,
  modifiers: [],
});

const blankCategoryForm = (): MenuCategoryInput => ({
  restaurantId: '',
  name: '',
});

const productForm = reactive<MenuItemInput>(blankProductForm());
const categoryForm = reactive<MenuCategoryInput>(blankCategoryForm());
const totalItems = computed(() => restaurant.value?.menuCategories.reduce((sum, category) => sum + category.items.length, 0) ?? 0);
const availableItems = computed(() => restaurant.value?.menuCategories.reduce((sum, category) => sum + category.items.filter((item) => item.available).length, 0) ?? 0);
const products = computed<ProductRow[]>(() =>
  restaurant.value?.menuCategories.flatMap((category) => category.items.map((item) => ({ categoryId: category.id, categoryName: category.name, item }))) ?? [],
);
const filteredProducts = computed(() => {
  const term = query.value.trim().toLowerCase();
  if (!term) return products.value;
  return products.value.filter((product) => [product.item.name, product.item.description, product.categoryName, ...product.item.modifiers].join(' ').toLowerCase().includes(term));
});
const filteredCategories = computed<MenuCategory[]>(() => {
  const categories = restaurant.value?.menuCategories ?? [];
  const term = query.value.trim().toLowerCase();
  if (!term) return categories;
  return categories.filter((category) => category.name.toLowerCase().includes(term) || category.items.some((item) => item.name.toLowerCase().includes(term)));
});

async function load() {
  const restaurantId = getPrimaryRestaurantId(authStore.user);
  if (!restaurantId) {
    restaurant.value = null;
    return;
  }

  restaurant.value = await getRestaurantById(restaurantId);
  if (restaurant.value) {
    restaurant.value = {
      ...restaurant.value,
      menuCategories: await getMenuForRestaurant(restaurantId),
    };
  }
}

onMounted(() => {
  void load();
  window.addEventListener('click', closeActionMenus);
});

onBeforeUnmount(() => {
  window.removeEventListener('click', closeActionMenus);
});

function closeActionMenus() {
  openActionMenuProductId.value = null;
  openActionMenuCategoryId.value = null;
}

function toggleProductMenu(itemId: string) {
  openActionMenuProductId.value = openActionMenuProductId.value === itemId ? null : itemId;
  openActionMenuCategoryId.value = null;
}

function toggleCategoryMenu(categoryId: string) {
  openActionMenuCategoryId.value = openActionMenuCategoryId.value === categoryId ? null : categoryId;
  openActionMenuProductId.value = null;
}

function editProductFromMenu(itemId: string) {
  closeActionMenus();
  openEditProductModal(itemId);
}

function availabilityFromMenu(itemId: string) {
  closeActionMenus();
  void toggleAvailability(itemId);
}

function deleteProductFromMenu(itemId: string) {
  closeActionMenus();
  void removeProduct(itemId);
}

function editCategoryFromMenu(categoryId: string) {
  closeActionMenus();
  openEditCategoryModal(categoryId);
}

function deleteCategoryFromMenu(categoryId: string) {
  closeActionMenus();
  void removeCategory(categoryId);
}

function resetProductForm() {
  editingItemId.value = null;
  Object.assign(productForm, blankProductForm());
  modifierInput.value = '';
  productForm.restaurantId = getPrimaryRestaurantId(authStore.user) ?? '';
}

function resetCategoryForm() {
  editingCategoryId.value = null;
  Object.assign(categoryForm, blankCategoryForm());
  categoryForm.restaurantId = getPrimaryRestaurantId(authStore.user) ?? '';
}

function openCreateProductModal() {
  resetProductForm();
  message.value = '';
  error.value = '';
  isProductModalOpen.value = true;
}

function openEditProductModal(itemId: string) {
  const category = restaurant.value?.menuCategories.find((entry) => entry.items.some((item) => item.id === itemId));
  const item = category?.items.find((entry) => entry.id === itemId);
  if (!restaurant.value || !category || !item) {
    return;
  }

  editingItemId.value = itemId;
  Object.assign(productForm, {
    restaurantId: restaurant.value.id,
    categoryId: category.id,
    categoryName: category.name,
    name: item.name,
    description: item.description,
    price: item.price,
    image: item.image,
    available: item.available,
    prepTime: item.prepTime,
    modifiers: [...item.modifiers],
  });
  modifierInput.value = item.modifiers.join(', ');
  message.value = '';
  error.value = '';
  isProductModalOpen.value = true;
}

function closeProductModal() {
  isProductModalOpen.value = false;
  resetProductForm();
}

function openCreateCategoryModal() {
  resetCategoryForm();
  message.value = '';
  error.value = '';
  isCategoryModalOpen.value = true;
}

function openEditCategoryModal(categoryId: string) {
  if (!restaurant.value) {
    return;
  }

  const category = restaurant.value.menuCategories.find((entry) => entry.id === categoryId);
  if (!category) {
    return;
  }

  editingCategoryId.value = categoryId;
  Object.assign(categoryForm, {
    restaurantId: restaurant.value.id,
    name: category.name,
  });
  message.value = '';
  error.value = '';
  isCategoryModalOpen.value = true;
}

function closeCategoryModal() {
  isCategoryModalOpen.value = false;
  resetCategoryForm();
}

async function submitProduct() {
  saving.value = true;
  message.value = '';
  error.value = '';

  try {
    const restaurantId = getPrimaryRestaurantId(authStore.user);
    if (!restaurantId || !restaurant.value) {
      throw new Error('No assigned restaurant found.');
    }

    const category = restaurant.value.menuCategories.find((entry) => entry.id === productForm.categoryId);
    if (!category) {
      throw new Error('Please choose a category.');
    }

    if (!productForm.image.trim()) {
      throw new Error('Please upload a menu item image.');
    }

    const payload: MenuItemInput = {
      restaurantId,
      categoryId: category.id,
      categoryName: category.name,
      name: productForm.name.trim(),
      description: productForm.description.trim(),
      price: Number(productForm.price),
      image: productForm.image.trim(),
      available: productForm.available,
      prepTime: Number(productForm.prepTime),
      modifiers: modifierInput.value.split(',').map((item) => item.trim()).filter(Boolean),
    };

    if (editingItemId.value) {
      await updateMenuItem(editingItemId.value, payload);
      message.value = 'Menu item updated.';
    } else {
      await createMenuItem(payload);
      message.value = 'Menu item created.';
    }

    await load();
    closeProductModal();
  } catch (incoming) {
    error.value = incoming instanceof Error ? incoming.message : 'Unable to save menu item.';
  } finally {
    saving.value = false;
  }
}

async function submitCategory() {
  saving.value = true;
  message.value = '';
  error.value = '';

  try {
    const restaurantId = getPrimaryRestaurantId(authStore.user);
    if (!restaurantId) {
      throw new Error('No assigned restaurant found.');
    }

    const payload: MenuCategoryInput = {
      restaurantId,
      name: categoryForm.name.trim(),
    };

    if (!payload.name) {
      throw new Error('Please enter a category name.');
    }

    if (editingCategoryId.value) {
      await updateMenuCategory(editingCategoryId.value, payload);
      message.value = 'Category updated.';
    } else {
      await createMenuCategory(payload);
      message.value = 'Category created.';
    }

    await load();
    closeCategoryModal();
  } catch (incoming) {
    error.value = incoming instanceof Error ? incoming.message : 'Unable to save category.';
  } finally {
    saving.value = false;
  }
}

async function toggleAvailability(itemId: string) {
  try {
    const restaurantId = getPrimaryRestaurantId(authStore.user);
    if (!restaurantId) {
      throw new Error('No assigned restaurant found.');
    }

    await toggleRestaurantItemAvailability(restaurantId, itemId);
    message.value = 'Item availability updated.';
    error.value = '';
    await load();
  } catch (incoming) {
    error.value = incoming instanceof Error ? incoming.message : 'Unable to update availability.';
  }
}

async function removeProduct(itemId: string) {
  const confirmed = await confirmDialog({
    title: 'Delete menu item',
    message: 'Delete this item from the assigned restaurant menu?',
    confirmLabel: 'Delete item',
    tone: 'danger',
  });
  if (!confirmed) {
    return;
  }

  try {
    await deleteMenuItem(itemId);
    message.value = 'Item deleted.';
    error.value = '';
    await load();
  } catch (incoming) {
    error.value = incoming instanceof Error ? incoming.message : 'Unable to delete item.';
  }
}

async function removeCategory(categoryId: string) {
  const confirmed = await confirmDialog({
    title: 'Delete category',
    message: 'Delete this category from the assigned restaurant menu?',
    confirmLabel: 'Delete category',
    tone: 'danger',
  });
  if (!confirmed) {
    return;
  }

  try {
    await deleteMenuCategory(categoryId);
    message.value = 'Category deleted.';
    error.value = '';
    await load();
  } catch (incoming) {
    error.value = incoming instanceof Error ? incoming.message : 'Unable to delete category.';
  }
}
</script>