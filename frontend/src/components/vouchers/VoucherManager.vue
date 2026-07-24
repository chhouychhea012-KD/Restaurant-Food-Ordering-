<template>
  <div class="space-y-6">
    <SectionCard eyebrow="Voucher Codes" :title="title" description="Create customer voucher codes for checkout discounts, delivery offers, and restaurant campaigns.">
      <template #actions>
        <div class="flex flex-wrap gap-3">
          <input v-model="query" class="field-input w-full sm:w-72" type="search" placeholder="Search code, title, or restaurant" />
          <button v-if="canManage" class="btn-secondary" type="button" @click="openPromoModal">Create promo event</button>
          <button v-if="canManage" class="btn-primary" type="button" @click="openCreateModal">Create voucher</button>
        </div>
      </template>

      <div class="grid gap-4 md:grid-cols-3">
        <div class="surface-muted p-5">
          <p class="text-sm font-semibold text-slate-600">Active vouchers</p>
          <p class="mt-2 text-3xl font-bold text-slate-950">{{ activeCount }}</p>
        </div>
        <div class="surface-muted p-5">
          <p class="text-sm font-semibold text-slate-600">Restaurant vouchers</p>
          <p class="mt-2 text-3xl font-bold text-slate-950">{{ restaurantVoucherCount }}</p>
        </div>
        <div class="surface-muted p-5">
          <p class="text-sm font-semibold text-slate-600">Used count</p>
          <p class="mt-2 text-3xl font-bold text-slate-950">{{ totalUsed }}</p>
        </div>
      </div>

      <div v-if="filteredVouchers.length" class="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="safe-table-wrap">
          <table class="w-full min-w-[980px] text-left text-sm">
            <thead class="bg-slate-50 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              <tr>
                <th class="px-5 py-4">Code</th>
                <th class="px-5 py-4">Offer</th>
                <th class="px-5 py-4">Restaurant</th>
                <th class="px-5 py-4">Minimum</th>
                <th class="px-5 py-4">Usage</th>
                <th class="px-5 py-4">Status</th>
                <th v-if="canManage" class="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="voucher in filteredVouchers" :key="voucher.id" class="transition hover:bg-orange-50/40">
                <td class="px-5 py-4">
                  <p class="font-bold text-slate-950">{{ voucher.code }}</p>
                  <p class="text-xs text-slate-500">{{ voucher.title }}</p>
                </td>
                <td class="px-5 py-4 text-slate-700">{{ discountLabel(voucher) }}</td>
                <td class="px-5 py-4 text-slate-700">{{ voucher.restaurantName ?? 'Platform-wide' }}</td>
                <td class="px-5 py-4 text-slate-700">{{ formatCurrency(voucher.minSubtotal) }}</td>
                <td class="px-5 py-4 text-slate-700">{{ voucher.usedCount }} / {{ voucher.usageLimit ?? 'Unlimited' }}</td>
                <td class="px-5 py-4"><span class="pill" :class="voucher.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'">{{ voucher.active ? 'Active' : 'Inactive' }}</span></td>
                <td class="px-5 py-4">
                  <div class="flex justify-end gap-2">
                    <button class="btn-secondary px-3 py-2" type="button" @click="openEditModal(voucher)">Edit</button>
                    <button class="btn-secondary px-3 py-2 text-rose-600" type="button" @click="remove(voucher)">Delete</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else class="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-10 text-center">
        <p class="text-lg font-semibold text-slate-900">No voucher codes found</p>
        <p class="mt-2 text-sm text-slate-500">Create a voucher code so customers can apply it in the cart.</p>
      </div>

      <p v-if="message" class="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ message }}</p>
      <p v-if="error" class="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{{ error }}</p>
    </SectionCard>

    <AppModal :open="modalOpen" :eyebrow="promoMode ? 'Promo Event' : 'Voucher CRUD'" :title="modalTitle" :description="modalDescription" size="md" @close="closeModal">
      <form class="space-y-4" @submit.prevent="submit">
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="field-label" for="voucher-code-input">Code</label>
            <input id="voucher-code-input" v-model="form.code" class="field-input uppercase" type="text" placeholder="GOLDEN20" required />
          </div>
          <div>
            <label class="field-label" for="voucher-title">Title</label>
            <input id="voucher-title" v-model="form.title" class="field-input" type="text" placeholder="Golden 20" required />
          </div>
        </div>

        <div>
          <label class="field-label" for="voucher-description">Description</label>
          <textarea id="voucher-description" v-model="form.description" class="field-input min-h-24" placeholder="Short customer-facing campaign note." />
        </div>

        <div>
          <label class="field-label" for="voucher-restaurant">Restaurant</label>
          <select id="voucher-restaurant" v-model="form.restaurantId" class="field-input" :required="ownerMode">
            <option v-if="!ownerMode" value="">Platform-wide</option>
            <option v-for="restaurant in restaurantOptions" :key="restaurant.id" :value="restaurant.id">{{ restaurant.name }}</option>
          </select>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="field-label" for="voucher-type">Discount type</label>
            <select id="voucher-type" v-model="form.discountType" class="field-input">
              <option value="fixed">Fixed amount</option>
              <option value="percentage">Percentage</option>
              <option value="free_delivery">Free delivery</option>
            </select>
          </div>
          <div>
            <label class="field-label" for="voucher-value">Discount value</label>
            <input id="voucher-value" v-model.number="form.discountValue" class="field-input" type="number" min="0" step="0.01" :disabled="form.discountType === 'free_delivery'" />
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-3">
          <div>
            <label class="field-label" for="voucher-min">Minimum subtotal</label>
            <input id="voucher-min" v-model.number="form.minSubtotal" class="field-input" type="number" min="0" step="0.01" />
          </div>
          <div>
            <label class="field-label" for="voucher-max">Max discount</label>
            <input id="voucher-max" v-model.number="form.maxDiscount" class="field-input" type="number" min="0" step="0.01" placeholder="Optional" />
          </div>
          <div>
            <label class="field-label" for="voucher-limit">Usage limit</label>
            <input id="voucher-limit" v-model.number="form.usageLimit" class="field-input" type="number" min="0" step="1" placeholder="Unlimited" />
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="field-label" for="voucher-start">Starts at</label>
            <input id="voucher-start" v-model="form.startsAt" class="field-input" type="datetime-local" />
          </div>
          <div>
            <label class="field-label" for="voucher-end">Ends at</label>
            <input id="voucher-end" v-model="form.endsAt" class="field-input" type="datetime-local" />
          </div>
        </div>



        <div v-if="promoMode" class="rounded-lg border border-orange-100 bg-orange-50/60 p-4">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="text-sm font-bold text-slate-950">Customer promo notification</p>
              <p class="mt-1 text-sm text-slate-600">Send this promo code to all customers now or schedule it for later.</p>
            </div>
            <span class="pill bg-white text-brand-700">Customer audience</span>
          </div>
          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label class="field-label" for="promo-event-type">Event type</label>
              <select id="promo-event-type" v-model="promoForm.eventType" class="field-input" @change="applyPromoTemplate">
                <option value="daily">Daily promo</option>
                <option value="weekly">Weekly promo</option>
                <option value="new_event">New event</option>
                <option value="custom">Custom campaign</option>
              </select>
            </div>
            <div>
              <label class="field-label" for="promo-send-at">Send date and time</label>
              <input id="promo-send-at" v-model="promoForm.scheduledAt" class="field-input" type="datetime-local" />
            </div>
          </div>
          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label class="field-label" for="promo-title">Notification title</label>
              <input id="promo-title" v-model="promoForm.title" class="field-input" type="text" placeholder="Today only: 10% off" required />
            </div>
            <div>
              <label class="field-label" for="promo-message">Customer message</label>
              <textarea id="promo-message" v-model="promoForm.message" class="field-input min-h-24" placeholder="Use code GOLDEN10 at checkout." required />
            </div>
          </div>
        </div>

        <label class="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
          <input v-model="form.active" type="checkbox" />
          Active voucher
        </label>

        <div class="flex flex-wrap gap-3 pt-2">
          <button class="btn-primary" :disabled="saving">{{ saving ? 'Saving...' : editingId ? 'Update voucher' : promoMode ? 'Create and notify customers' : 'Create voucher' }}</button>
          <button class="btn-secondary" type="button" @click="closeModal">Cancel</button>
        </div>
      </form>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import AppModal from '@/components/common/AppModal.vue';
import SectionCard from '@/components/common/SectionCard.vue';
import { useAppDialog } from '@/composables/useAppDialog';
import { useAuthStore } from '@/stores/auth.store';
import type { Restaurant, Voucher, VoucherInput } from '@/types';
import { formatCurrency } from '@/utils/format';
import { createPromoEvent, createVoucher, deleteVoucher, listVouchers, updateVoucher } from '@/services/voucher.service';
import { listRestaurants } from '@/services/restaurant.service';

const props = defineProps<{
  title: string;
  ownerMode?: boolean;
}>();

const authStore = useAuthStore();
const { confirmDialog } = useAppDialog();
const vouchers = ref<Voucher[]>([]);
const restaurants = ref<Restaurant[]>([]);
const query = ref('');
const saving = ref(false);
const modalOpen = ref(false);
const editingId = ref<string | null>(null);
const promoMode = ref(false);
const message = ref('');
const error = ref('');

const ownerRestaurantIds = computed(() => {
  const ids = new Set<string>();
  if (authStore.user?.restaurantId) ids.add(authStore.user.restaurantId);
  authStore.user?.roleAssignments?.forEach((assignment) => assignment.restaurantIds?.forEach((id) => ids.add(id)));
  return [...ids];
});

const blankForm = (): VoucherInput => ({
  code: '',
  title: '',
  description: '',
  discountType: 'fixed',
  discountValue: 10,
  minSubtotal: 0,
  maxDiscount: null,
  usageLimit: null,
  startsAt: null,
  endsAt: null,
  active: true,
  restaurantId: props.ownerMode ? ownerRestaurantIds.value[0] ?? '' : null,
});

const form = reactive<VoucherInput>(blankForm());
const promoForm = reactive({
  eventType: 'daily',
  title: '',
  message: '',
  scheduledAt: '',
});

const restaurantOptions = computed(() => {
  if (!props.ownerMode) return restaurants.value;
  return restaurants.value.filter((restaurant) => ownerRestaurantIds.value.includes(restaurant.id));
});

const filteredVouchers = computed(() => {
  const term = query.value.trim().toLowerCase();
  if (!term) return vouchers.value;
  return vouchers.value.filter((voucher) => [voucher.code, voucher.title, voucher.restaurantName ?? 'Platform-wide'].some((value) => value.toLowerCase().includes(term)));
});

const activeCount = computed(() => vouchers.value.filter((voucher) => voucher.active).length);
const restaurantVoucherCount = computed(() => vouchers.value.filter((voucher) => voucher.restaurantId).length);
const totalUsed = computed(() => vouchers.value.reduce((sum, voucher) => sum + voucher.usedCount, 0));
const canManage = computed(() => authStore.hasPermission('promotions.manage'));
const modalTitle = computed(() => {
  if (editingId.value) return 'Edit voucher';
  return promoMode.value ? 'Create promo event' : 'Create voucher';
});
const modalDescription = computed(() => (promoMode.value ? 'Create a promo code and send it to customer notifications.' : 'Voucher codes become available to customers from the cart apply field.'));

async function load() {
  restaurants.value = await listRestaurants();
  const rows = await listVouchers();
  vouchers.value = props.ownerMode ? rows.filter((voucher) => voucher.restaurantId && ownerRestaurantIds.value.includes(voucher.restaurantId)) : rows;
}

function discountLabel(voucher: Voucher) {
  if (voucher.discountType === 'free_delivery') return 'Free delivery';
  if (voucher.discountType === 'percentage') return `${voucher.discountValue}% off${voucher.maxDiscount ? ` up to ${formatCurrency(voucher.maxDiscount)}` : ''}`;
  return `${formatCurrency(voucher.discountValue)} off`;
}

const discountPreview = computed(() => {
  if (form.discountType === 'free_delivery') return 'free delivery';
  if (form.discountType === 'percentage') return `${Number(form.discountValue || 0)}% off`;
  return `${formatCurrency(Number(form.discountValue || 0))} off`;
});

function resetForm() {
  editingId.value = null;
  promoMode.value = false;
  Object.assign(form, blankForm());
  Object.assign(promoForm, { eventType: 'daily', title: '', message: '', scheduledAt: '' });
}

function openCreateModal() {
  resetForm();
  modalOpen.value = true;
}

function applyPromoTemplate() {
  const code = form.code.trim().toUpperCase().replace(/\s+/g, '') || 'GOLDEN10';
  const title = form.title.trim() || (promoForm.eventType === 'weekly' ? 'Weekly promo' : promoForm.eventType === 'new_event' ? 'New event promo' : 'Daily promo');
  form.title = title;
  promoForm.title = title;
  promoForm.message = `Use promo code ${code} at checkout and enjoy ${discountPreview.value}.`;
}

function openPromoModal() {
  resetForm();
  promoMode.value = true;
  form.code = 'DAILY10';
  form.title = 'Daily promo';
  form.description = 'Customer promo event voucher.';
  form.discountType = 'percentage';
  form.discountValue = 10;
  form.minSubtotal = 10;
  form.active = true;
  applyPromoTemplate();
  modalOpen.value = true;
}

function toLocalDateTime(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function openEditModal(voucher: Voucher) {
  editingId.value = voucher.id;
  Object.assign(form, {
    code: voucher.code,
    title: voucher.title,
    description: voucher.description ?? '',
    discountType: voucher.discountType,
    discountValue: voucher.discountValue,
    minSubtotal: voucher.minSubtotal,
    maxDiscount: voucher.maxDiscount,
    usageLimit: voucher.usageLimit,
    startsAt: toLocalDateTime(voucher.startsAt),
    endsAt: toLocalDateTime(voucher.endsAt),
    active: voucher.active,
    restaurantId: voucher.restaurantId ?? '',
  });
  modalOpen.value = true;
}

function closeModal() {
  modalOpen.value = false;
  resetForm();
}

function payload(): VoucherInput {
  return {
    ...form,
    code: form.code.trim().toUpperCase().replace(/\s+/g, ''),
    discountValue: form.discountType === 'free_delivery' ? 0 : Number(form.discountValue || 0),
    minSubtotal: Number(form.minSubtotal || 0),
    maxDiscount: form.maxDiscount === null || form.maxDiscount === undefined || Number(form.maxDiscount) <= 0 ? null : Number(form.maxDiscount),
    usageLimit: form.usageLimit === null || form.usageLimit === undefined || Number(form.usageLimit) <= 0 ? null : Number(form.usageLimit),
    startsAt: form.startsAt || null,
    endsAt: form.endsAt || null,
    restaurantId: form.restaurantId || null,
  };
}

async function submit() {
  saving.value = true;
  message.value = '';
  error.value = '';
  try {
    if (editingId.value) {
      await updateVoucher(editingId.value, payload());
      message.value = 'Voucher updated.';
    } else if (promoMode.value) {
      const cleanPayload = payload();
      await createPromoEvent({
        ...cleanPayload,
        notification: {
          title: promoForm.title.trim() || cleanPayload.title,
          message: promoForm.message.trim() || `Use promo code ${cleanPayload.code} at checkout.`,
          scheduledAt: promoForm.scheduledAt || null,
        },
      });
      message.value = promoForm.scheduledAt ? 'Promo event created and scheduled for customers.' : 'Promo event created and sent to customers.';
    } else {
      await createVoucher(payload());
      message.value = 'Voucher created.';
    }
    closeModal();
    await load();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to save voucher.';
  } finally {
    saving.value = false;
  }
}

async function remove(voucher: Voucher) {
  const confirmed = await confirmDialog({
    title: 'Delete voucher?',
    message: `Delete ${voucher.code}? Customers will no longer be able to apply this code.`,
    confirmLabel: 'Delete voucher',
    tone: 'danger',
  });
  if (!confirmed) return;

  await deleteVoucher(voucher.id);
  message.value = 'Voucher deleted.';
  await load();
}

watch(() => [form.code, form.discountType, form.discountValue, promoForm.eventType], () => {
  if (promoMode.value) applyPromoTemplate();
});

onMounted(load);
</script>
