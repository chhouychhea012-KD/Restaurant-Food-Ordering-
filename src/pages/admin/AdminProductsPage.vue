<template>
  <div class="space-y-6">
    <SectionCard eyebrow="Catalog Control" title="">
      <template #actions>
        <div class="flex flex-wrap gap-3">
          <input v-model="query" class="field-input w-64" type="search" placeholder="Search product or restaurant" />
          <RouterLink to="/admin/categories" class="btn-secondary">Open categories</RouterLink>
          <button class="btn-primary" type="button" @click="openCreateModal">Create product</button>
        </div>
      </template>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <!-- Total Products -->
    <div class="surface-muted rounded-xl p-6 transition hover:shadow-md">
      <div class="flex items-center gap-4">
        <div class="rounded-xl bg-blue-100 p-3.5 text-blue-600">
          <Package :size="28" />
        </div>
        <div class="flex-1">
          <p class="text-sm font-semibold text-slate-900">Total Products</p>
          <p class="mt-2 text-4xl font-bold text-slate-950">{{ products.length }}</p>
        </div>
      </div>
      <p class="mt-4 text-sm text-slate-500">Across all restaurants</p>
    </div>

    <!-- Active Products -->
    <div class="surface-muted rounded-xl p-6 transition hover:shadow-md">
      <div class="flex items-center gap-4">
        <div class="rounded-xl bg-emerald-100 p-3.5 text-emerald-600">
          <CheckCircle :size="28" />
        </div>
        <div class="flex-1">
          <p class="text-sm font-semibold text-slate-900">Active Products</p>
          <p class="mt-2 text-4xl font-bold text-slate-950">{{ activeProducts }}</p>
        </div>
      </div>
      <p class="mt-4 text-sm text-slate-500">Ready to order</p>
    </div>

  <!-- Categories -->
  <div class="surface-muted rounded-xl p-6 transition hover:shadow-md">
    <div class="flex items-center gap-4">
      <div class="rounded-xl bg-violet-100 p-3.5 text-violet-600">
        <Tags :size="28" />
      </div>
      <div class="flex-1">
        <p class="text-sm font-semibold text-slate-900">Categories</p>
        <p class="mt-2 text-4xl font-bold text-slate-950">{{ categories.length }}</p>
      </div>
    </div>
    <p class="mt-4 text-sm text-slate-500">Menu groups</p>
  </div>

  <!-- Restaurant Coverage -->
  <div class="surface-muted rounded-xl p-6 transition hover:shadow-md">
    <div class="flex items-center gap-4">
      <div class="rounded-xl bg-amber-100 p-3.5 text-amber-600">
        <Building2 :size="28" />
      </div>
      <div class="flex-1">
        <p class="text-sm font-semibold text-slate-900">Restaurant Coverage</p>
        <p class="mt-2 text-4xl font-bold text-slate-950">{{ restaurantCoverage }}</p>
      </div>
    </div>
    <p class="mt-4 text-sm text-slate-500">With active products</p>
  </div>
</div>

      <div class="mt-6 space-y-4">
        <div v-for="product in filteredProducts" :key="product.item.id" class="rounded-xl border border-slate-200 bg-white/85 p-5 shadow-sm">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="flex gap-4">
              <img :src="product.item.image" :alt="product.item.name" class="h-24 w-24 rounded-xl object-cover" />
              <div>
                <p class="text-xs font-bold uppercase tracking-[0.2em] text-brand-500">{{ product.restaurantName }} � {{ product.categoryName }}</p>
                <h3 class="mt-2 text-xl font-bold text-slate-950">{{ product.item.name }}</h3>
                <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{{ product.item.description }}</p>
                <div class="mt-3 flex flex-wrap gap-2">
                  <span v-for="modifier in product.item.modifiers" :key="modifier" class="pill bg-slate-100 text-slate-600">{{ modifier }}</span>
                </div>
              </div>
            </div>
            <div class="text-right">
              <span class="pill" :class="product.item.available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'">
                {{ product.item.available ? 'Available' : 'Paused' }}
              </span>
              <p class="mt-3 text-2xl font-bold text-slate-950">{{ formatCurrency(product.item.price) }}</p>
              <p class="mt-1 text-sm text-slate-500">{{ product.item.prepTime }} min prep</p>
            </div>
          </div>
          <div class="mt-5 flex flex-wrap gap-3">
            <button class="btn-secondary px-3 py-2" type="button" @click="openEditModal(product.item.id)">Edit</button>
            <button class="btn-secondary px-3 py-2" type="button" @click="toggleAvailability(product)">{{ product.item.available ? 'Pause' : 'Activate' }}</button>
            <button class="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100" type="button" @click="removeProduct(product.item.id)">Delete</button>
          </div>
        </div>
      </div>
    </SectionCard>

    <SectionCard eyebrow="Category Control" title="Admin category management" description="Create, edit, and delete product categories per restaurant from the same module.">
      <template #actions>
        <button class="btn-primary" type="button" @click="openCreateCategoryModal">Create category</button>
      </template>

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div v-for="entry in filteredCategories" :key="entry.category.id" class="rounded-xl border border-slate-200 bg-white/85 p-5 shadow-sm">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-xs font-bold uppercase tracking-[0.2em] text-brand-500">{{ entry.restaurantName }}</p>
              <h3 class="mt-2 text-xl font-bold text-slate-950">{{ entry.category.name }}</h3>
              <p class="mt-2 text-sm text-slate-500">{{ entry.category.items.length }} products in this category</p>
            </div>
            <span class="pill bg-slate-100 text-slate-700">{{ entry.category.items.length }} items</span>
          </div>
          <div class="mt-5 flex flex-wrap gap-3">
            <button class="btn-secondary px-3 py-2" type="button" @click="openEditCategoryModal(entry.category.id)">Edit</button>
            <button class="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100" type="button" @click="removeCategory(entry.category.id)">Delete</button>
          </div>
        </div>
      </div>

      <p v-if="message" class="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ message }}</p>
      <p v-if="error" class="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{{ error }}</p>
    </SectionCard>

    <AppModal
      :open="isModalOpen"
      eyebrow="Product CRUD"
      :title="editingItemId ? 'Edit product item' : 'Create product item'"
      description="Manage menu products with dynamic restaurant and category assignment from the admin dashboard."
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
          <label class="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700 md:mt-8">
            <input v-model="form.available" type="checkbox" />
            Available now
          </label>
        </div>
        <div>
          <label class="field-label" for="image">Image URL</label>
          <input id="image" v-model="form.image" class="field-input" type="url" required />
        </div>
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
      description="Manage restaurant product categories with their own popup form and validation."
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
import { computed, onMounted, reactive, ref } from 'vue';
import { RouterLink } from 'vue-router';
import type { AdminCategory, AdminProduct, MenuCategoryInput, MenuItemInput, Restaurant } from '@/types';
import AppModal from '@/components/common/AppModal.vue';
import SectionCard from '@/components/common/SectionCard.vue';
import { formatCurrency } from '@/utils/format';
import { Package, CheckCircle, Tags, Building2 } from 'lucide-vue-next';
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

onMounted(load);

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
  const confirmed = window.confirm('Delete this product from the menu dataset?');
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
  const confirmed = window.confirm('Delete this category from the menu dataset?');
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
