<template>
  <div class="space-y-6">
    <SectionCard eyebrow="Menu Management" title="Assigned restaurant menu" description="Manage categories, products, modifiers, and branch-facing availability for the linked restaurant.">
      <template #actions>
        <div class="flex flex-wrap gap-3">
          <button class="btn-secondary" type="button" @click="openCreateCategoryModal">Create category</button>
          <button class="btn-primary" type="button" @click="openCreateProductModal">Create item</button>
        </div>
      </template>

      <div v-if="!restaurant" class="space-y-4">
        <EmptyState title="No assigned restaurant" message="This owner account does not currently have a restaurant assignment." />
      </div>

      <div v-else class="space-y-6">
        <div class="grid gap-4 md:grid-cols-3">
          <div class="surface-muted rounded-xl p-5">
            <p class="text-sm font-semibold text-slate-500">Categories</p>
            <p class="mt-3 text-3xl font-bold text-slate-950">{{ restaurant.menuCategories.length }}</p>
          </div>
          <div class="surface-muted rounded-xl p-5">
            <p class="text-sm font-semibold text-slate-500">Products</p>
            <p class="mt-3 text-3xl font-bold text-slate-950">{{ totalItems }}</p>
          </div>
          <div class="surface-muted rounded-xl p-5">
            <p class="text-sm font-semibold text-slate-500">Available now</p>
            <p class="mt-3 text-3xl font-bold text-slate-950">{{ availableItems }}</p>
          </div>
        </div>

        <div v-for="category in restaurant.menuCategories" :key="category.id" class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="text-xl font-bold text-slate-950">{{ category.name }}</p>
              <p class="mt-1 text-sm text-slate-500">{{ category.items.length }} items in this category</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <button class="btn-secondary px-3 py-2" type="button" @click="openEditCategoryModal(category.id)">Edit category</button>
              <button class="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100" type="button" @click="removeCategory(category.id)">Delete category</button>
            </div>
          </div>

          <div v-if="category.items.length" class="mt-5 grid gap-4 xl:grid-cols-2">
            <article v-for="item in category.items" :key="item.id" class="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div class="flex gap-4">
                <img :src="item.image" :alt="item.name" class="h-24 w-24 rounded-xl object-cover" />
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 class="text-lg font-semibold text-slate-950">{{ item.name }}</h3>
                      <p class="mt-1 text-sm text-slate-500">{{ formatCurrency(item.price) }} • {{ item.prepTime }} min prep</p>
                    </div>
                    <span class="pill" :class="item.available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'">
                      {{ item.available ? 'Available' : 'Paused' }}
                    </span>
                  </div>
                  <p class="mt-3 text-sm leading-6 text-slate-600">{{ item.description }}</p>
                  <div class="mt-3 flex flex-wrap gap-2">
                    <span v-for="modifier in item.modifiers" :key="modifier" class="pill bg-white text-slate-600">{{ modifier }}</span>
                  </div>
                </div>
              </div>
              <div class="mt-4 flex flex-wrap gap-3">
                <button class="btn-secondary px-3 py-2" type="button" @click="openEditProductModal(item.id)">Edit item</button>
                <button class="btn-secondary px-3 py-2" type="button" @click="toggleAvailability(item.id)">{{ item.available ? 'Pause' : 'Activate' }}</button>
                <button class="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100" type="button" @click="removeProduct(item.id)">Delete</button>
              </div>
            </article>
          </div>

          <EmptyState v-else title="No items yet" message="Create the first product in this category to make it visible to customers." class="mt-4" />
        </div>
      </div>

      <p v-if="message" class="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ message }}</p>
      <p v-if="error" class="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{{ error }}</p>
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
import { computed, onMounted, reactive, ref } from 'vue';
import type { MenuCategoryInput, MenuItemInput, Restaurant } from '@/types';
import AppModal from '@/components/common/AppModal.vue';
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

const authStore = useAuthStore();
const restaurant = ref<Restaurant | null>(null);
const message = ref('');
const error = ref('');
const saving = ref(false);
const isProductModalOpen = ref(false);
const isCategoryModalOpen = ref(false);
const editingItemId = ref<string | null>(null);
const editingCategoryId = ref<string | null>(null);
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

onMounted(load);

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
  if (!window.confirm('Delete this item from the assigned restaurant menu?')) {
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
  if (!window.confirm('Delete this category from the assigned restaurant menu?')) {
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
