<template>
  <div class="space-y-6">
    <SectionCard
      eyebrow="Category Control"
      title="Admin category management"
      description="Create, edit, delete, and review product categories across every restaurant from a dedicated admin module."
    >
      <template #actions>
        <div class="flex flex-wrap gap-3">
          <input v-model="query" class="field-input w-64" type="search" placeholder="Search category, restaurant, or product" />
          <RouterLink to="/admin/products" class="btn-secondary">Open products</RouterLink>
          <button class="btn-primary" type="button" @click="openCreateCategoryModal">Create category</button>
        </div>
      </template>

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div class="surface-muted p-5">
          <p class="text-sm font-semibold text-slate-900">Total categories</p>
          <p class="mt-2 text-3xl font-bold text-slate-950">{{ categories.length }}</p>
          <p class="mt-2 text-sm text-slate-500">Stored in the admin catalog</p>
        </div>
        <div class="surface-muted p-5">
          <p class="text-sm font-semibold text-slate-900">Covered restaurants</p>
          <p class="mt-2 text-3xl font-bold text-slate-950">{{ restaurantCoverage }}</p>
          <p class="mt-2 text-sm text-slate-500">Restaurants using categories right now</p>
        </div>
        <div class="surface-muted p-5">
          <p class="text-sm font-semibold text-slate-900">Products mapped</p>
          <p class="mt-2 text-3xl font-bold text-slate-950">{{ totalProducts }}</p>
          <p class="mt-2 text-sm text-slate-500">Products assigned to category groups</p>
        </div>
        <div class="surface-muted p-5">
          <p class="text-sm font-semibold text-slate-900">Largest category</p>
          <p class="mt-2 text-2xl font-bold text-slate-950">{{ largestCategoryName }}</p>
          <p class="mt-2 text-sm text-slate-500">{{ largestCategoryCount }} products in the busiest group</p>
        </div>
      </div>

      <div v-if="filteredCategories.length" class="mt-6 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        <article
          v-for="entry in filteredCategories"
          :key="entry.category.id"
          class="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-200/60"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-xs font-bold uppercase tracking-[0.2em] text-brand-500">{{ entry.restaurantName }}</p>
              <h3 class="mt-2 text-xl font-bold text-slate-950">{{ entry.category.name }}</h3>
              <p class="mt-2 text-sm text-slate-500">{{ entry.category.items.length }} linked products in this category</p>
            </div>
            <span class="pill bg-slate-100 text-slate-700">{{ entry.category.items.length }} items</span>
          </div>

          <div class="mt-5 rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Category health</p>
                <p class="mt-1 text-sm font-medium text-slate-600">{{ healthLabel(entry.category.items.length) }}</p>
              </div>
              <span class="rounded-full px-3 py-1 text-xs font-semibold" :class="healthTone(entry.category.items.length)">
                {{ healthTag(entry.category.items.length) }}
              </span>
            </div>

            <div class="mt-4">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Product preview</p>
              <div class="mt-3 flex flex-wrap gap-2">
                <span
                  v-for="item in entry.category.items.slice(0, 4)"
                  :key="item.id"
                  class="pill bg-white text-slate-600 shadow-sm ring-1 ring-slate-200"
                >
                  {{ item.name }}
                </span>
                <span v-if="!entry.category.items.length" class="text-sm text-slate-400">No products linked yet</span>
              </div>
            </div>
          </div>

          <div class="mt-5 flex flex-wrap gap-3">
            <button class="btn-secondary px-3 py-2" type="button" @click="openEditCategoryModal(entry.category.id)">Edit</button>
            <button class="btn-secondary px-3 py-2" type="button" @click="openProductsFor">View products</button>
            <button
              class="rounded-2xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
              type="button"
              @click="removeCategory(entry.category.id)"
            >
              Delete
            </button>
          </div>
        </article>
      </div>

      <div v-else class="mt-6 rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50/80 p-10 text-center">
        <p class="text-lg font-semibold text-slate-900">No category matches your search</p>
        <p class="mt-2 text-sm text-slate-500">Try another keyword or create a new category for a restaurant.</p>
      </div>

      <p v-if="message" class="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ message }}</p>
      <p v-if="error" class="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{{ error }}</p>
    </SectionCard>

    <AppModal
      :open="isCategoryModalOpen"
      eyebrow="Category CRUD"
      :title="editingCategoryId ? 'Edit category' : 'Create category'"
      description="Manage restaurant product categories with popup forms, validation, and local JSON-backed storage."
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
import { RouterLink, useRouter } from 'vue-router';
import type { AdminCategory, MenuCategoryInput, Restaurant } from '@/types';
import AppModal from '@/components/common/AppModal.vue';
import SectionCard from '@/components/common/SectionCard.vue';
import { createMenuCategory, deleteMenuCategory, listAdminCategories, updateMenuCategory } from '@/services/menu.service';
import { listRestaurants } from '@/services/restaurant.service';

const router = useRouter();
const categories = ref<AdminCategory[]>([]);
const restaurants = ref<Restaurant[]>([]);
const query = ref('');
const saving = ref(false);
const message = ref('');
const error = ref('');
const isCategoryModalOpen = ref(false);
const editingCategoryId = ref<string | null>(null);

const blankCategoryForm = (): MenuCategoryInput => ({
  restaurantId: '',
  name: '',
});

const categoryForm = reactive<MenuCategoryInput>(blankCategoryForm());

const filteredCategories = computed(() => {
  const term = query.value.trim().toLowerCase();
  if (!term) {
    return categories.value;
  }

  return categories.value.filter((entry) =>
    [entry.category.name, entry.restaurantName, ...entry.category.items.map((item) => item.name)].some((value) => value.toLowerCase().includes(term)),
  );
});

const restaurantCoverage = computed(() => new Set(categories.value.map((entry) => entry.restaurantId)).size);
const totalProducts = computed(() => categories.value.reduce((sum, entry) => sum + entry.category.items.length, 0));
const largestCategoryEntry = computed(() =>
  categories.value.reduce<AdminCategory | null>((largest, entry) => {
    if (!largest || entry.category.items.length > largest.category.items.length) {
      return entry;
    }
    return largest;
  }, null),
);
const largestCategoryName = computed(() => largestCategoryEntry.value?.category.name ?? 'No categories');
const largestCategoryCount = computed(() => largestCategoryEntry.value?.category.items.length ?? 0);

async function load() {
  categories.value = await listAdminCategories();
  restaurants.value = await listRestaurants();
}

onMounted(load);

function resetCategoryForm() {
  editingCategoryId.value = null;
  Object.assign(categoryForm, blankCategoryForm());
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

function healthTag(itemCount: number) {
  if (itemCount >= 6) {
    return 'Strong';
  }
  if (itemCount >= 3) {
    return 'Growing';
  }
  return 'Light';
}

function healthLabel(itemCount: number) {
  if (itemCount >= 6) {
    return 'This category has strong product depth.';
  }
  if (itemCount >= 3) {
    return 'This category has a balanced product mix.';
  }
  return 'This category could use more products.';
}

function healthTone(itemCount: number) {
  if (itemCount >= 6) {
    return 'bg-emerald-100 text-emerald-700';
  }
  if (itemCount >= 3) {
    return 'bg-amber-100 text-amber-700';
  }
  return 'bg-slate-200 text-slate-700';
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

function openProductsFor() {
  void router.push('/admin/products');
}
</script>



