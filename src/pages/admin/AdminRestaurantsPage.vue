<template>
  <SectionCard eyebrow="Restaurant Operations" title="Restaurant and branch CRUD" description="Create, edit, verify, and delete partner restaurants plus their delivery branches.">
    <template #actions>
      <button class="btn-primary" type="button" @click="openCreateModal">Create restaurant</button>
    </template>

    <div class="space-y-4">
      <div v-for="restaurant in restaurants" :key="restaurant.id" class="surface-muted p-5">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 class="text-xl font-bold text-slate-950">{{ restaurant.name }}</h3>
            <p class="mt-2 text-sm text-slate-500">{{ restaurant.cuisine.join(' | ') }}</p>
          </div>
          <div class="flex items-center gap-3">
            <StatusBadge :status="restaurant.status" />
            <span class="pill" :class="restaurant.verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'">
              {{ restaurant.verified ? 'Verified' : 'Pending Review' }}
            </span>
          </div>
        </div>
        <div class="mt-4 grid gap-3 md:grid-cols-2">
          <div v-for="branch in restaurant.branches" :key="branch.id" class="rounded-2xl bg-white p-4">
            <p class="font-semibold text-slate-900">{{ branch.name }}</p>
            <p class="mt-1 text-sm text-slate-500">{{ branch.zone }}</p>
          </div>
        </div>
        <div class="mt-4 flex flex-wrap gap-3">
          <button class="btn-secondary px-3 py-2" type="button" @click="startEdit(restaurant.id)">Edit</button>
          <button class="btn-secondary px-3 py-2" type="button" @click="toggleVerify(restaurant.id)">{{ restaurant.verified ? 'Unverify' : 'Verify' }}</button>
          <button class="rounded-2xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100" type="button" @click="removeRestaurant(restaurant.id)">Delete</button>
        </div>
      </div>
    </div>

    <p v-if="message" class="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ message }}</p>
    <p v-if="error" class="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{{ error }}</p>
  </SectionCard>

  <AppModal
    :open="isModalOpen"
    eyebrow="Restaurant Management"
    :title="editingId ? 'Edit restaurant profile' : 'Create restaurant profile'"
    description="Use the popup form to manage restaurant information, cuisine tags, and branch coverage."
    size="xl"
    @close="closeModal"
  >
    <form class="space-y-4" @submit.prevent="submitRestaurant">
      <div>
        <label class="field-label" for="restaurant-name">Restaurant name</label>
        <input id="restaurant-name" v-model="form.name" class="field-input" type="text" required />
      </div>
      <div>
        <label class="field-label" for="restaurant-cuisine">Cuisine tags</label>
        <input id="restaurant-cuisine" v-model="cuisineInput" class="field-input" type="text" placeholder="Thai, Rice Bowls" />
      </div>
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label class="field-label" for="delivery-time">Delivery time</label>
          <input id="delivery-time" v-model="form.deliveryTime" class="field-input" type="text" placeholder="20-30 min" required />
        </div>
        <div>
          <label class="field-label" for="delivery-fee">Delivery fee</label>
          <input id="delivery-fee" v-model.number="form.deliveryFee" class="field-input" type="number" min="0" required />
        </div>
      </div>
      <div>
        <label class="field-label" for="cover-image">Cover image URL</label>
        <input id="cover-image" v-model="form.coverImage" class="field-input" type="url" required />
      </div>
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label class="field-label" for="status">Status</label>
          <select id="status" v-model="form.status" class="field-input">
            <option value="Open">Open</option>
            <option value="Busy">Busy</option>
            <option value="Paused">Paused</option>
          </select>
        </div>
        <div>
          <label class="field-label" for="hero-color">Hero gradient classes</label>
          <input id="hero-color" v-model="form.heroColor" class="field-input" type="text" placeholder="from-orange-500 to-amber-400" required />
        </div>
      </div>
      <label class="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <input v-model="form.verified" type="checkbox" />
        Verified restaurant
      </label>

      <div class="rounded-3xl border border-slate-200 p-4">
        <div class="mb-3 flex items-center justify-between gap-3">
          <div>
            <p class="text-sm font-semibold text-slate-900">Branches</p>
            <p class="text-xs text-slate-500">Add branch locations inside the popup form.</p>
          </div>
          <button class="btn-secondary px-3 py-2" type="button" @click="addBranch">Add branch</button>
        </div>
        <div class="space-y-3">
          <div v-for="(branch, index) in form.branches" :key="branch.id" class="rounded-2xl bg-slate-50 p-4">
            <div class="grid gap-3 lg:grid-cols-[1.1fr_0.9fr_0.55fr_0.55fr_auto] lg:items-end">
              <div>
                <label class="field-label">Branch name</label>
                <input v-model="branch.name" class="field-input" type="text" placeholder="Branch name" />
              </div>
              <div>
                <label class="field-label">Zone</label>
                <input v-model="branch.zone" class="field-input" type="text" placeholder="Zone" />
              </div>
              <div>
                <label class="field-label">Lat</label>
                <input v-model.number="branch.lat" class="field-input" type="number" step="0.0001" placeholder="Latitude" />
              </div>
              <div>
                <label class="field-label">Lng</label>
                <input v-model.number="branch.lng" class="field-input" type="number" step="0.0001" placeholder="Longitude" />
              </div>
              <button class="rounded-2xl bg-rose-50 px-3 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-100" type="button" @click="removeBranch(index)">Remove</button>
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-wrap gap-3 pt-2">
        <button class="btn-primary" :disabled="saving">{{ saving ? 'Saving...' : editingId ? 'Update restaurant' : 'Create restaurant' }}</button>
        <button class="btn-secondary" type="button" @click="closeModal">Cancel</button>
      </div>
    </form>
  </AppModal>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import type { Branch, Restaurant } from '@/types';
import AppModal from '@/components/common/AppModal.vue';
import SectionCard from '@/components/common/SectionCard.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { buildBranch, createRestaurant, deleteRestaurant, listRestaurants, updateRestaurant } from '@/services/restaurant.service';

const restaurants = ref<Restaurant[]>([]);
const editingId = ref<string | null>(null);
const saving = ref(false);
const message = ref('');
const error = ref('');
const cuisineInput = ref('');
const isModalOpen = ref(false);

const blankForm = () => ({
  name: '',
  deliveryTime: '20-30 min',
  deliveryFee: 29,
  coverImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
  status: 'Open',
  verified: false,
  heroColor: 'from-orange-500 to-amber-400',
  branches: [buildBranch()],
});

const form = reactive(blankForm());

async function load() {
  restaurants.value = await listRestaurants();
}

onMounted(load);

function resetForm() {
  editingId.value = null;
  Object.assign(form, blankForm());
  cuisineInput.value = '';
}

function openCreateModal() {
  resetForm();
  message.value = '';
  error.value = '';
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
  resetForm();
}

function addBranch() {
  form.branches.push(buildBranch());
}

function removeBranch(index: number) {
  if (form.branches.length === 1) {
    return;
  }
  form.branches.splice(index, 1);
}

function startEdit(restaurantId: string) {
  const restaurant = restaurants.value.find((entry) => entry.id === restaurantId);
  if (!restaurant) {
    return;
  }

  editingId.value = restaurantId;
  cuisineInput.value = restaurant.cuisine.join(', ');
  Object.assign(form, {
    name: restaurant.name,
    deliveryTime: restaurant.deliveryTime,
    deliveryFee: restaurant.deliveryFee,
    coverImage: restaurant.coverImage,
    status: restaurant.status,
    verified: restaurant.verified,
    heroColor: restaurant.heroColor,
    branches: restaurant.branches.map((branch) => ({ ...branch })),
  });
  message.value = '';
  error.value = '';
  isModalOpen.value = true;
}

async function submitRestaurant() {
  saving.value = true;
  message.value = '';
  error.value = '';
  try {
    const payload = {
      name: form.name.trim(),
      cuisine: cuisineInput.value.split(',').map((item) => item.trim()).filter(Boolean),
      deliveryTime: form.deliveryTime.trim(),
      deliveryFee: Number(form.deliveryFee),
      coverImage: form.coverImage.trim(),
      status: form.status,
      verified: form.verified,
      heroColor: form.heroColor.trim(),
      branches: form.branches.map((branch: Branch) => ({
        ...branch,
        name: branch.name.trim(),
        zone: branch.zone.trim(),
        lat: Number(branch.lat),
        lng: Number(branch.lng),
      })),
    };

    if (!payload.cuisine.length) {
      throw new Error('Please add at least one cuisine tag.');
    }

    if (editingId.value) {
      await updateRestaurant(editingId.value, payload);
      message.value = 'Restaurant updated.';
    } else {
      await createRestaurant(payload);
      message.value = 'Restaurant created.';
    }

    await load();
    closeModal();
  } catch (incoming) {
    error.value = incoming instanceof Error ? incoming.message : 'Unable to save restaurant.';
  } finally {
    saving.value = false;
  }
}

async function toggleVerify(restaurantId: string) {
  const restaurant = restaurants.value.find((entry) => entry.id === restaurantId);
  if (!restaurant) {
    return;
  }

  await updateRestaurant(restaurantId, {
    name: restaurant.name,
    cuisine: restaurant.cuisine,
    deliveryTime: restaurant.deliveryTime,
    deliveryFee: restaurant.deliveryFee,
    coverImage: restaurant.coverImage,
    status: restaurant.status,
    verified: !restaurant.verified,
    heroColor: restaurant.heroColor,
    branches: restaurant.branches,
  });
  message.value = 'Verification status updated.';
  await load();
}

async function removeRestaurant(restaurantId: string) {
  const confirmed = window.confirm('Delete this restaurant and its branches from the frontend dataset?');
  if (!confirmed) {
    return;
  }

  await deleteRestaurant(restaurantId);
  message.value = 'Restaurant deleted.';
  await load();
  if (editingId.value === restaurantId) {
    closeModal();
  }
}
</script>
