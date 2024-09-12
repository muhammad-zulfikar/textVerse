<!-- alertModal.vue -->

<template>
  <ModalBackdrop v-model="props.isOpen" class="z-60" />
  <transition name="zoom">
    <div
      v-if="props.isOpen"
      class="fixed inset-0 z-60 flex items-center justify-center"
    >
      <div
        class="p-5 relative flex flex-col w-11/12 md:w-3/4 lg:w-1/2 xl:w-1/3 font-serif"
        :class="[uiStore.blurEnabled ? 'card-blur' : 'card']"
      >
        <h1 class="text-xl font-bold mb-4 relative mt-2">Confirmation</h1>
        <p class="mb-6">{{ message }}</p>
        <div class="flex justify-end">
          <button
            @click="$emit('cancel')"
            class="flex items-center px-2 py-1 card hover:bg-[#d9c698] dark:hover:bg-gray-700 mr-4 cursor-pointer"
          >
            <PhProhibit :size="20" class="mr-2" />
            <span class="text-sm">Cancel</span>
          </button>
          <button
            @click="$emit('confirm')"
            class="flex items-center px-2 py-1 card text-red-500 hover:text-red-100 hover:bg-red-700/50 dark:hover:bg-red-800/60 cursor-pointer"
          >
            <PhCheckCircle :size="20" class="mr-2" />
            <span class="text-sm">Proceed</span>
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
  import { PhProhibit, PhCheckCircle } from '@phosphor-icons/vue';
  import { uiStore } from '@/utils/stores';
  import ModalBackdrop from '@/components/ui/modal/backdropModal.vue';

  const props = defineProps<{
    isOpen: boolean;
    message: string;
  }>();

  defineEmits<{
    (e: 'cancel'): void;
    (e: 'confirm'): void;
  }>();
</script>
