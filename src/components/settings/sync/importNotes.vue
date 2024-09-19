<template>
  <div
    class="flex flex-col md:flex-row items-start md:items-center md:justify-between"
  >
    <div class="flex-grow">
      <h4 class="text-lg font-semibold mb-1">Import locally stored notes</h4>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Import any local notes that don't already exist in your account.
      </p>
    </div>
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      @change="handleFileUpload"
      class="hidden"
    />
    <button
      @click="triggerFileInput"
      class="card flex items-center justify-center w-full md:w-auto text-sm md:text-base py-2 px-4 mt-4 md:mt-0"
    >
      <PhUpload :size="20" class="mr-2" />
      Import notes
    </button>
  </div>
</template>

<script setup lang="ts">
  import { PhUpload } from '@phosphor-icons/vue';
  import { notesStore } from '@/utils/stores';
  import { ref } from 'vue';

  const fileInput = ref<HTMLInputElement | null>(null);

  const triggerFileInput = () => {
    fileInput.value?.click();
  };

  const handleFileUpload = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = async () => {
        if (reader.result) {
          const jsonString = reader.result as string;
          await notesStore.importNotes(jsonString);
        }
      };

      reader.onerror = () => {
        console.error('Failed to read the file');
      };

      reader.readAsText(file);
    }
  };
</script>
