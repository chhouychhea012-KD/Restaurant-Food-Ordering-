<template>
  <section class="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-orange-600 px-6 py-10 text-white shadow-glow sm:px-10">
    <div class="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18),transparent_55%)] lg:block" />
    <div class="absolute left-10 top-10 h-32 w-32 rounded-full bg-orange-300/15 blur-3xl" />
    <div class="absolute bottom-6 right-10 h-40 w-40 rounded-full bg-cyan-300/10 blur-3xl" />

    <div class="relative grid gap-10 xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,560px)] xl:items-center">
      <div class="max-w-2xl">
        <p class="text-xs font-bold uppercase tracking-[0.35em] text-orange-200">MVP Frontend Experience</p>
        <h1 class="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">
          Premium ordering flows for customers, operators, kitchens, and riders.
        </h1>
        <p class="mt-4 max-w-xl text-sm leading-7 text-slate-200 sm:text-base">
          Browse verified restaurants, build single-store carts, check out with delivery fee previews, and follow orders across every operational handoff.
        </p>
        <div class="mt-6 flex flex-wrap gap-3">
          <RouterLink to="/restaurants" class="btn-primary bg-white text-slate-950 hover:bg-orange-100">Explore Restaurants</RouterLink>
          <RouterLink to="/auth/login" class="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/20">
            Open Demo Access
          </RouterLink>
        </div>
      </div>

      <div v-if="activeSlide" class=" relative mx-auto w-full max-w-[540px] xl:justify-self-end xl:pl-16 xl:pr-36">
        <div class=" -left-12 mb-4 top-10 hidden w-40 rounded-[1.5rem] border border-white/15 bg-white/10 p-3 shadow-[0_20px_60px_rgba(15,23,42,0.24)] backdrop-blur xl:block">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-orange-200">Ready Fast</p>
          <p class="mt-2 text-2xl font-extrabold text-white">{{ activeSlide.deliveryTime }}</p>
          <p class="mt-1 text-sm text-slate-200">Single-store checkout with live cart flow.</p>
        </div>

        <div class=" -right-7 absolute  hidden space-y-3 xl:block">
          <button
            v-for="preview in previewSlides"
            :key="preview.id"
            class="preview-card flex w-40 items-center gap-3 rounded-[1.5rem] border border-white/15 bg-white/10 p-3 text-left shadow-[0_20px_60px_rgba(15,23,42,0.24)] backdrop-blur transition hover:-translate-y-1 hover:bg-white/15"
            type="button"
            @click="setActiveSlide(preview.slideIndex)"
          >
            <img :src="preview.image" :alt="preview.name" class="h-14 w-14 rounded-[1rem] object-cover" />
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-white">{{ preview.name }}</p>
              <p class="mt-1 text-xs text-slate-200">{{ formatPrice(preview.price) }}</p>
            </div>
          </button>
        </div>

        <transition name="hero-slide" mode="out-in">
          <article
            :key="activeSlide.id"
            class="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 shadow-[0_28px_90px_rgba(15,23,42,0.3)] backdrop-blur"
          >
            <div class="relative aspect-[4/5] overflow-hidden">
              <img :src="activeSlide.image" :alt="activeSlide.name" class="h-full w-full object-cover" />
              <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.04),rgba(15,23,42,0.2)_45%,rgba(15,23,42,0.88))]" />
              <div class="absolute left-4 top-4 flex flex-wrap gap-2">
                <span class="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur">{{ activeSlide.categoryName }}</span>
                <span class="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur">{{ activeSlide.prepTime }} min prep</span>
              </div>

              <div class="absolute inset-x-0 bottom-0 p-5">
                <div class="rounded-[1.5rem] border border-white/15 bg-slate-950/35 p-4 backdrop-blur-md">
                  <div class="flex items-start justify-between gap-4">
                    <div class="min-w-0">
                      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-orange-200">{{ activeSlide.restaurantName }}</p>
                      <h3 class="mt-2 text-2xl font-bold text-white">{{ activeSlide.name }}</h3>
                    </div>
                    <span class="shrink-0 rounded-full bg-white px-3 py-1 text-sm font-bold text-slate-950">{{ formatPrice(activeSlide.price) }}</span>
                  </div>
                  <p class="mt-3 line-clamp-2 text-sm leading-6 text-slate-200">{{ activeSlide.description }}</p>
                  <div class="mt-4 flex flex-wrap gap-2">
                    <span class="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">{{ activeSlide.cuisineLabel }}</span>
                    <span class="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">Featured item</span>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </transition>

        <div class="mt-4 rounded-[1.25rem] border border-white/15 bg-white/10 px-4 py-3 backdrop-blur xl:hidden">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-orange-200">Ready Fast</p>
              <p class="mt-1 text-lg font-bold text-white">{{ activeSlide.deliveryTime }}</p>
            </div>
            <p class="max-w-[11rem] text-right text-xs leading-5 text-slate-200">Single-store checkout with live cart flow.</p>
          </div>
        </div>

        <div class="mt-5 flex items-center justify-between gap-4 rounded-[1.5rem] border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(slide, index) in slides"
              :key="slide.id"
              class="h-2.5 rounded-full transition-all"
              :class="index === activeSlideIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/35 hover:bg-white/60'"
              type="button"
              :aria-label="`Show ${slide.name}`"
              @click="setActiveSlide(index)"
            />
          </div>

          <button
            class="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-white/10"
            type="button"
            @click="goToNextSlide()"
          >
            Next
            <span aria-hidden="true">+</span>
          </button>
        </div>

        <div class="mt-4 flex gap-3 overflow-x-auto pb-1 xl:hidden">
          <button
            v-for="preview in previewSlides"
            :key="preview.id"
            class="preview-card flex min-w-[210px] items-center gap-3 rounded-[1.5rem] border border-white/15 bg-white/10 p-3 text-left shadow-[0_20px_60px_rgba(15,23,42,0.24)] backdrop-blur transition hover:-translate-y-1 hover:bg-white/15"
            type="button"
            @click="setActiveSlide(preview.slideIndex)"
          >
            <img :src="preview.image" :alt="preview.name" class="h-14 w-14 rounded-[1rem] object-cover" />
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-white">{{ preview.name }}</p>
              <p class="mt-1 text-xs text-slate-200">{{ formatPrice(preview.price) }}</p>
            </div>
          </button>
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
  prepTime: number;
  cuisineLabel: string;
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
            prepTime: item.prepTime,
            cuisineLabel: restaurant.cuisine[0] ?? 'Featured',
          })),
      ),
    )
    .slice(0, 6);
});

const activeSlide = computed(() => slides.value[activeSlideIndex.value] ?? null);
const previewSlides = computed(() => {
  if (slides.value.length <= 1) {
    return [];
  }

  return slides.value
    .map((slide, index) => ({
      ...slide,
      slideIndex: index,
      offset: (index - activeSlideIndex.value + slides.value.length) % slides.value.length,
    }))
    .filter((slide) => slide.offset > 0 && slide.offset <= 3)
    .sort((first, second) => first.offset - second.offset);
});

function startAutoPlay() {
  stopAutoPlay();

  if (slides.value.length <= 1) {
    return;
  }

  autoPlayTimer = setInterval(() => {
    goToNextSlide(false);
  }, 3200);
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
  transition: opacity 220ms ease, transform 220ms ease;
}

.hero-slide-enter-from {
  opacity: 0;
  transform: translateY(14px) scale(0.98);
}

.hero-slide-leave-to {
  opacity: 0;
  transform: translateY(-14px) scale(1.01);
}

.preview-card {
  animation: float-card 5.8s ease-in-out infinite;
}

.preview-card:nth-child(2) {
  animation-delay: 0.9s;
}

.preview-card:nth-child(3) {
  animation-delay: 1.8s;
}

@keyframes float-card {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-4px);
  }
}
</style>

