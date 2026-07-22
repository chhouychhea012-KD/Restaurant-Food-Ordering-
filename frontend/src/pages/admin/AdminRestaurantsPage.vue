<template>
  <div class="space-y-8">
    <SectionCard eyebrow="Restaurants" title="Partners and branches">
      <template #actions>
        <button class="btn-primary flex items-center gap-2" type="button" @click="openCreateModal">
          <Plus :size="18" />
          Add restaurant
        </button>
      </template>

      <div v-if="loading" class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <div v-for="index in 3" :key="index" class="surface-muted animate-pulse p-6">
          <div class="h-6 w-48 rounded bg-slate-200"></div>
          <div class="mt-3 h-4 w-40 rounded bg-slate-200"></div>
          <div class="mt-6 h-36 rounded bg-slate-200"></div>
        </div>
      </div>

      <div v-else-if="restaurants.length" class="space-y-4">
        <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <label class="sr-only" for="restaurant-search">Search restaurants</label>
          <input id="restaurant-search" v-model="query" class="field-input bg-white" type="search" placeholder="Search restaurant, cuisine, status, or branch" />
        </div>

        <div class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div class="thin-scrollbar overflow-x-auto">
            <table class="w-full min-w-[920px] text-left text-sm">
              <thead class="bg-slate-50 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                <tr>
                  <th class="px-5 py-4">Restaurant</th>
                  <th class="px-5 py-4">Cuisine</th>
                  <th class="px-5 py-4">Partner</th>
                  <th class="px-5 py-4">Branches</th>
                  <th class="px-5 py-4">Commission</th>
                  <th class="px-5 py-4">Rating</th>
                  <th class="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="restaurant in filteredRestaurants" :key="restaurant.id" class="transition hover:bg-orange-50/40">
                  <td class="px-5 py-4"><p class="font-bold text-slate-950">{{ restaurant.name }}</p><p class="mt-1 text-xs text-slate-500">{{ restaurant.status }}</p></td>
                  <td class="px-5 py-4"><span class="pill bg-slate-100 text-slate-700">{{ restaurant.cuisine.slice(0, 2).join(', ') }}</span></td>
                  <td class="px-5 py-4"><span class="pill" :class="partnerStatusClass(restaurant.partnerStatus)">{{ restaurant.partnerStatus }}</span></td>
                  <td class="px-5 py-4 font-bold text-slate-950">{{ restaurant.branches.length }}</td>
                  <td class="px-5 py-4 text-slate-700">{{ Math.round((restaurant.commissionRate ?? 0) * 100) }}%</td>
                  <td class="px-5 py-4 text-slate-700">{{ restaurant.rating.toFixed(1) }}</td>
                  <td class="px-5 py-4">
                    <div class="relative flex justify-end">
                      <button class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-900" type="button" @click.stop="toggleActionMenu(restaurant.id)"><MoreVertical :size="18" /></button>
                      <div v-if="openActionMenuRestaurantId === restaurant.id" class="absolute right-0 top-11 z-30 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
                        <button class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50" type="button" @click="editFromMenu(restaurant.id)"><Pencil :size="15" /> Edit</button>
                        <button class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50" type="button" @click="verifyFromMenu(restaurant.id)"><BadgeCheck :size="15" /> {{ restaurant.verified ? 'Unverify' : 'Verify' }}</button>
                        <button class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50" type="button" @click="statusFromMenu(restaurant)"><ShieldAlert :size="15" /> Status</button>
                        <button class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50" type="button" @click="deleteFromMenu(restaurant.id)"><Trash2 :size="15" /> Delete</button>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <EmptyState v-else title="No restaurants yet" message="Create the first restaurant and branch set to start partner operations." />

      <p v-if="message" class="mt-6 rounded-lg bg-emerald-50 px-5 py-4 text-sm text-emerald-700">{{ message }}</p>
      <p v-if="error" class="mt-6 rounded-lg bg-rose-50 px-5 py-4 text-sm text-rose-600">{{ error }}</p>
    </SectionCard>

    <AppModal
      :open="isModalOpen"
      eyebrow="Restaurant Management"
      :title="editingId ? 'Edit restaurant' : 'Add new restaurant'"
      description="Profile, standing, and branches."
      size="xl"
      @close="closeModal"
    >
      <form class="space-y-6" @submit.prevent="submitRestaurant">
        <div class="grid gap-5 md:grid-cols-2">
          <div>
            <label class="field-label" for="name">Restaurant name</label>
            <input id="name" v-model="form.name" class="field-input" type="text" required />
          </div>
          <div>
            <label class="field-label" for="cuisine">Cuisine tags</label>
            <input id="cuisine" v-model="cuisineInput" class="field-input" type="text" placeholder="Thai, Asian, Rice Bowls" />
          </div>
        </div>

        <div>
          <label class="field-label" for="description">Description</label>
          <textarea id="description" v-model="form.description" class="field-input min-h-24" required />
        </div>

        <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label class="field-label">Delivery time</label>
            <input v-model="form.deliveryTime" class="field-input" type="text" placeholder="20-35 min" required />
          </div>
          <div>
            <label class="field-label">Delivery fee</label>
            <input v-model.number="form.deliveryFee" class="field-input" type="number" min="0" required />
          </div>
          <div>
            <label class="field-label">Commission rate</label>
            <input v-model.number="form.commissionRate" class="field-input" type="number" min="0" max="1" step="0.01" required />
          </div>
          <div>
            <label class="field-label">Review count</label>
            <input v-model.number="form.reviewCount" class="field-input" type="number" min="0" required />
          </div>
        </div>

        <div class="grid gap-5 md:grid-cols-[1.2fr_0.8fr]">
          <ImageUploadField
            v-model="form.coverImage"
            label="Restaurant cover image"
            help="Upload a storefront cover photo. JPG, PNG, or WebP. Max 3 MB."
            :preview-alt="form.name || 'Restaurant cover preview'"
            @error="error = $event"
          />
          <div>
            <label class="field-label">Hero gradient</label>
            <input v-model="form.heroColor" class="field-input" type="text" placeholder="from-orange-500 to-amber-400" />
          </div>
        </div>

        <div class="grid gap-5 md:grid-cols-3">
          <div>
            <label class="field-label">Operational status</label>
            <select v-model="form.status" class="field-input">
              <option value="Open">Open</option>
              <option value="Busy">Busy</option>
              <option value="Paused">Paused</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <div>
            <label class="field-label">Partner status</label>
            <select v-model="form.partnerStatus" class="field-input">
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <label class="flex items-center gap-3 rounded-xl bg-slate-50 p-4 text-slate-700 md:mt-8">
            <input v-model="form.verified" type="checkbox" class="accent-brand-600" />
            <span class="font-medium">Verified restaurant</span>
          </label>
        </div>

        <div v-if="form.partnerStatus === 'suspended'" class="rounded-xl border border-rose-200 bg-rose-50 p-5">
          <label class="field-label" for="suspension-reason">Suspension reason</label>
          <textarea id="suspension-reason" v-model="form.suspensionReason" class="field-input min-h-24" placeholder="Describe why this partner is suspended" required />
        </div>

        <div class="rounded-xl border border-slate-200 p-6">
          <div class="mb-4 flex items-center justify-between">
            <div>
              <p class="font-semibold text-slate-900">Delivery branches</p>
              <p class="text-sm text-slate-500">Phone, prep targets, hours, and closures.</p>
            </div>
            <button type="button" class="btn-secondary flex items-center gap-2" @click="addBranch">
              <Plus :size="16" /> Add branch
            </button>
          </div>

          <div class="max-h-[420px] space-y-4 overflow-auto pr-2">
            <div v-for="(branch, index) in form.branches" :key="branch.id || index" class="rounded-xl border border-slate-100 bg-slate-50 p-5">
              <div class="grid gap-4 xl:grid-cols-4">
                <div>
                  <label class="field-label">Branch name</label>
                  <input v-model="branch.name" class="field-input" type="text" placeholder="Main Branch" />
                </div>
                <div>
                  <label class="field-label">Zone / Area</label>
                  <input v-model="branch.zone" class="field-input" type="text" placeholder="Downtown" />
                </div>
                <div>
                  <label class="field-label">Phone</label>
                  <input v-model="branch.phone" class="field-input" type="tel" placeholder="+66 800 000 000" />
                </div>
                <div>
                  <label class="field-label">Branch status</label>
                  <select v-model="branch.status" class="field-input">
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="paused">Paused</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div class="mt-4 grid gap-4 xl:grid-cols-4">
                <div>
                  <label class="field-label">Latitude</label>
                  <input v-model.number="branch.lat" class="field-input" type="number" step="0.0001" />
                </div>
                <div>
                  <label class="field-label">Longitude</label>
                  <input v-model.number="branch.lng" class="field-input" type="number" step="0.0001" />
                </div>
                <div>
                  <label class="field-label">Avg prep minutes</label>
                  <input v-model.number="branch.averagePrepMinutes" class="field-input" type="number" min="1" />
                </div>
                <div>
                  <label class="field-label">Minimum order</label>
                  <input v-model.number="branch.minimumOrderAmount" class="field-input" type="number" min="0" />
                </div>
              </div>

              <div class="mt-4 grid gap-4 lg:grid-cols-2">
                <div>
                  <label class="field-label">Operating hours</label>
                  <textarea v-model="branchOperatingHours[index]" class="field-input min-h-28" placeholder="Mon 10:00-21:00&#10;Tue 10:00-21:00&#10;Sun closed"></textarea>
                </div>
                <div>
                  <label class="field-label">Holiday closures</label>
                  <textarea v-model="branchHolidayClosures[index]" class="field-input min-h-28" placeholder="2026-12-31 | New Year's Eve&#10;2027-01-01 | New Year's Day"></textarea>
                </div>
              </div>

              <div class="mt-4 flex justify-end">
                <button type="button" class="rounded-xl bg-rose-50 px-4 py-3 text-rose-600 transition hover:bg-rose-100" @click="removeBranch(index)">Remove</button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap gap-3 pt-2">
          <button class="btn-primary" :disabled="saving">{{ saving ? 'Saving...' : editingId ? 'Update restaurant' : 'Create restaurant' }}</button>
          <button type="button" class="btn-secondary" @click="closeModal">Cancel</button>
        </div>
      </form>
    </AppModal>

    <AppModal
      :open="isStatusModalOpen"
      eyebrow="Partner Standing"
      title="Update partner status"
      description="Verification and suspension changes are logged."
      size="md"
      @close="closeStatusModal"
    >
      <form class="space-y-4" @submit.prevent="submitStatusChange">
        <div>
          <label class="field-label" for="partner-status">Partner status</label>
          <select id="partner-status" v-model="statusForm.partnerStatus" class="field-input">
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <div v-if="statusForm.partnerStatus === 'suspended'">
          <label class="field-label" for="partner-reason">Suspension reason</label>
          <textarea id="partner-reason" v-model="statusForm.suspensionReason" class="field-input min-h-24" required />
        </div>
        <div class="flex gap-3 pt-2">
          <button class="btn-primary" :disabled="saving">{{ saving ? 'Saving...' : 'Update status' }}</button>
          <button class="btn-secondary" type="button" @click="closeStatusModal">Cancel</button>
        </div>
      </form>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { BadgeCheck, MoreVertical, Pencil, Plus, ShieldAlert, Trash2 } from 'lucide-vue-next';
import type { Branch, BranchOperatingHour, HolidayClosure, Restaurant, RestaurantInput, RestaurantPartnerStatus } from '@/types';
import AppModal from '@/components/common/AppModal.vue';
import { useAppDialog } from '@/composables/useAppDialog';
import EmptyState from '@/components/common/EmptyState.vue';
import SectionCard from '@/components/common/SectionCard.vue';
import ImageUploadField from '@/components/forms/ImageUploadField.vue';
import { formatCurrency } from '@/utils/format';
import {
  buildBranch,
  createRestaurant,
  deleteRestaurant,
  listRestaurants,
  setRestaurantPartnerStatus,
  setRestaurantVerification,
  updateRestaurant,
} from '@/services/restaurant.service';

const { confirmDialog } = useAppDialog();
const restaurants = ref<Restaurant[]>([]);
const loading = ref(false);
const editingId = ref<string | null>(null);
const saving = ref(false);
const message = ref('');
const error = ref('');
const cuisineInput = ref('');
const isModalOpen = ref(false);
const isStatusModalOpen = ref(false);
const selectedRestaurant = ref<Restaurant | null>(null);
const branchOperatingHours = ref<string[]>([]);
const branchHolidayClosures = ref<string[]>([]);
const query = ref('');
const openActionMenuRestaurantId = ref<string | null>(null);

const filteredRestaurants = computed(() => {
  const term = query.value.trim().toLowerCase();
  if (!term) {
    return restaurants.value;
  }
  return restaurants.value.filter((restaurant) =>
    [restaurant.name, restaurant.status, restaurant.partnerStatus ?? '', restaurant.cuisine.join(' '), ...restaurant.branches.map((branch) => `${branch.name} ${branch.zone}`)]
      .join(' ')
      .toLowerCase()
      .includes(term),
  );
});
const blankForm = (): RestaurantInput => ({
  name: '',
  cuisine: [],
  description: 'A new restaurant profile for the Golden Land Restaurant partner network.',
  deliveryTime: '20-30 min',
  deliveryFee: 29,
  coverImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
  status: 'Open',
  verified: false,
  partnerStatus: 'pending',
  suspensionReason: null,
  commissionRate: 0.18,
  reviewCount: 48,
  heroColor: 'from-orange-500 to-amber-400',
  branches: [buildBranch()],
});

const form = reactive<RestaurantInput>(blankForm());
const statusForm = reactive({
  partnerStatus: 'pending' as RestaurantPartnerStatus,
  suspensionReason: '',
});

async function load() {
  loading.value = true;
  try {
    restaurants.value = await listRestaurants();
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void load();
  window.addEventListener('click', closeActionMenu);
});

onBeforeUnmount(() => {
  window.removeEventListener('click', closeActionMenu);
});

function toggleActionMenu(restaurantId: string) {
  openActionMenuRestaurantId.value = openActionMenuRestaurantId.value === restaurantId ? null : restaurantId;
}

function closeActionMenu() {
  openActionMenuRestaurantId.value = null;
}

function editFromMenu(restaurantId: string) {
  closeActionMenu();
  startEdit(restaurantId);
}

function verifyFromMenu(restaurantId: string) {
  closeActionMenu();
  void toggleVerify(restaurantId);
}

function statusFromMenu(restaurant: Restaurant) {
  closeActionMenu();
  openStatusModal(restaurant);
}

function deleteFromMenu(restaurantId: string) {
  closeActionMenu();
  void removeRestaurantRecord(restaurantId);
}
function resetForm() {
  editingId.value = null;
  Object.assign(form, blankForm());
  cuisineInput.value = '';
  branchOperatingHours.value = form.branches.map((branch) => stringifyOperatingHours(branch.operatingHours));
  branchHolidayClosures.value = form.branches.map((branch) => stringifyHolidayClosures(branch.holidayClosures));
}

function syncBranchTextareas(branches: Branch[]) {
  branchOperatingHours.value = branches.map((branch) => stringifyOperatingHours(branch.operatingHours));
  branchHolidayClosures.value = branches.map((branch) => stringifyHolidayClosures(branch.holidayClosures));
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

function openStatusModal(restaurant: Restaurant) {
  selectedRestaurant.value = restaurant;
  statusForm.partnerStatus = restaurant.partnerStatus ?? 'pending';
  statusForm.suspensionReason = restaurant.suspensionReason ?? '';
  message.value = '';
  error.value = '';
  isStatusModalOpen.value = true;
}

function closeStatusModal() {
  isStatusModalOpen.value = false;
  selectedRestaurant.value = null;
  statusForm.partnerStatus = 'pending';
  statusForm.suspensionReason = '';
}

function addBranch() {
  form.branches.push(buildBranch());
  branchOperatingHours.value.push(stringifyOperatingHours(form.branches.at(-1)?.operatingHours));
  branchHolidayClosures.value.push('');
}

function removeBranch(index: number) {
  if (form.branches.length === 1) {
    return;
  }
  form.branches.splice(index, 1);
  branchOperatingHours.value.splice(index, 1);
  branchHolidayClosures.value.splice(index, 1);
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
    cuisine: [...restaurant.cuisine],
    description: restaurant.description ?? '',
    deliveryTime: restaurant.deliveryTime,
    deliveryFee: restaurant.deliveryFee,
    coverImage: restaurant.coverImage,
    status: restaurant.status,
    verified: restaurant.verified,
    partnerStatus: restaurant.partnerStatus ?? 'pending',
    suspensionReason: restaurant.suspensionReason ?? null,
    commissionRate: restaurant.commissionRate ?? 0.18,
    reviewCount: restaurant.reviewCount ?? 0,
    heroColor: restaurant.heroColor,
    branches: restaurant.branches.map((branch) => ({ ...branch, operatingHours: branch.operatingHours?.map((entry) => ({ ...entry })), holidayClosures: branch.holidayClosures?.map((entry) => ({ ...entry })) })),
  });
  syncBranchTextareas(form.branches);
  message.value = '';
  error.value = '';
  isModalOpen.value = true;
}

function partnerStatusClass(status?: RestaurantPartnerStatus) {
  switch (status) {
    case 'verified':
      return 'bg-emerald-100 text-emerald-700';
    case 'suspended':
      return 'bg-rose-100 text-rose-700';
    case 'rejected':
      return 'bg-slate-200 text-slate-700';
    case 'pending':
    default:
      return 'bg-amber-100 text-amber-700';
  }
}

function parseOperatingHours(input: string): BranchOperatingHour[] {
  const lines = input.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) {
    return buildBranch().operatingHours ?? [];
  }

  return lines.map((line, index) => {
    const [dayPart, rangePart] = line.split(/\s+/, 2);
    const label = dayPart || `Day ${index + 1}`;
    if (!rangePart || rangePart.toLowerCase() === 'closed') {
      return { day: index % 7, label, open: '00:00', close: '00:00', closed: true };
    }
    const [open, close] = rangePart.split('-');
    return {
      day: index % 7,
      label,
      open: open || '10:00',
      close: close || '21:00',
      closed: false,
    };
  });
}

function parseHolidayClosures(input: string): HolidayClosure[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [date, label] = line.split('|').map((part) => part.trim());
      return {
        id: `holiday-${index}-${crypto.randomUUID()}`,
        date,
        label: label || 'Holiday closure',
      } satisfies HolidayClosure;
    })
    .filter((entry) => entry.date);
}

function stringifyOperatingHours(entries?: BranchOperatingHour[]) {
  return (entries ?? [])
    .map((entry) => `${entry.label} ${entry.closed ? 'closed' : `${entry.open}-${entry.close}`}`)
    .join('\n');
}

function stringifyHolidayClosures(entries?: HolidayClosure[]) {
  return (entries ?? []).map((entry) => `${entry.date} | ${entry.label}`).join('\n');
}

function buildPayload(): RestaurantInput {
  const cuisine = cuisineInput.value.split(',').map((item) => item.trim()).filter(Boolean);
  const branches = form.branches
    .map((branch, index) => ({
      ...branch,
      name: branch.name.trim(),
      zone: branch.zone.trim(),
      phone: branch.phone?.trim() || '+66 800 000 000',
      lat: Number(branch.lat),
      lng: Number(branch.lng),
      averagePrepMinutes: Number(branch.averagePrepMinutes ?? 18),
      minimumOrderAmount: Number(branch.minimumOrderAmount ?? 150),
      operatingHours: parseOperatingHours(branchOperatingHours.value[index] ?? ''),
      holidayClosures: parseHolidayClosures(branchHolidayClosures.value[index] ?? ''),
    }))
    .filter((branch) => branch.name && branch.zone);

  if (!form.name.trim()) {
    throw new Error('Please enter a restaurant name.');
  }
  if (!form.description.trim()) {
    throw new Error('Please enter a restaurant description.');
  }
  if (!cuisine.length) {
    throw new Error('Please provide at least one cuisine tag.');
  }
  if (!branches.length) {
    throw new Error('Please add at least one branch with a name and zone.');
  }
  if (!form.coverImage.trim()) {
    throw new Error('Please upload a restaurant cover image.');
  }
  if (form.partnerStatus === 'suspended' && !form.suspensionReason?.trim()) {
    throw new Error('Please provide a suspension reason.');
  }

  return {
    name: form.name.trim(),
    cuisine,
    description: form.description.trim(),
    deliveryTime: form.deliveryTime.trim(),
    deliveryFee: Number(form.deliveryFee),
    coverImage: form.coverImage.trim(),
    status: form.status,
    verified: form.verified,
    partnerStatus: form.partnerStatus,
    suspensionReason: form.partnerStatus === 'suspended' ? form.suspensionReason?.trim() || null : null,
    commissionRate: Number(form.commissionRate),
    reviewCount: Number(form.reviewCount),
    heroColor: form.heroColor.trim(),
    branches: branches as Branch[],
  };
}

async function submitRestaurant() {
  saving.value = true;
  message.value = '';
  error.value = '';

  try {
    const payload = buildPayload();

    if (editingId.value) {
      await updateRestaurant(editingId.value, payload);
      message.value = 'Restaurant updated successfully.';
    } else {
      await createRestaurant(payload);
      message.value = 'Restaurant created successfully.';
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

  try {
    await setRestaurantVerification(restaurantId, !restaurant.verified);
    message.value = `${restaurant.name} ${restaurant.verified ? 'moved back to pending verification.' : 'is now verified.'}`;
    error.value = '';
    await load();
  } catch (incoming) {
    error.value = incoming instanceof Error ? incoming.message : 'Unable to update verification.';
  }
}

async function submitStatusChange() {
  if (!selectedRestaurant.value) {
    return;
  }

  saving.value = true;
  message.value = '';
  error.value = '';
  try {
    await setRestaurantPartnerStatus(selectedRestaurant.value.id, statusForm.partnerStatus, statusForm.suspensionReason);
    message.value = `${selectedRestaurant.value.name} moved to ${statusForm.partnerStatus}.`;
    await load();
    closeStatusModal();
  } catch (incoming) {
    error.value = incoming instanceof Error ? incoming.message : 'Unable to update partner status.';
  } finally {
    saving.value = false;
  }
}

async function removeRestaurantRecord(restaurantId: string) {
  const restaurant = restaurants.value.find((entry) => entry.id === restaurantId);
  if (!restaurant) {
    return;
  }

  const confirmed = await confirmDialog({
    title: 'Delete restaurant',
    message: `Delete ${restaurant.name} from the admin dataset?`,
    confirmLabel: 'Delete restaurant',
    tone: 'danger',
  });
  if (!confirmed) {
    return;
  }

  try {
    await deleteRestaurant(restaurantId);
    message.value = 'Restaurant deleted successfully.';
    error.value = '';
    await load();
    if (editingId.value === restaurantId) {
      closeModal();
    }
  } catch (incoming) {
    error.value = incoming instanceof Error ? incoming.message : 'Unable to delete restaurant.';
  }
}
</script>