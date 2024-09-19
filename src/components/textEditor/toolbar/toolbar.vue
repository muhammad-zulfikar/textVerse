<template>
  <div class="toolbar flex">
    <div class="flex mr-4">
      <Heading />
    </div>

    <div class="flex mr-6">
      <TextFormat />
    </div>

    <div class="flex mr-6">
      <TextAlign />
    </div>

    <div class="flex mr-6">
      <List />
    </div>

    <div class="flex space-x-1">
      <Link />
      <Image @imageUploaded="handleImageUploaded" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import Heading from './heading/heading.vue';
  import TextFormat from './textFormat/textFormat.vue';
  import TextAlign from './textAlign/textAlign.vue';
  import List from './list/list.vue';
  import Link from './link/link.vue';
  import Image from './image/image.vue';

  const isImageModalOpen = ref(false);
  const currentImageUrl = ref('');

  const handleImageUploaded = (imageUrl: string) => {
    currentImageUrl.value = imageUrl;
    isImageModalOpen.value = true;
  };
</script>
