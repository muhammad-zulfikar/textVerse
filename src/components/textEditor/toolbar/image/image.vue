<!--image.vue-->

<template>
  <button @click="triggerImageUpload" title="Insert Image">
    <PhImage :size="20" />
  </button>
  <input
    type="file"
    ref="imageInputRef"
    @change="handleImageUpload"
    accept="image/*"
    style="display: none"
  />
</template>

<script setup lang="ts">
  import { ref, inject } from 'vue';
  import { PhImage } from '@phosphor-icons/vue';

  const imageInputRef = ref<HTMLInputElement | null>(null);
  const insertImage = inject<(imgSrc: string) => void>('insertImage');

  const triggerImageUpload = () => imageInputRef.value?.click();

  const handleImageUpload = (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file && insertImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imgSrc = e.target?.result as string;
        insertImage(imgSrc);
      };
      reader.readAsDataURL(file);
    }
  };
</script>
