<template>
  <div
    class="flex flex-col md:flex-row items-start md:items-center md:justify-between"
  >
    <div class="flex-grow">
      <h4 class="text-lg font-semibold mb-1">Delete your data</h4>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        This action cannot be undone
      </p>
    </div>
    <button
      @click="confirmDeleteData"
      class="card flex items-center justify-center w-full md:w-auto text-sm md:text-base text-red-600 dark:text-red-500 py-2 px-4 mt-4 md:mt-0"
    >
      <PhTrash :size="20" class="mr-2" />
      Delete all data
    </button>
  </div>

  <AlertModal
    :is-open="showDeleteDataConfirmation"
    :message="'Are you sure you want to delete all of your data? This action cannot be undone.'"
    @cancel="showDeleteDataConfirmation = false"
    @confirm="deleteData"
  />
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { PhTrash } from '@phosphor-icons/vue';
  import { notesStore, uiStore } from '@/store';
  import AlertModal from '@/components/ui/modal/alertModal.vue';

  const showDeleteDataConfirmation = ref(false);

  const confirmDeleteData = () => {
    showDeleteDataConfirmation.value = true;
  };

  const deleteData = () => {
    notesStore.deleteAllNotes();
    showDeleteDataConfirmation.value = false;
    uiStore.showToastMessage('All data deleted successfully');
  };
</script>
