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
    <Button
      variant="danger"
      @click="showDeleteDataAlert"
      class="w-full md:w-auto text-sm md:text-base py-2 px-4 mt-4 md:mt-0"
    >
      <PhTrash :size="20" class="mr-2" />
      Delete all data
    </Button>
  </div>
</template>

<script setup lang="ts">
  import { PhTrash } from '@phosphor-icons/vue';
  import { notesStore, uiStore } from '@/store';
  import Button from '@/components/ui/button.vue';

  const showDeleteDataAlert = () => {
    uiStore.openAlertModal({
      message: `Are you sure you want to delete all of your data?`,
      confirm: async () => {
        try {
          await notesStore.deleteAllNotes();
          uiStore.setActiveModal(null);
          uiStore.showToastMessage('All data deleted successfully');
        } catch (error) {
          uiStore.showToastMessage('Failed to delete your data');
        }
      },
      cancel: () => {
        uiStore.setActiveModal(null);
      },
    });
  };
</script>
