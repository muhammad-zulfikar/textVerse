<template>
  <div
    class="flex flex-col md:flex-row items-start md:items-center md:justify-between mb-1"
  >
    <div class="flex-grow">
      <h4 class="text-lg font-semibold mb-1">Backup your data</h4>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Download a JSON file of your data.
      </p>
    </div>
    <button
      @click="downloadBackup"
      class="flex items-center justify-center w-full md:w-auto text-sm md:text-base py-2 px-4 mt-4 md:mt-0"
      :class="[uiStore.blurEnabled ? 'card-blur' : 'card']"
    >
      <PhDownload :size="20" class="mr-2" />
      Download a backup
    </button>
  </div>
</template>

<script setup lang="ts">
  import { PhDownload } from '@phosphor-icons/vue';
  import { notesStore, uiStore } from '@/utils/stores';

  const downloadBackup = () => {
    notesStore.downloadBackup();
    uiStore.showToastMessage('Backup downloaded successfully');
  };
</script>
