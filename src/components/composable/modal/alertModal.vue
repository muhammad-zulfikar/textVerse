<template>
  <Modal :modelValue="isOpen" :id="id">
    <div
      class="card flex flex-col relative p-5 w-11/12 md:w-3/4 lg:w-1/2 xl:w-1/3 font-serif"
    >
      <h1 class="text-xl font-bold mb-4 relative">Alert</h1>
      <p class="mb-6">{{ message }}</p>
      <div class="flex justify-end">
        <button
          @click="$emit('cancel')"
          class="flex items-center px-2 py-1 card hover:bg-cream-300 dark:hover:bg-gray-700 mr-4 cursor-pointer"
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
  </Modal>
</template>

<script setup lang="ts">
  import { PhProhibit, PhCheckCircle } from '@phosphor-icons/vue';
  import Modal from '@/components/ui/modal.vue';
  import { computed } from 'vue';
  import { uiStore } from '@/store';

  const props = defineProps<{
    id: string;
    message: string;
  }>();

  const emit = defineEmits<{
    (e: 'cancel'): void;
    (e: 'confirm'): void;
  }>();

  const isOpen = computed(() => uiStore.activeModal === props.id);
</script>
