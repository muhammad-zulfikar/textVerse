<!-- create.vue -->

<template>
  <Dropdown
    dropdownId="create"
    contentWidth="6.4rem"
    direction="down"
    position="right"
  >
    <template #label>
      <Button>
        <PhPlus :size="20" />
      </Button>
    </template>
    <div class="w-full text-sm px-1 space-y-1">
      <li
        @click.stop="openNoteForm"
        class="w-full text-left cursor-pointer p-2 rounded-md hover:bg-[#ebdfc0] dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"
      >
        <PhFile :size="20" class="mr-2" />
        Note
      </li>
      <li
        @click.stop="openFolderForm"
        class="w-full text-left cursor-pointer p-2 rounded-md hover:bg-[#ebdfc0] dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"
      >
        <PhFolder :size="20" class="mr-2" />
        Folder
      </li>
    </div>
  </Dropdown>

  <InputModal
    :is-open="isFolderFormOpen"
    mode="folder"
    :max-length="10"
    @update="handleFolderSubmit"
    @close="closeFolderForm"
  />
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { uiStore, folderStore } from '@/utils/stores';
  import { PhPlus, PhFile, PhFolder } from '@phosphor-icons/vue';
  import Dropdown from '@/components/ui/dropdown.vue';
  import InputModal from '@/components/ui/modal/inputModal.vue';
  import Button from '@/components/ui/button.vue';

  const isFolderFormOpen = ref(false);

  const openNoteForm = () => {
    uiStore.openNote(null);
    uiStore.setActiveDropdown(null);
  };

  const openFolderForm = () => {
    isFolderFormOpen.value = true;
    uiStore.setActiveDropdown(null);
  };

  const closeFolderForm = () => {
    isFolderFormOpen.value = false;
  };

  const handleFolderSubmit = (folderName: string) => {
    folderStore.addFolder(folderName);
    closeFolderForm();
  };
</script>
