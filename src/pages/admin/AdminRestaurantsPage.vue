<template>
  <div class="space-y-8">
    <SectionCard 
      eyebrow="Restaurant Operations" 
      title="Restaurants & Branches" 
      description="Manage partner restaurants, their branches, and operational details."
    >
      <template #actions>
        <button class="btn-primary flex items-center gap-2" @click="openCreateModal">
          <Plus :size="18" />
          Add Restaurant
        </button>
      </template>

      <!-- Restaurant Grid -->
      <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <div 
          v-for="restaurant in restaurants" 
          :key="restaurant.id" 
          class="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
        >
          <!-- Header -->
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="text-2xl font-bold text-slate-900">{{ restaurant.name }}</h3>
              <p class="text-sm text-slate-500 mt-1">{{ restaurant.cuisine.join(' • ') }}</p>
            </div>
            <div class="flex flex-col items-end gap-2">
              <StatusBadge :status="restaurant.status" />
              <span 
                class="pill text-xs font-medium"
                :class="restaurant.verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'"
              >
                {{ restaurant.verified ? '✓ Verified' : 'Pending' }}
              </span>
            </div>
          </div>

          <!-- Branches -->
          <div class="mt-6">
            <p class="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Branches ({{ restaurant.branches.length }})</p>
            <div class="space-y-3">
              <div 
                v-for="branch in restaurant.branches" 
                :key="branch.id" 
                class="rounded-2xl bg-slate-50 p-4 text-sm"
              >
                <p class="font-medium">{{ branch.name }}</p>
                <p class="text-slate-500">{{ branch.zone }}</p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-8 flex gap-3">
            <button 
              class="btn-secondary flex-1 flex items-center justify-center gap-2"
              @click="startEdit(restaurant.id)"
            >
              <Edit3 :size="18" /> Edit
            </button>
            <button 
              class="btn-secondary flex-1"
              @click="toggleVerify(restaurant.id)"
            >
              {{ restaurant.verified ? 'Unverify' : 'Verify' }}
            </button>
            <button 
              class="rounded-2xl bg-rose-50 px-5 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-100 transition"
              @click="removeRestaurant(restaurant.id)"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <p v-if="message" class="mt-6 rounded-2xl bg-emerald-50 px-5 py-4 text-sm text-emerald-700">{{ message }}</p>
      <p v-if="error" class="mt-6 rounded-2xl bg-rose-50 px-5 py-4 text-sm text-rose-600">{{ error }}</p>
    </SectionCard>

    <!-- Create/Edit Modal -->
    <AppModal
      :open="isModalOpen"
      eyebrow="Restaurant Management"
      :title="editingId ? 'Edit Restaurant' : 'Add New Restaurant'"
      description="Complete the restaurant profile and manage delivery branches."
      size="xl"
      @close="closeModal"
    >
      <form class="space-y-6" @submit.prevent="submitRestaurant">
        <div class="grid gap-5 md:grid-cols-2">
          <div>
            <label class="field-label" for="name">Restaurant Name</label>
            <input id="name" v-model="form.name" class="field-input" type="text" required />
          </div>
          <div>
            <label class="field-label" for="cuisine">Cuisine Tags</label>
            <input 
              id="cuisine" 
              v-model="cuisineInput" 
              class="field-input" 
              type="text" 
              placeholder="Thai, Asian, Rice Bowls" 
            />
          </div>
        </div>

        <div class="grid gap-5 md:grid-cols-2">
          <div>
            <label class="field-label">Delivery Time</label>
            <input v-model="form.deliveryTime" class="field-input" type="text" placeholder="20-35 min" required />
          </div>
          <div>
            <label class="field-label">Delivery Fee</label>
            <input v-model.number="form.deliveryFee" class="field-input" type="number" min="0" required />
          </div>
        </div>

        <div>
          <label class="field-label">Cover Image URL</label>
          <input v-model="form.coverImage" class="field-input" type="url" required />
        </div>

        <div class="grid gap-5 md:grid-cols-2">
          <div>
            <label class="field-label">Status</label>
            <select v-model="form.status" class="field-input">
              <option value="Open">Open</option>
              <option value="Busy">Busy</option>
              <option value="Paused">Paused</option>
            </select>
          </div>
          <div>
            <label class="field-label">Hero Gradient</label>
            <input v-model="form.heroColor" class="field-input" type="text" placeholder="from-orange-500 to-amber-400" />
          </div>
        </div>

        <label class="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-slate-700">
          <input v-model="form.verified" type="checkbox" class="accent-brand-600" />
          <span class="font-medium">Verified Restaurant</span>
        </label>

        <!-- Branches Section -->
        <div class="rounded-3xl border border-slate-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <p class="font-semibold text-slate-900">Delivery Branches</p>
              <p class="text-sm text-slate-500">Add locations where this restaurant operates</p>
            </div>
            <button type="button" class="btn-secondary flex items-center gap-2" @click="addBranch">
              <Plus :size="16" /> Add Branch
            </button>
          </div>

          <div class="space-y-4 max-h-[380px] overflow-auto pr-2">
            <div 
              v-for="(branch, index) in form.branches" 
              :key="index"
              class="rounded-2xl border border-slate-100 bg-slate-50 p-5"
            >
              <div class="grid gap-4 lg:grid-cols-[1.3fr_1fr_0.8fr_0.8fr_auto]">
                <div>
                  <label class="field-label">Branch Name</label>
                  <input v-model="branch.name" class="field-input" type="text" placeholder="Main Branch" />
                </div>
                <div>
                  <label class="field-label">Zone / Area</label>
                  <input v-model="branch.zone" class="field-input" type="text" placeholder="Downtown" />
                </div>
                <div>
                  <label class="field-label">Latitude</label>
                  <input v-model.number="branch.lat" class="field-input" type="number" step="0.0001" />
                </div>
                <div>
                  <label class="field-label">Longitude</label>
                  <input v-model.number="branch.lng" class="field-input" type="number" step="0.0001" />
                </div>
                <button 
                  type="button" 
                  class="self-end rounded-2xl bg-rose-50 px-4 py-3 text-rose-600 hover:bg-rose-100"
                  @click="removeBranch(index)"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-4 pt-4">
          <button class="btn-primary flex-1" :disabled="saving">
            {{ saving ? 'Saving...' : editingId ? 'Update Restaurant' : 'Create Restaurant' }}
          </button>
          <button type="button" class="btn-secondary flex-1" @click="closeModal">Cancel</button>
        </div>
      </form>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { Plus, Edit3 } from 'lucide-vue-next';

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
  if (form.branches.length === 1) return;
  form.branches.splice(index, 1);
}

function startEdit(restaurantId: string) {
  const restaurant = restaurants.value.find(r => r.id === restaurantId);
  if (!restaurant) return;

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
    branches: restaurant.branches.map(b => ({ ...b })),
  });

  message.value = '';
  error.value = '';
  isModalOpen.value = true;
}

// Keep the rest of your script logic unchanged (submitRestaurant, toggleVerify, removeRestaurant)
async function submitRestaurant() { /* ... your existing logic ... */ }
async function toggleVerify(restaurantId: string) { /* ... your existing logic ... */ }
async function removeRestaurant(restaurantId: string) { /* ... your existing logic ... */ }
</script>