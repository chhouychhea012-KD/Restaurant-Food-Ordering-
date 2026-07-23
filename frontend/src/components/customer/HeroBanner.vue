<template>
  <section class="surface-card overflow-hidden bg-gradient-to-br from-orange-50 via-white to-emerald-50 text-slate-900">
    <div class="grid lg:min-h-[520px] lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)]">
      <div class="flex flex-col justify-center px-4 py-8 sm:px-10 sm:py-10 lg:px-12">
        <p class="text-xs font-bold uppercase tracking-[0.22em] text-brand-600">Golden Land Restaurant</p>
        <h1 class="mt-4 max-w-xl text-3xl font-extrabold leading-tight sm:text-5xl">
          Fresh meals, clear delivery, no clutter.
        </h1>
        <p class="mt-4 max-w-lg text-base leading-7 text-slate-600">
          Browse top restaurants, order from one branch, and track every handoff.
        </p>
        <div class="mt-7 flex flex-wrap gap-3">
          <RouterLink to="/restaurants" class="btn-primary">Browse food</RouterLink>
          <RouterLink to="/auth/login" class="btn-secondary border-brand-200 bg-white text-brand-700 hover:bg-brand-50">Demo login</RouterLink>
        </div>

        <div class="mt-8 grid max-w-xl grid-cols-1 gap-3 min-[420px]:grid-cols-3 sm:mt-10">
          <div v-for="metric in heroMetrics" :key="metric.label" class="rounded-lg border border-orange-100 bg-white/80 px-3 py-3 shadow-sm">
            <p class="text-lg font-bold text-slate-900">{{ metric.value }}</p>
            <p class="mt-1 text-xs text-slate-500">{{ metric.label }}</p>
          </div>
        </div>
      </div>

      <div v-if="activeSlide" class="relative min-h-[320px] overflow-hidden sm:min-h-[420px] lg:min-h-[460px]">
        <transition name="hero-slide" mode="out-in">
          <img :key="activeSlide.id" :src="activeSlide.image" :alt="activeSlide.name" class="absolute inset-0 h-full w-full object-cover" />
        </transition>
        <div class="absolute inset-0 bg-gradient-to-t from-orange-950/72 via-orange-950/12 to-transparent lg:bg-gradient-to-r lg:from-orange-950/18 lg:via-transparent lg:to-transparent" />

        <div class="absolute inset-x-3 bottom-3 rounded-lg border border-white/35 bg-white/90 p-3 text-slate-900 shadow-xl backdrop-blur sm:inset-x-8 sm:bottom-8 sm:p-4">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="min-w-0">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">{{ activeSlide.restaurantName }}</p>
              <h2 class="mt-2 text-xl font-bold text-slate-950 sm:text-2xl">{{ activeSlide.name }}</h2>
              <p class="mt-2 line-clamp-1 text-sm text-slate-600">{{ activeSlide.description }}</p>
            </div>
            <span class="rounded-md bg-brand-500 px-3 py-1 text-sm font-bold text-white">{{ formatPrice(activeSlide.price) }}</span>
          </div>
          <div class="mt-4 flex items-center justify-between gap-4">
            <div class="flex flex-wrap gap-2">
              <span class="pill bg-orange-50 text-brand-700">{{ activeSlide.categoryName }}</span>
              <span class="pill bg-orange-50 text-brand-700">{{ activeSlide.deliveryTime }}</span>
            </div>
            <div class="flex gap-2">
              <button
                v-for="(slide, index) in slides"
                :key="slide.id"
                class="h-2 rounded-full transition-all"
                :class="index === activeSlideIndex ? 'w-7 bg-brand-500' : 'w-2 bg-orange-200 hover:bg-brand-300'"
                type="button"
                :aria-label="`Show ${slide.name}`"
                @click="setActiveSlide(index)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { useRestaurantStore } from '@/stores/restaurant.store';

interface HeroSlide {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  restaurantName: string;
  categoryName: string;
  deliveryTime: string;
}

const restaurantStore = useRestaurantStore();
const activeSlideIndex = ref(0);
let autoPlayTimer: ReturnType<typeof setInterval> | null = null;

const slides = computed<HeroSlide[]>(() => {
  return restaurantStore.restaurants
    .flatMap((restaurant) =>
      restaurant.menuCategories.flatMap((category) =>
        category.items
          .filter((item) => item.available)
          .map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            image: item.image,
            restaurantName: restaurant.name,
            categoryName: category.name,
            deliveryTime: restaurant.deliveryTime,
          })),
      ),
    )
    .slice(0, 6);
});

const activeSlide = computed(() => slides.value[activeSlideIndex.value] ?? null);
const heroMetrics = computed(() => [
  { label: 'Restaurants', value: restaurantStore.restaurants.length || 0 },
  { label: 'Avg delivery', value: '27 min' },
  { label: 'Orders tracked', value: 'Live' },
]);

function startAutoPlay() {
  stopAutoPlay();

  if (slides.value.length <= 1) {
    return;
  }

  autoPlayTimer = setInterval(() => {
    goToNextSlide(false);
  }, 3600);
}

function stopAutoPlay() {
  if (!autoPlayTimer) {
    return;
  }

  clearInterval(autoPlayTimer);
  autoPlayTimer = null;
}

function setActiveSlide(index: number) {
  activeSlideIndex.value = index;
  startAutoPlay();
}

function goToNextSlide(restart = true) {
  if (!slides.value.length) {
    return;
  }

  activeSlideIndex.value = (activeSlideIndex.value + 1) % slides.value.length;

  if (restart) {
    startAutoPlay();
  }
}

function formatPrice(price: number) {
  return `$ ${price}`;
}

watch(
  slides,
  (nextSlides) => {
    if (!nextSlides.length) {
      activeSlideIndex.value = 0;
      stopAutoPlay();
      return;
    }

    if (activeSlideIndex.value >= nextSlides.length) {
      activeSlideIndex.value = 0;
    }

    startAutoPlay();
  },
  { immediate: true },
);

onMounted(() => {
  if (!restaurantStore.restaurants.length) {
    void restaurantStore.loadAll();
  }
});

onBeforeUnmount(() => {
  stopAutoPlay();
});
</script>

<style scoped>
.hero-slide-enter-active,
.hero-slide-leave-active {
  transition: opacity 260ms ease, transform 260ms ease;
}

.hero-slide-enter-from,
.hero-slide-leave-to {
  opacity: 0;
  transform: scale(1.02);
}
</style>