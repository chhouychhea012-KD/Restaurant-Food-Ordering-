<template>
  <SectionCard eyebrow="Saved Addresses" title="Manage delivery addresses" description="Saved checkout locations.">
    <template #actions>
      <button class="btn-primary" type="button" @click="openCreateModal">Add address</button>
    </template>

    <div class="grid gap-4 md:grid-cols-2">
      <div v-for="address in addresses" :key="address.id" class="surface-muted p-5">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-lg font-semibold text-slate-950">{{ address.label }}</p>
            <p class="mt-2 text-sm text-slate-600">{{ address.line1 }}</p>
            <p class="text-sm text-slate-500">{{ address.district }}, {{ address.city }}</p>
          </div>
          <span v-if="address.isDefault" class="pill bg-brand-100 text-brand-700">Default</span>
        </div>
        <div class="mt-4 flex flex-wrap gap-3">
          <button class="btn-secondary px-3 py-2" type="button" @click="startEdit(address.id)">Edit</button>
          <button class="btn-secondary px-3 py-2" type="button" @click="makeDefault(address.id)">Set default</button>
          <button class="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100" type="button" @click="remove(address.id)">Delete</button>
        </div>
      </div>
    </div>

    <p v-if="message" class="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ message }}</p>
    <p v-if="error" class="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{{ error }}</p>
  </SectionCard>

  <AppModal
    :open="isModalOpen"
    eyebrow="Customer Address"
    :title="editingId ? 'Edit saved address' : 'Add a new address'"
    description="Label, contact, and location."
    size="md"
    @close="closeModal"
  >
    <form class="space-y-4" @submit.prevent="submitAddress">
      <div>
        <label class="field-label" for="label">Label</label>
        <input id="label" v-model="form.label" class="field-input" type="text" placeholder="Home" required />
      </div>
      <div>
        <label class="field-label" for="line1">Address line</label>
        <input id="line1" v-model="form.line1" class="field-input" type="text" placeholder="88 Sukhumvit Road" required />
      </div>
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label class="field-label" for="district">District</label>
          <input id="district" v-model="form.district" class="field-input" type="text" required />
        </div>
        <div>
          <label class="field-label" for="city">City</label>
          <input id="city" v-model="form.city" class="field-input" type="text" required />
        </div>
      </div>
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label class="field-label" for="lat">Latitude</label>
          <input id="lat" v-model.number="form.lat" class="field-input" type="number" step="0.0001" required />
        </div>
        <div>
          <label class="field-label" for="lng">Longitude</label>
          <input id="lng" v-model.number="form.lng" class="field-input" type="number" step="0.0001" required />
        </div>
      </div>
      <label class="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <input v-model="form.isDefault" type="checkbox" />
        Set as default address
      </label>
      <div class="flex flex-wrap gap-3 pt-2">
        <button class="btn-primary" :disabled="saving">{{ saving ? 'Saving...' : editingId ? 'Update address' : 'Add address' }}</button>
        <button class="btn-secondary" type="button" @click="closeModal">Cancel</button>
      </div>
    </form>
  </AppModal>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import AppModal from '@/components/common/AppModal.vue';
import { useAppDialog } from '@/composables/useAppDialog';
import SectionCard from '@/components/common/SectionCard.vue';
import { addCustomerAddress, deleteCustomerAddress, setDefaultCustomerAddress, updateCustomerAddress } from '@/services/customer.service';
import { useAuthStore } from '@/stores/auth.store';

const { confirmDialog } = useAppDialog();
const authStore = useAuthStore();
const editingId = ref<string | null>(null);
const saving = ref(false);
const message = ref('');
const error = ref('');
const isModalOpen = ref(false);

const blankForm = () => ({
  label: '',
  line1: '',
  district: '',
  city: 'Phnom Penh',
  isDefault: false,
  lat: 11.5526,
  lng: 104.9282,
});

const form = reactive(blankForm());
const addresses = computed(() => authStore.user?.addresses ?? []);

function resetForm() {
  editingId.value = null;
  Object.assign(form, blankForm());
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

function startEdit(addressId: string) {
  const address = addresses.value.find((entry) => entry.id === addressId);
  if (!address) {
    return;
  }

  editingId.value = addressId;
  Object.assign(form, { ...address });
  message.value = '';
  error.value = '';
  isModalOpen.value = true;
}

async function submitAddress() {
  if (!authStore.user) {
    return;
  }

  saving.value = true;
  message.value = '';
  error.value = '';
  try {
    const payload = {
      label: form.label.trim(),
      line1: form.line1.trim(),
      district: form.district.trim(),
      city: form.city.trim(),
      isDefault: form.isDefault,
      lat: Number(form.lat),
      lng: Number(form.lng),
    };

    const updatedUser = editingId.value
      ? await updateCustomerAddress(authStore.user.id, editingId.value, payload)
      : await addCustomerAddress(authStore.user.id, payload);

    if (updatedUser) {
      authStore.setCurrentUser(updatedUser);
      message.value = editingId.value ? 'Address updated.' : 'Address added.';
      closeModal();
    }
  } catch (incoming) {
    error.value = incoming instanceof Error ? incoming.message : 'Unable to save address.';
  } finally {
    saving.value = false;
  }
}

async function makeDefault(addressId: string) {
  if (!authStore.user) {
    return;
  }

  const updatedUser = await setDefaultCustomerAddress(authStore.user.id, addressId);
  if (updatedUser) {
    authStore.setCurrentUser(updatedUser);
    message.value = 'Default address updated.';
  }
}

async function remove(addressId: string) {
  if (!authStore.user) {
    return;
  }

  const confirmed = await confirmDialog({
    title: 'Delete address',
    message: 'Delete this address from the frontend data?',
    confirmLabel: 'Delete address',
    tone: 'danger',
  });
  if (!confirmed) {
    return;
  }

  const updatedUser = await deleteCustomerAddress(authStore.user.id, addressId);
  if (updatedUser) {
    authStore.setCurrentUser(updatedUser);
    message.value = 'Address deleted.';
    if (editingId.value === addressId) {
      closeModal();
    }
  }
}
</script>