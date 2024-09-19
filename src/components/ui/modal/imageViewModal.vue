<template>
  <ModalBackdrop v-model="props.isOpen" />
  <transition name="zoom">
    <div
      v-if="props.isOpen"
      class="fixed inset-0 z-40 flex items-center justify-center"
    >
      <div @click="closeModal" class="absolute inset-0"></div>
      <div
        @click.stop
        class="card flex flex-col items-center z-50 font-serif p-4 mx-4 md:mx-0 relative max-h-screen"
      >
        <img :src="avatarUrl" class="p-2 max-h-[500px]" alt="Avatar" />
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
  import ModalBackdrop from '@/components/ui/modal/backdropModal.vue';

  const props = defineProps<{
    isOpen: boolean;
    avatarUrl: string;
  }>();

  const emit = defineEmits<{
    (e: 'close'): void;
  }>();

  const closeModal = () => {
    emit('close');
  };
</script>
