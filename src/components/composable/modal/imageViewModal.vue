<template>
  <Modal :modelValue="isOpen" :id="id">
    <div
      class="card flex flex-col items-center font-serif p-4 mx-4 md:mx-0 relative max-h-screen"
    >
      <img :src="avatarUrl" class="p-2 max-h-[500px]" alt="Avatar" />
    </div>
  </Modal>
</template>

<script setup lang="ts">
  import Modal from '@/components/ui/modal.vue';
  import { uiStore } from '@/store';
  import { computed } from 'vue';

  const props = defineProps<{
    id: string;
    avatarUrl: string;
  }>();

  const isOpen = computed(() => uiStore.activeModal === props.id);
</script>
