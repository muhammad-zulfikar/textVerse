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
            <PhFolder :size="20" />
          </Button>
        </template>
        <div class="px-1 space-y-1">
          <div
            v-for="folder in sortedFolders"
            :key="folder"
            class="w-full rounded-md hover:bg-cream-200 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <li
              @click="openMoveAlert(folder)"
              class="text-sm cursor-pointer w-full text-left p-2 rounded-md hover:bg-cream-200 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"
            >
              <PhFolder
                v-if="folder !== DEFAULT_FOLDERS.UNCATEGORIZED"
                :size="20"
                class="mr-2"
              />
              <PhFolderMinus v-else :size="20" class="mr-2" />
              {{ folder }}
            </li>
          </div>
        </div>
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
      <Button @click="openDeleteAlert" variant="danger">
        <PhTrash :size="20" />
      </Button>
    </div>
    <AlertModal
      v-if="isTrashRoute"
      id="selectionDeleteAlert"
      :message="deleteAlertMessage"
      @confirm="confirmDeleteSelected"
      @cancel="closeDeleteAlert"
    />
    <AlertModal
      id="selectionMoveAlert"
      :message="moveAlertMessage"
      @confirm="confirmMoveSelected"
      @cancel="closeMoveAlert"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, defineAsyncComponent } from 'vue';
  import { useRoute } from 'vue-router';
  import {
    PhX,
    PhChecks,
    PhArrowCounterClockwise,
    PhPushPin,
    PhPushPinSlash,
    PhTrash,
    PhFolder,
    PhFolderMinus,
  } from '@phosphor-icons/vue';
  import { notesStore, uiStore, folderStore } from '@/store';
  import Button from '@/components/ui/button.vue';
  import Dropdown from '@/components/ui/dropdown.vue';
  import { DEFAULT_FOLDERS } from '@/store/folderStore/constants';

  const AlertModal = defineAsyncComponent(
    () => import('@/components/composable/modal/alertModal.vue')
  );

  const route = useRoute();
  const isTrashRoute = computed(() => route.path === '/trash');
  const deleteAlertMessage = ref('');
  const moveAlertMessage = ref('');
  const targetFolder = ref('');

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
    notesStore.selectAllNotes();
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

  const openDeleteAlert = async () => {
    if (isTrashRoute.value) {
      deleteAlertMessage.value =
        'Are you sure you want to permanently delete the selected notes?';
      uiStore.setActiveModal('selectionDeleteAlert');
    } else {
      const noteIds = notesStore.selectedNotes;
      await notesStore.batchDeleteNotes(noteIds, false);
    }
  };

  const closeDeleteAlert = async () => {
    uiStore.setActiveModal(null);
  };

  const confirmDeleteSelected = async () => {
    const noteIds = notesStore.selectedNotes;
    await notesStore.batchDeleteNotes(noteIds, true);
    uiStore.setActiveModal(null);
  };

  const openMoveAlert = (folder: string) => {
    targetFolder.value = folder;
    moveAlertMessage.value = `Are you sure you want to move the selected notes to "${folder}"?`;
    uiStore.setActiveModal('selectionMoveAlert');
    uiStore.setActiveDropdown(null);
  };

  const closeMoveAlert = async () => {
    uiStore.setActiveModal(null);
  };

  const confirmMoveSelected = async () => {
    await notesStore.batchMoveNotes(
      notesStore.selectedNotes,
      targetFolder.value
    );
    uiStore.setActiveModal(null);
  };
</script>
