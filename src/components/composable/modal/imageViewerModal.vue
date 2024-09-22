<template>
  <Modal :modelValue="isOpen" id="imageViewer">
    <div
      class="card flex flex-col items-center font-serif p-4 mx-4 md:mx-0 relative max-h-screen"
    >
      <img :src="imageUrl" class="p-2 max-h-[500px]" />
    </div>
  </Modal>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import Modal from '@/components/ui/modal.vue';
  import { uiStore } from '@/store';

  const isOpen = computed(() => uiStore.activeModal === 'imageViewer');
  const imageUrl = computed(() => uiStore.imageViewerOptions?.imageUrl || '');
</script>
