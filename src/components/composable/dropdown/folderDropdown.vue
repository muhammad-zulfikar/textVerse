<template>
  <Dropdown
    dropdownId="folder"
    contentWidth="12rem"
    direction="down"
    position="left"
  >
    <template #label>
      <Button>
        <PhFolder
          v-if="
            selectedFolder !== DEFAULT_FOLDERS.UNCATEGORIZED &&
            !isAllNotesFolder
          "
          :size="20"
        />
        <PhFolders v-else-if="isAllNotesFolder" :size="20" />
        <PhFolderMinus v-else :size="20" />
        <span class="flex ml-2 text-sm">
          {{ selectedFolder }} ({{ notesCountByFolder[selectedFolder] || 0 }})
        </span>
        <div v-if="!isAllNotesFolder" @click="revertToAllNotes">
          <PhArrowCounterClockwise :size="20" class="ml-2" />
        </div>
      </Button>
    </template>

    <DropdownItem
      @click="selectFolder(DEFAULT_FOLDERS.ALL_NOTES)"
      :itemType="
        selectedFolder === DEFAULT_FOLDERS.ALL_NOTES ? 'active' : 'normal'
      "
      :icon="PhFolders"
    >
      {{ DEFAULT_FOLDERS.ALL_NOTES }} ({{
        notesCountByFolder[DEFAULT_FOLDERS.ALL_NOTES] || 0
      }})
    </DropdownItem>

    <DropdownSubmenu
      v-for="folder in userFolders"
      :key="folder"
      :label="`${folder} (${notesCountByFolder[folder] || 0})`"
      :icon="
        folder !== DEFAULT_FOLDERS.UNCATEGORIZED
          ? notesCountByFolder[folder] === 0
            ? PhFolderDashed
            : PhFolder
          : PhFolderMinus
      "
      :itemType="folder === selectedFolder ? 'active' : 'normal'"
      :modelValue="openSubmenu[folder]"
      @update:modelValue="updateOpenSubmenu(folder, $event)"
      :mainClick="() => selectFolder(folder)"
    >
      <DropdownItem @click="openRenameFolderInput(folder)" :icon="PhTextbox">
        Rename
      </DropdownItem>
      <DropdownItem
        @click="openDeleteFolderAlert(folder)"
        itemType="destructive"
        :icon="PhTrash"
      >
        Delete
      </DropdownItem>
    </DropdownSubmenu>

    <DropdownItem
      @click="selectFolder(DEFAULT_FOLDERS.UNCATEGORIZED)"
      :itemType="
        selectedFolder === DEFAULT_FOLDERS.UNCATEGORIZED ? 'active' : 'normal'
      "
      :icon="PhFolderMinus"
    >
      {{ DEFAULT_FOLDERS.UNCATEGORIZED }} ({{
        notesCountByFolder[DEFAULT_FOLDERS.UNCATEGORIZED] || 0
      }})
    </DropdownItem>
  </Dropdown>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { folderStore, uiStore } from '@/store';
  import {
    PhFolder,
    PhFolders,
    PhFolderMinus,
    PhFolderDashed,
    PhArrowCounterClockwise,
    PhTextbox,
    PhTrash,
  } from '@phosphor-icons/vue';
  import Dropdown from '@/components/ui/dropdown.vue';
  import DropdownItem from '@/components/ui/dropdownItem.vue';
  import DropdownSubmenu from '@/components/ui/dropdownSubmenu.vue';
  import { DEFAULT_FOLDERS } from '@/store/folderStore/constants';
  import Button from '@/components/ui/button.vue';

  const selectedFolder = computed(() => folderStore.currentFolder);
  const notesCountByFolder = computed(() => folderStore.notesCountByFolder());
  const openSubmenu = ref<{ [key: string]: boolean }>({});

  const updateOpenSubmenu = (folder: string, isOpen: boolean) => {
    Object.keys(openSubmenu.value).forEach((key) => {
      if (key !== folder) {
        openSubmenu.value[key] = false;
      }
    });
    openSubmenu.value[folder] = isOpen;
  };

  const selectFolder = (folder: string) => {
    folderStore.setCurrentFolder(folder);
    uiStore.setActiveDropdown(null);
  };

  const isAllNotesFolder = computed(
    () => selectedFolder.value === DEFAULT_FOLDERS.ALL_NOTES
  );

  const revertToAllNotes = (event: Event) => {
    event.stopPropagation();
    folderStore.setCurrentFolder(DEFAULT_FOLDERS.ALL_NOTES);
  };

  const userFolders = computed(() =>
    folderStore.folders.filter(
      (folder: string) =>
        folder !== DEFAULT_FOLDERS.ALL_NOTES &&
        folder !== DEFAULT_FOLDERS.UNCATEGORIZED
    )
  );

  const openRenameFolderInput = (folderName: string) => {
    folderStore.targetFolder = folderName;

    uiStore.openInputModal({
      mode: 'folder',
      maxLength: 10,
      currentValue: folderName,
      cancel: () => {
        uiStore.setActiveModal(null);
        folderStore.targetFolder = '';
      },
      confirm: (newFolderName: string) => {
        folderStore.renameFolder(folderStore.targetFolder, newFolderName);
        uiStore.showToastMessage(`Folder renamed to ${newFolderName}`);
      },
    });
  };

  const openDeleteFolderAlert = (folder: string) => {
    uiStore.openAlertModal({
      message: `Are you sure you want to delete the folder "${folder}"?`,
      confirm: () => {
        folderStore.folderToDelete = folder;
        folderStore.deleteFolder(folderStore.folderToDelete);
      },
      cancel: () => {
        uiStore.setActiveModal(null);
      },
    });
  };

  watch(
    () => folderStore.folders,
    () => {
      userFolders.value;
    },
    { deep: true }
  );
</script>
