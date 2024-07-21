<!-- Toolbar.vue -->

<template>
  <div
    class="flex justify-center w-11/12 mx-auto font-serif text-sm md:text-base transition-all duration-300"
  >
    <div class="flex items-center select-none">
      <Create @openFolderForm="openFolderForm" />
      <span class="mr-4 md:mr-8 md:ml-4 cursor-default">|</span>
      <Folder />
      <span class="mr-4 md:mr-8 md:ml-4 cursor-default">|</span>
      <ViewDropdown />
    </div>
  </div>
  <FolderForm
    :is-open="isFolderFormOpen"
    mode="create"
    @close="closeFolderForm"
    @submit="handleFolderSubmit"
  />
  <NoteForm v-if="store.editing" />
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { useNotesStore } from '@/store/store';
  import NoteForm from '../Notes/NoteForm.vue';
  import Folder from './Dropdown/Folder.vue';
  import FolderForm from '../Modal/FolderForm.vue';
  import Create from './Dropdown/Create.vue';
  import ViewDropdown from './Dropdown/View.vue';

  const store = useNotesStore();
  const isFolderFormOpen = ref(false);

  const closeFolderForm = () => {
    isFolderFormOpen.value = false;
  };

  const handleFolderSubmit = (folderName: string) => {
    store.createFolder(folderName);
    closeFolderForm();
  };

  const openFolderForm = () => {
    isFolderFormOpen.value = true;
  };
</script>
