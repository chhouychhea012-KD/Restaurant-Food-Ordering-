<template>
  <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
    <div class="grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center">
      <div class="relative aspect-[4/3] overflow-hidden rounded-lg border border-slate-200 bg-white">
        <img v-if="modelValue" :src="modelValue" :alt="previewAlt" class="h-full w-full object-cover" />
        <div v-else class="flex h-full w-full items-center justify-center px-4 text-center text-sm font-semibold text-slate-400">
          No image
        </div>
      </div>

      <div class="min-w-0">
        <p class="text-sm font-semibold text-slate-900">{{ label }}</p>
        <p v-if="help" class="mt-1 text-xs text-slate-500">{{ help }}</p>
        <div class="mt-4 flex flex-wrap gap-3">
          <label class="btn-primary cursor-pointer" :for="inputId">Upload image</label>
          <input :id="inputId" class="sr-only" type="file" accept="image/*" @change="handleFileChange" />
          <button v-if="modelValue" class="btn-secondary" type="button" @click="clearImage">Remove</button>
        </div>
        <p v-if="localError" class="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">{{ localError }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { readImageFile } from '@/utils/image-upload';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    label: string;
    help?: string;
    previewAlt?: string;
    maxBytes?: number;
  }>(),
  {
    help: 'JPG, PNG, or WebP. Max 3 MB.',
    previewAlt: 'Image preview',
    maxBytes: 3_000_000,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
  error: [message: string];
}>();

const localError = ref('');
const inputId = computed(() => `image-upload-${Math.random().toString(36).slice(2, 10)}`);

async function handleFileChange(event: Event) {
  const input = event.target instanceof HTMLInputElement ? event.target : null;
  const file = input?.files?.[0];
  if (!file) {
    return;
  }

  localError.value = '';
  try {
    emit('update:modelValue', await readImageFile(file, props.maxBytes));
  } catch (incoming) {
    const message = incoming instanceof Error ? incoming.message : 'Unable to upload this image.';
    localError.value = message;
    emit('error', message);
  } finally {
    if (input) {
      input.value = '';
    }
  }
}

function clearImage() {
  localError.value = '';
  emit('update:modelValue', '');
}
</script>