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

  <AlertModal
    id="deleteDataAlert"
    :message="deleteDataMessage"
    @cancel="cancelDeleteData"
    @confirm="deleteData"
  />
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { PhTrash } from '@phosphor-icons/vue';
  import { notesStore, uiStore } from '@/store';
  import Button from '@/components/ui/button.vue';
  import AlertModal from '@/components/composable/modal/alertModal.vue';

  const deleteDataMessage = ref('');

  const showDeleteDataAlert = () => {
    deleteDataMessage.value =
      'Are you sure you want to delete all of your data? This action cannot be undone.';
    uiStore.setActiveModal('deleteDataAlert');
  };

  const cancelDeleteData = () => {
    uiStore.setActiveModal(null);
  };

  const deleteData = () => {
    uiStore.setActiveModal(null);
    notesStore.deleteAllNotes();
    uiStore.showToastMessage('All data deleted successfully');
  };
</script>
