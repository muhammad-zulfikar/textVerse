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
    <div class="px-1 space-y-1">
      <div
        v-for="folder in sortedFolders"
        :key="folder"
        class="w-full rounded-md hover:bg-cream-200 dark:hover:bg-gray-700 transition-colors duration-200"
        :class="{
          'bg-cream-200 dark:bg-gray-700':
            expandedFolder === folder || folder === selectedFolder,
        }"
      >
        <div class="flex items-center justify-between">
          <li
            @click.stop="selectFolder(folder)"
            class="text-sm cursor-pointer w-full text-left p-2 rounded-md hover:bg-cream-200 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"
          >
            <PhFolder
              v-if="folder !== DEFAULT_FOLDERS.UNCATEGORIZED"
              :size="20"
              class="mr-2"
            />
            <PhFolderMinus v-else :size="20" class="mr-2" />
            {{ folder }} ({{ notesCountByFolder[folder] || 0 }})
          </li>
          <button
            v-if="
              folder !== DEFAULT_FOLDERS.ALL_NOTES &&
              folder !== DEFAULT_FOLDERS.UNCATEGORIZED
            "
            @click.stop="toggleOptions(folder)"
            class="mr-2 p-1 rounded-full hover:bg-cream-300 dark:hover:bg-gray-600 transition-transform duration-200"
            :class="{
              'rotate-180 bg-cream-300 dark:bg-gray-600':
                expandedFolder === folder,
            }"
          >
            <PhCaretDown :size="16" />
          </button>
        </div>
        <Transition name="expand">
          <div
            v-if="expandedFolder === folder"
            class="flex justify-between px-2"
          >
            <Button
              @click.stop="openRenameFolderInput(folder)"
              class="text-xs flex items-center mb-2"
            >
              <PhTextbox :size="16" class="mr-1" />
              Rename
            </Button>
            <Button
              variant="danger"
              @click.stop="openDeleteFolderAlert(folder)"
              class="text-xs flex items-center mb-2"
            >
              <PhTrash :size="16" class="mr-1" />
              Delete
            </Button>
          </div>
        </Transition>
      </div>
    </div>
  </Dropdown>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { notesStore, folderStore, uiStore } from '@/store';
  import {
    PhFolder,
    PhFolders,
    PhFolderMinus,
    PhArrowCounterClockwise,
    PhCaretDown,
    PhTextbox,
    PhTrash,
  } from '@phosphor-icons/vue';
  import Dropdown from '@/components/ui/dropdown.vue';
  import { DEFAULT_FOLDERS } from '@/store/folderStore/constants';
  import Button from '@/components/ui/button.vue';

  const selectedFolder = computed(() => folderStore.currentFolder);
  const notesCountByFolder = computed(() => folderStore.notesCountByFolder());
  const expandedFolder = ref('');

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

  const toggleOptions = (folder: string) => {
    expandedFolder.value = expandedFolder.value === folder ? '' : folder;
  };

  const sortedFolders = computed(() => {
    const userFolders = folderStore.folders.filter(
      (folder: string) =>
        folder !== DEFAULT_FOLDERS.ALL_NOTES &&
        folder !== DEFAULT_FOLDERS.UNCATEGORIZED
    );

    const uncategorizedNotes = notesStore.notes.filter(
      (note) => note.folder === DEFAULT_FOLDERS.UNCATEGORIZED
    );
    const showUncategorized = uncategorizedNotes.length > 0;

    const finalFolders = [DEFAULT_FOLDERS.ALL_NOTES, ...userFolders.sort()];
    if (showUncategorized) {
      finalFolders.push(DEFAULT_FOLDERS.UNCATEGORIZED);
    }

    return finalFolders;
  });

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
</script>
