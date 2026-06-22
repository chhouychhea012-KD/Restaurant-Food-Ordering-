import { ref } from 'vue';

export function useGeolocation() {
  const coords = ref({ lat: 13.7563, lng: 100.5018 });
  const loading = ref(false);

  async function locate() {
    loading.value = true;
    await new Promise((resolve) => setTimeout(resolve, 350));
    loading.value = false;
    return coords.value;
  }

  return {
    coords,
    loading,
    locate,
  };
}
