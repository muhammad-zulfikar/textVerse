<template>
  <div class="mt-4 md:mt-10 max-w-2xl mx-auto font-serif">
    <!-- Folders view -->
    <div v-if="currentView === 'folders'" class="grid-view">
      <TransitionGroup name="list">
        <div
          v-for="folder in folders"
          :key="folder"
          @click="openFolder(folder)"
          class="card p-4 rounded-lg cursor-pointer mx-2 flex flex-col items-center"
        >
          <div class="w-8 h-8 md:w-12 md:h-14">
            <component
              :is="folderHasNotes(folder) ? PhFolder : PhFolderDashed"
              class="w-full h-full"
            />
          </div>
          <span
            class="mt-2 text-sm font-medium text-center break-words w-full truncate"
          >
            {{ folder }} ({{ notesCountByFolder[folder] || 0 }})
          </span>
        </div>
      </TransitionGroup>
    </div>
    <!-- Notes view -->
    <div v-else-if="currentView === 'notes'" class="grid-view">
      <div class="mb-4 flex items-center col-span-full mx-2">
        <button
          @click="goBackToFolders"
          class="flex items-center hover:underline"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
        <h2 class="text-xl font-semibold ml-4">{{ currentFolder }}</h2>
      </div>
      <div
        v-if="folderNotes.length === 0"
        class="col-span-full flex items-center justify-center h-full mt-24"
      >
        <p class="text-gray-500">No notes yet</p>
      </div>
      <TransitionGroup name="list" v-else>
        <div
          v-for="note in folderNotes"
          :key="note.id"
          @click="notesStore.openNote(note.id)"
          class="flex flex-col items-center card p-4 rounded-lg cursor-pointer mx-2"
        >
          <div class="w-8 h-8 md:w-12 md:h-12 mb-2">
            <PhFile class="w-full h-full" />
          </div>
          <h3
            class="text-sm font-medium text-center break-words w-full truncate"
          >
            {{ note.title }}
          </h3>
          <span class="text-xs text-gray-500 mt-2">
            {{ localeDate(note.last_edited) }}
          </span>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { PhFolder, PhFile, PhFolderDashed } from '@phosphor-icons/vue';
  import { notesStore, folderStore } from '@/store';
  import { localeDate } from '@/store/notesStore/helpers';

  const currentView = ref('folders');
  const currentFolder = ref('');

  const folders = computed(() => folderStore.folders);
  const folderNotes = computed(() =>
    notesStore.filteredNotes(currentFolder.value)
  );

  const openFolder = (folder: string) => {
    currentFolder.value = folder;
    currentView.value = 'notes';
  };

  const goBackToFolders = () => {
    currentView.value = 'folders';
    currentFolder.value = '';
  };

  const folderHasNotes = (folder: string) => {
    return notesStore.filteredNotes(folder).length > 0;
  };

  const notesCountByFolder = computed(() => folderStore.notesCountByFolder());
</script>

<style scoped>
  .grid-view {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }

  .truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
