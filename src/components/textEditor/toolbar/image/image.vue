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
  import { ref } from 'vue';
  import { PhImage } from '@phosphor-icons/vue';

  const imageInputRef = ref<HTMLInputElement | null>(null);
  const emit = defineEmits(['imageUploaded']);

  const triggerImageUpload = () => imageInputRef.value?.click();

  const handleImageUpload = (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imgSrc = e.target?.result as string;
        const img = document.createElement('img');
        img.src = imgSrc;
        img.style.maxWidth = '100%';
        img.style.cursor = 'pointer';
        img.onclick = () => emit('imageUploaded', imgSrc);
        document.execCommand('insertHTML', false, img.outerHTML);
      };
      reader.readAsDataURL(file);
    }
  };
</script>
