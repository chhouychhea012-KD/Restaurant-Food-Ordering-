import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { User } from '@/types';
import { listRiders, toggleRiderAvailability } from '@/services/rider.service';

export const useRiderStore = defineStore('riders', () => {
  const riders = ref<User[]>([]);
  const loading = ref(false);

  async function loadAll() {
    loading.value = true;
    riders.value = await listRiders();
    loading.value = false;
  }

  async function toggleAvailability(userId: string) {
    const rider = await toggleRiderAvailability(userId);
    if (rider) {
      riders.value = riders.value.map((entry) => (entry.id === rider.id ? rider : entry));
    }
    return rider;
  }

  return {
    riders,
    loading,
    loadAll,
    toggleAvailability,
  };
});
