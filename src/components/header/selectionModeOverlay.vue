<template>
  <div class="absolute inset-0 flex items-center bg-cream-50 dark:bg-gray-700">
    <div class="flex items-center space-x-2 md:space-x-4">
      <Button @click="deselectAllNotes">
        <PhX :size="20" />
      </Button>
      <span>{{ selectedNotesCount }} selected</span>
    </div>
    <div class="flex items-center space-x-2 md:space-x-4 ml-auto select-button">
      <Button @click="selectAllNotes">
        <PhChecks :size="20" />
      </Button>
      <Dropdown
        v-if="!isTrashRoute"
        dropdownId="moveFolder"
        contentWidth="12rem"
        direction="down"
        position="right"
      >
        <template #label>
          <Button>
            <PhFolderPlus :size="20" />
          </Button>
        </template>
        <DropdownItem
          v-for="folder in sortedFolders"
          :key="folder"
          @click="openMoveSelectedNotesAlert(folder)"
          :icon="
            folder !== DEFAULT_FOLDERS.UNCATEGORIZED ? PhFolder : PhFolderMinus
          "
        >
          {{ folder }}
        </DropdownItem>
      </Dropdown>
      <Button v-if="isTrashRoute" @click="restoreSelectedNotes">
        <PhArrowCounterClockwise :size="20" />
      </Button>
      <Button v-else @click="togglePinSelected">
        <component
          :is="allSelectedNotesPinned ? PhPushPinSlash : PhPushPin"
          :size="20"
        />
      </Button>
      <div v-if="isTrashRoute">
        <Button @click="openDeleteSelectedNotesAlert" variant="danger">
          <PhTrash :size="20" />
        </Button>
      </div>
      <div v-else>
        <Button @click="openTrashSelectedNotesAlert" variant="danger">
          <PhTrash :size="20" />
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import {
    PhX,
    PhChecks,
    PhArrowCounterClockwise,
    PhPushPin,
    PhPushPinSlash,
    PhTrash,
    PhFolder,
    PhFolderPlus,
    PhFolderMinus,
  } from '@phosphor-icons/vue';
  import { notesStore, uiStore, folderStore } from '@/store';
  import Button from '@/components/ui/button.vue';
  import Dropdown from '@/components/ui/dropdown.vue';
  import DropdownItem from '@/components/ui/dropdownItem.vue';
  import { DEFAULT_FOLDERS } from '@/store/folderStore/constants';
  import { useCurrentRoute } from '@/utils/useCurrentRoute';

  const { isTrashRoute } = useCurrentRoute();
  const selectedNotesCount = computed(() => notesStore.selectedNotes.length);

  const allSelectedNotesPinned = computed(() => {
    return (
      selectedNotesCount.value > 0 &&
      notesStore.selectedNotes.every((noteId) => {
        const note = notesStore.notes.find((n) => n.id === noteId);
        return note && note.pinned;
      })
    );
  });

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

    const finalFolders = [...userFolders.sort()];
    if (showUncategorized) {
      finalFolders.push(DEFAULT_FOLDERS.UNCATEGORIZED);
    }

    return finalFolders;
  });

  const selectAllNotes = () => {
    notesStore.selectAllNotes(isTrashRoute.value);
  };

  const deselectAllNotes = () => {
    notesStore.clearSelectedNotes();
  };

  const togglePinSelected = async () => {
    const noteIds = notesStore.selectedNotes;
    if (allSelectedNotesPinned.value) {
      await notesStore.batchPinNotes(noteIds, false);
    } else {
      await notesStore.batchPinNotes(noteIds, true);
    }
  };

  const restoreSelectedNotes = async () => {
    for (const noteId of notesStore.selectedNotes) {
      await notesStore.restoreNote(noteId);
    }
    notesStore.clearSelectedNotes();
    uiStore.showToastMessage('Selected notes restored');
  };

  const closeModal = () => {
    uiStore.setActiveModal(null);
    notesStore.notesToDelete = [];
    folderStore.targetFolder = '';
  };

  const openTrashSelectedNotesAlert = async () => {
    notesStore.notesToDelete = notesStore.selectedNotes;
    uiStore.openAlertModal({
      message: `Are you sure you want to move selected notes to trash?`,
      confirm: async () => {
        await notesStore.batchDeleteNotes(notesStore.notesToDelete, false);
      },
      cancel: () => {
        closeModal();
      },
    });
  };

  const openDeleteSelectedNotesAlert = async () => {
    notesStore.notesToDelete = notesStore.selectedNotes;
    uiStore.openAlertModal({
      message: `Are you sure you want to permanently delete the selected notes?`,
      confirm: async () => {
        await notesStore.batchDeleteNotes(notesStore.notesToDelete, true);
      },
      cancel: () => {
        closeModal();
      },
    });
  };

  const openMoveSelectedNotesAlert = (folder: string) => {
    folderStore.targetFolder = folder;
    uiStore.openAlertModal({
      message: `Are you sure you want to move the selected notes to "${folder}"?`,
      confirm: async () => {
        const noteIds = notesStore.selectedNotes;
        await notesStore.batchMoveNotes(noteIds, folderStore.targetFolder);
      },
      cancel: () => {
        closeModal();
      },
    });
  };
</script>
