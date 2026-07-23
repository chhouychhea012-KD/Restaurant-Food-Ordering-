<template>
  <div class="space-y-6">
    <SectionCard eyebrow="Catalog" title="">
      <template #actions>
        <div class="flex flex-wrap gap-3">
          <input v-model="query" class="field-input w-full sm:w-64" type="search" placeholder="Search product or restaurant" />
          <RouterLink to="/admin/categories" class="btn-secondary">Open categories</RouterLink>
          <button class="btn-primary" type="button" @click="openCreateModal">Create product</button>
        </div>
      </template>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <!-- Products -->
    <div class="surface-muted rounded-lg p-6 transition hover:shadow-md">
      <div class="flex items-center gap-4">
        <div class="rounded-lg bg-blue-100 p-3.5 text-blue-600">
          <Package :size="28" />
        </div>
        <div class="flex-1">
          <p class="text-sm font-semibold text-slate-900">Products</p>
          <p class="mt-2 text-3xl font-bold text-slate-950">{{ products.length }}</p>
        </div>
      </div>
      <p class="mt-4 text-sm text-slate-500">Across all restaurants</p>
    </div>

    <!-- Active -->
    <div class="surface-muted rounded-lg p-6 transition hover:shadow-md">
      <div class="flex items-center gap-4">
        <div class="rounded-lg bg-emerald-100 p-3.5 text-emerald-600">
          <CheckCircle :size="28" />
        </div>
        <div class="flex-1">
          <p class="text-sm font-semibold text-slate-900">Active</p>
          <p class="mt-2 text-3xl font-bold text-slate-950">{{ activeProducts }}</p>
        </div>
      </div>
      <p class="mt-4 text-sm text-slate-500">Ready to order</p>
    </div>

  <!-- Categories -->
  <div class="surface-muted rounded-lg p-6 transition hover:shadow-md">
    <div class="flex items-center gap-4">
      <div class="rounded-lg bg-violet-100 p-3.5 text-violet-600">
        <Tags :size="28" />
      </div>
      <div class="flex-1">
        <p class="text-sm font-semibold text-slate-900">Categories</p>
        <p class="mt-2 text-3xl font-bold text-slate-950">{{ categories.length }}</p>
      </div>
    </div>
    <p class="mt-4 text-sm text-slate-500">Menu groups</p>
  </div>

  <!-- Coverage -->
  <div class="surface-muted rounded-lg p-6 transition hover:shadow-md">
    <div class="flex items-center gap-4">
      <div class="rounded-lg bg-amber-100 p-3.5 text-amber-600">
        <Building2 :size="28" />
      </div>
      <div class="flex-1">
        <p class="text-sm font-semibold text-slate-900">Coverage</p>
        <p class="mt-2 text-3xl font-bold text-slate-950">{{ restaurantCoverage }}</p>
      </div>
    </div>
    <p class="mt-4 text-sm text-slate-500">With active products</p>
  </div>
</div>

      <div class="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="safe-table-wrap">
          <table class="w-full min-w-[860px] text-left text-sm">
            <thead class="bg-slate-50 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              <tr>
                <th class="px-5 py-4">Product</th>
                <th class="px-5 py-4">Restaurant</th>
                <th class="px-5 py-4">Category</th>
                <th class="px-5 py-4">Status</th>
                <th class="px-5 py-4">Price</th>
                <th class="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="product in filteredProducts" :key="product.item.id" class="transition hover:bg-orange-50/40">
                <td class="px-5 py-4">
                  <div class="flex min-w-0 items-center gap-3">
                    <img :src="product.item.image" :alt="product.item.name" class="h-12 w-12 rounded-lg object-cover" />
                    <div class="min-w-0">
                      <p class="truncate font-bold text-slate-950">{{ product.item.name }}</p>
                      <p class="mt-1 text-xs text-slate-500">{{ product.item.prepTime }} min prep</p>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-4 font-semibold text-slate-700">{{ product.restaurantName }}</td>
                <td class="px-5 py-4"><span class="pill bg-slate-100 text-slate-700">{{ product.categoryName }}</span></td>
                <td class="px-5 py-4"><span class="pill" :class="product.item.available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'">{{ product.item.available ? 'Available' : 'Paused' }}</span></td>
                <td class="px-5 py-4 font-bold text-slate-950">{{ formatCurrency(product.item.price) }}</td>
                <td class="px-5 py-4">
                  <div class="relative flex justify-end">
                    <button class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-900" type="button" @click.stop="toggleProductMenu(product.item.id)"><MoreVertical :size="18" /></button>
                    <div v-if="openActionMenuProductId === product.item.id" class="absolute right-0 top-11 z-30 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
                      <button class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50" type="button" @click="editProductFromMenu(product.item.id)"><Pencil :size="15" /> Edit</button>
                      <button class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50" type="button" @click="availabilityFromMenu(product)"><ToggleLeft :size="15" /> {{ product.item.available ? 'Pause' : 'Activate' }}</button>
                      <button class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50" type="button" @click="deleteProductFromMenu(product.item.id)"><Trash2 :size="15" /> Delete</button>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </SectionCard>

    <SectionCard eyebrow="Category Control" title="Categories" >
      <template #actions>
        <button class="btn-primary" type="button" @click="openCreateCategoryModal">Create category</button>
      </template>

      <div class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="safe-table-wrap">
          <table class="w-full min-w-[680px] text-left text-sm">
            <thead class="bg-slate-50 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              <tr><th class="px-5 py-4">Category</th><th class="px-5 py-4">Restaurant</th><th class="px-5 py-4">Products</th><th class="px-5 py-4 text-right">Actions</th></tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="entry in filteredCategories" :key="entry.category.id" class="transition hover:bg-orange-50/40">
                <td class="px-5 py-4 font-bold text-slate-950">{{ entry.category.name }}</td>
                <td class="px-5 py-4 text-slate-700">{{ entry.restaurantName }}</td>
                <td class="px-5 py-4"><span class="pill bg-slate-100 text-slate-700">{{ entry.category.items.length }} items</span></td>
                <td class="px-5 py-4">
                  <div class="relative flex justify-end">
                    <button class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-900" type="button" @click.stop="toggleCategoryMenu(entry.category.id)"><MoreVertical :size="18" /></button>
                    <div v-if="openActionMenuCategoryId === entry.category.id" class="absolute right-0 top-11 z-30 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
                      <button class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50" type="button" @click="editCategoryFromMenu(entry.category.id)"><Pencil :size="15" /> Edit</button>
                      <button class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50" type="button" @click="deleteCategoryFromMenu(entry.category.id)"><Trash2 :size="15" /> Delete</button>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <p v-if="message" class="mt-5 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ message }}</p>
      <p v-if="error" class="mt-5 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600">{{ error }}</p>
    </SectionCard>

    <AppModal
      :open="isModalOpen"
      eyebrow="Product CRUD"
      :title="editingItemId ? 'Edit product item' : 'Create product item'"
      description="Restaurant, category, price, and availability."
      size="lg"
      @close="closeModal"
    >
      <form class="space-y-4" @submit.prevent="submitProduct">
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label class="field-label" for="restaurant">Restaurant</label>
            <select id="restaurant" v-model="form.restaurantId" class="field-input" required>
              <option value="">Select a restaurant</option>
              <option v-for="restaurant in restaurants" :key="restaurant.id" :value="restaurant.id">{{ restaurant.name }}</option>
            </select>
          </div>
          <div>
            <label class="field-label" for="category">Category</label>
            <input id="category" v-model="form.categoryName" class="field-input" list="product-categories" placeholder="Signature Bowls" required />
            <datalist id="product-categories">
              <option v-for="category in categoryOptions" :key="category" :value="category" />
            </datalist>
          </div>
        </div>
        <div>
          <label class="field-label" for="name">Product name</label>
          <input id="name" v-model="form.name" class="field-input" type="text" required />
        </div>
        <div>
          <label class="field-label" for="description">Description</label>
          <textarea id="description" v-model="form.description" class="field-input min-h-28" required />
        </div>
        <div class="grid gap-4 md:grid-cols-3">
          <div>
            <label class="field-label" for="price">Price</label>
            <input id="price" v-model.number="form.price" class="field-input" type="number" min="1" required />
          </div>
          <div>
            <label class="field-label" for="prepTime">Prep time</label>
            <input id="prepTime" v-model.number="form.prepTime" class="field-input" type="number" min="1" required />
          </div>
          <label class="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700 md:mt-8">
            <input v-model="form.available" type="checkbox" />
            Available now
          </label>
        </div>
        <ImageUploadField
          v-model="form.image"
          label="Product image"
          help="Upload a clear dish photo. JPG, PNG, or WebP. Max 3 MB."
          :preview-alt="form.name || 'Product image preview'"
          @error="error = $event"
        />
        <div>
          <label class="field-label" for="modifiers">Modifiers</label>
          <input id="modifiers" v-model="modifierInput" class="field-input" type="text" placeholder="Extra Egg, Spicy Boost, Brown Rice" />
        </div>
        <div class="flex flex-wrap gap-3 pt-2">
          <button class="btn-primary" :disabled="saving">{{ saving ? 'Saving...' : editingItemId ? 'Update product' : 'Create product' }}</button>
          <button class="btn-secondary" type="button" @click="closeModal">Cancel</button>
        </div>
      </form>
    </AppModal>

    <AppModal
      :open="isCategoryModalOpen"
      eyebrow="Category CRUD"
      :title="editingCategoryId ? 'Edit category' : 'Create category'"
      description="Create or rename menu groups."
      size="md"
      @close="closeCategoryModal"
    >
      <form class="space-y-4" @submit.prevent="submitCategory">
        <div>
          <label class="field-label" for="category-restaurant">Restaurant</label>
          <select id="category-restaurant" v-model="categoryForm.restaurantId" class="field-input" required>
            <option value="">Select a restaurant</option>
            <option v-for="restaurant in restaurants" :key="restaurant.id" :value="restaurant.id">{{ restaurant.name }}</option>
          </select>
        </div>
        <div>
          <label class="field-label" for="category-name">Category name</label>
          <input id="category-name" v-model="categoryForm.name" class="field-input" type="text" placeholder="Signature Bowls" required />
        </div>
        <div class="flex flex-wrap gap-3 pt-2">
          <button class="btn-primary" :disabled="saving">{{ saving ? 'Saving...' : editingCategoryId ? 'Update category' : 'Create category' }}</button>
          <button class="btn-secondary" type="button" @click="closeCategoryModal">Cancel</button>
        </div>
      </form>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { RouterLink } from 'vue-router';
import type { AdminCategory, AdminProduct, MenuCategoryInput, MenuItemInput, Restaurant } from '@/types';
import AppModal from '@/components/common/AppModal.vue';
import { useAppDialog } from '@/composables/useAppDialog';
import SectionCard from '@/components/common/SectionCard.vue';
import ImageUploadField from '@/components/forms/ImageUploadField.vue';
import { formatCurrency } from '@/utils/format';
import { Building2, CheckCircle, MoreVertical, Package, Pencil, Tags, Trash2, ToggleLeft } from 'lucide-vue-next';
import {
  createMenuCategory,
  createMenuItem,
  deleteMenuCategory,
  deleteMenuItem,
  listAdminCategories,
  listAdminProducts,
  toggleItemAvailability,
  updateMenuCategory,
  updateMenuItem,
} from '@/services/menu.service';
import { listRestaurants } from '@/services/restaurant.service';

const { confirmDialog } = useAppDialog();
const products = ref<AdminProduct[]>([]);
const categories = ref<AdminCategory[]>([]);
const restaurants = ref<Restaurant[]>([]);
const query = ref('');
const saving = ref(false);
const message = ref('');
const error = ref('');
const isModalOpen = ref(false);
const isCategoryModalOpen = ref(false);
const editingItemId = ref<string | null>(null);
const editingCategoryId = ref<string | null>(null);
const openActionMenuProductId = ref<string | null>(null);
const openActionMenuCategoryId = ref<string | null>(null);

const blankForm = (): MenuItemInput => ({
  restaurantId: '',
  categoryId: undefined,
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

const form = reactive<MenuItemInput>(blankForm());
const categoryForm = reactive<MenuCategoryInput>(blankCategoryForm());
const modifierInput = ref('');

const filteredProducts = computed(() => {
  const term = query.value.trim().toLowerCase();
  if (!term) {
    return products.value;
  }
  return products.value.filter((product) =>
    [product.item.name, product.restaurantName, product.categoryName].some((value) => value.toLowerCase().includes(term)),
  );
});
const filteredCategories = computed(() => {
  const term = query.value.trim().toLowerCase();
  if (!term) {
    return categories.value;
  }
  return categories.value.filter((entry) =>
    [entry.category.name, entry.restaurantName].some((value) => value.toLowerCase().includes(term)),
  );
});
const activeProducts = computed(() => products.value.filter((product) => product.item.available).length);
const restaurantCoverage = computed(() => new Set(products.value.map((product) => product.restaurantId)).size);
const categoryOptions = computed(() => [...new Set(categories.value.map((entry) => entry.category.name))].sort());

async function load() {
  products.value = await listAdminProducts();
  categories.value = await listAdminCategories();
  restaurants.value = await listRestaurants();
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
  openEditModal(itemId);
}

function availabilityFromMenu(product: AdminProduct) {
  closeActionMenus();
  void toggleAvailability(product);
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
function resetForm() {
  editingItemId.value = null;
  Object.assign(form, blankForm());
  modifierInput.value = '';
}

function resetCategoryForm() {
  editingCategoryId.value = null;
  Object.assign(categoryForm, blankCategoryForm());
}

function openCreateModal() {
  resetForm();
  message.value = '';
  error.value = '';
  isModalOpen.value = true;
}

function openEditModal(itemId: string) {
  const product = products.value.find((entry) => entry.item.id === itemId);
  if (!product) {
    return;
  }

  editingItemId.value = itemId;
  Object.assign(form, {
    restaurantId: product.restaurantId,
    categoryId: product.categoryId,
    categoryName: product.categoryName,
    name: product.item.name,
    description: product.item.description,
    price: product.item.price,
    image: product.item.image,
    available: product.item.available,
    prepTime: product.item.prepTime,
    modifiers: [...product.item.modifiers],
  });
  modifierInput.value = product.item.modifiers.join(', ');
  message.value = '';
  error.value = '';
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
  resetForm();
}

function openCreateCategoryModal() {
  resetCategoryForm();
  message.value = '';
  error.value = '';
  isCategoryModalOpen.value = true;
}

function openEditCategoryModal(categoryId: string) {
  const entry = categories.value.find((item) => item.category.id === categoryId);
  if (!entry) {
    return;
  }

  editingCategoryId.value = categoryId;
  Object.assign(categoryForm, {
    restaurantId: entry.restaurantId,
    name: entry.category.name,
  });
  message.value = '';
  error.value = '';
  isCategoryModalOpen.value = true;
}

function closeCategoryModal() {
  isCategoryModalOpen.value = false;
  resetCategoryForm();
}

function normalizePayload(): MenuItemInput {
  return {
    restaurantId: form.restaurantId,
    categoryId: undefined,
    categoryName: form.categoryName.trim(),
    name: form.name.trim(),
    description: form.description.trim(),
    price: Number(form.price),
    image: form.image.trim(),
    available: form.available,
    prepTime: Number(form.prepTime),
    modifiers: modifierInput.value.split(',').map((item) => item.trim()).filter(Boolean),
  };
}

async function submitProduct() {
  saving.value = true;
  message.value = '';
  error.value = '';
  try {
    const payload = normalizePayload();
    if (!payload.restaurantId) {
      throw new Error('Please choose a restaurant.');
    }
    if (!payload.categoryName) {
      throw new Error('Please enter a category name.');
    }
    if (!payload.image) {
      throw new Error('Please upload a product image.');
    }

    if (editingItemId.value) {
      await updateMenuItem(editingItemId.value, payload);
      message.value = 'Product updated successfully.';
    } else {
      await createMenuItem(payload);
      message.value = 'Product created successfully.';
    }

    await load();
    closeModal();
  } catch (incoming) {
    error.value = incoming instanceof Error ? incoming.message : 'Unable to save product.';
  } finally {
    saving.value = false;
  }
}

async function submitCategory() {
  saving.value = true;
  message.value = '';
  error.value = '';
  try {
    const payload: MenuCategoryInput = {
      restaurantId: categoryForm.restaurantId,
      name: categoryForm.name.trim(),
    };

    if (!payload.restaurantId) {
      throw new Error('Please choose a restaurant.');
    }
    if (!payload.name) {
      throw new Error('Please enter a category name.');
    }

    if (editingCategoryId.value) {
      await updateMenuCategory(editingCategoryId.value, payload);
      message.value = 'Category updated successfully.';
    } else {
      await createMenuCategory(payload);
      message.value = 'Category created successfully.';
    }

    await load();
    closeCategoryModal();
  } catch (incoming) {
    error.value = incoming instanceof Error ? incoming.message : 'Unable to save category.';
  } finally {
    saving.value = false;
  }
}

async function removeProduct(itemId: string) {
  const confirmed = await confirmDialog({
    title: 'Delete product',
    message: 'Delete this product from the menu dataset?',
    confirmLabel: 'Delete product',
    tone: 'danger',
  });
  if (!confirmed) {
    return;
  }

  try {
    await deleteMenuItem(itemId);
    message.value = 'Product deleted successfully.';
    await load();
  } catch (incoming) {
    error.value = incoming instanceof Error ? incoming.message : 'Unable to delete product.';
  }
}

async function removeCategory(categoryId: string) {
  const confirmed = await confirmDialog({
    title: 'Delete category',
    message: 'Delete this category from the menu dataset?',
    confirmLabel: 'Delete category',
    tone: 'danger',
  });
  if (!confirmed) {
    return;
  }

  try {
    await deleteMenuCategory(categoryId);
    message.value = 'Category deleted successfully.';
    await load();
  } catch (incoming) {
    error.value = incoming instanceof Error ? incoming.message : 'Unable to delete category.';
  }
}

async function toggleAvailability(product: AdminProduct) {
  try {
    await toggleItemAvailability(product.restaurantId, product.item.id);
    message.value = `Product ${product.item.available ? 'paused' : 'activated'} successfully.`;
    await load();
  } catch (incoming) {
    error.value = incoming instanceof Error ? incoming.message : 'Unable to update availability.';
  }
}
</script>