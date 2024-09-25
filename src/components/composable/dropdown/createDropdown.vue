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
    <DropdownItem @click.stop="openNoteForm" :icon="PhFile" label="Note" />
    <DropdownItem
      @click.stop="openFolderForm"
      :icon="PhFolder"
      label="Folder"
    />
  </Dropdown>
</template>

<script setup lang="ts">
  import { uiStore, notesStore, folderStore } from '@/store';
  import { PhPlus, PhFile, PhFolder } from '@phosphor-icons/vue';
  import Dropdown from '@/components/ui/dropdown.vue';
  import DropdownItem from '@/components/ui/dropdownItem.vue';
  import Button from '@/components/ui/button.vue';

  const openNoteForm = () => {
    notesStore.openNote(null);
    uiStore.setActiveDropdown(null);
  };

  const openFolderForm = () => {
    uiStore.openInputModal({
      mode: 'folder',
      maxLength: 10,
      cancel: () => {
        uiStore.setActiveModal(null);
      },
      confirm: (folderName: string) => {
        folderStore.addFolder(folderName);
        uiStore.showToastMessage(`Folder ${folderName} successfully created`);
      },
    });
  };
</script>
