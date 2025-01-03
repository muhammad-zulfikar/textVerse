<template>
  <Modal :modelValue="isOpen" id="alert">
    <div
      class="card flex flex-col relative p-5 w-11/12 md:w-3/4 lg:w-1/2 xl:w-1/3 font-serif"
    >
      <h1 class="text-xl font-bold mb-4 relative">Alert</h1>
      <p class="mb-6">{{ message }}</p>
      <div class="flex justify-end space-x-3">
        <button
          @click="handleCancel"
          class="flex items-center px-2 py-1 card hover:bg-cream-300 dark:hover:bg-gray-700 cursor-pointer"
        >
          <PhArrowLeft :size="20" class="mr-2" />
          <span class="text-sm">Cancel</span>
        </button>
        <button
          @click="handleDontSave"
          class="flex items-center px-2 py-1 card text-red-500 hover:text-red-100 hover:bg-red-700/50 dark:hover:bg-red-800/60 cursor-pointer"
        >
          <PhX :size="20" class="mr-2" />
          <span class="text-sm">Don't Save</span>
        </button>
        <button
          @click="handleConfirm"
          class="flex items-center px-2 py-1 card text-blue-500 hover:text-blue-100 hover:bg-blue-700/50 dark:hover:bg-blue-800/60 cursor-pointer"
        >
          <PhCheckCircle :size="20" class="mr-2" />
          <span class="text-sm">Save</span>
        </button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { PhArrowLeft, PhX, PhCheckCircle } from '@phosphor-icons/vue';
  import Modal from '@/components/ui/modal.vue';
  import { uiStore } from '@/store';

  const isOpen = computed(() => uiStore.activeModal === 'saveAlert');
  const message = computed(() => uiStore.saveAlertOptions?.message ?? '');

  const handleCancel = () => {
    if (uiStore.saveAlertOptions?.cancel) {
      uiStore.saveAlertOptions.cancel();
    }
    uiStore.saveAlertOptions = null;
    uiStore.setActiveModal(null);
  };

  const handleDontSave = () => {
    if (uiStore.saveAlertOptions?.dontSave) {
      uiStore.saveAlertOptions.dontSave();
    }
    uiStore.saveAlertOptions = null;
    uiStore.setActiveModal(null);
  };

  const handleConfirm = () => {
    if (uiStore.saveAlertOptions?.save) {
      uiStore.saveAlertOptions.save();
    }
    uiStore.saveAlertOptions = null;
    uiStore.setActiveModal(null);
  };
</script>
