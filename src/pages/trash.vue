<!-- trash.vue -->

<template>
  <div class="trashContainer">
    <div
      class="mb-[28px] md:mb-[46px] my-6 md:my-8 font-serif"
      @click="handleOutsideClick"
    >
      <div v-if="!notesStore.deletedNotesLoaded">
        <LoadingSpinner />
      </div>

      <div
        v-else-if="deletedNotes.length === 0"
        class="flex flex-col items-center justify-center h-[60vh]"
      >
        <PhTrash :size="100" class="text-gray-400 dark:text-gray-600 mb-4" />
        <p class="text-gray-600 dark:text-gray-400 text-lg font-serif">
          Trash empty
        </p>
      </div>

      <div v-else class="mx-2 md:mx-4">
        <div
          class="flex flex-col md:flex-row md:justify-center items-center mb-6 md:mb-8 mx-2 select-none"
        >
          <p
            class="card px-2 py-2 md:px-2 md:py-1.5 w-full md:w-auto text-sm text-gray-800 dark:text-gray-400 text-center"
          >
            Notes in trash will be permanently deleted after 30 days.
          </p>
          <Button
            variant="danger"
            @click="openEmptyTrashAlert"
            class="mt-3 md:mt-0 md:ml-4 text-sm"
          >
            <PhTrash :size="20" class="mr-2" />
            Empty Trash
          </Button>
        </div>
        <TransitionGroup
          name="list"
          tag="ul"
          :class="['relative min-w-[300px] md:mx-auto', columnClass]"
        >
          <li
            v-for="note in deletedNotes"
            :key="note.id"
            class="notes card break-inside-avoid h-min mb-[9px] p-2 cursor-pointer relative group select-none transform-gpu"
            :class="[
              { 'z-50': showMenu && notesStore.selectedNote?.id === note.id },
              { shadow: note.pinned },
              { selected: notesStore.selectedNotes.includes(note.id) },
              computedMb,
            ]"
            @click.stop="handleNoteClick(note)"
          >
            <NoteSelectButton :note="note" />
            <NoteHeader :note="note" />
            <Separator />
            <NoteContent :note="note" />
            <DeletedNoteFooter :note="note" />
          </li>
        </TransitionGroup>
      </div>
    </div>
    <NoteView :isTrash="true" />
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { notesStore, uiStore } from '@/store';
  import { Note } from '@/store/notesStore/types';
  import { PhTrash } from '@phosphor-icons/vue';
  import NoteView from '@/components/notes/noteView.vue';
  import LoadingSpinner from '@/components/ui/loading.vue';
  import Button from '@/components/ui/button.vue';
  import Separator from '@/components/ui/separator.vue';
  import NoteSelectButton from '@/view/card/noteSelectButton.vue';
  import NoteHeader from '@/view/card/noteHeader.vue';
  import NoteContent from '@/view/card/noteContent.vue';
  import DeletedNoteFooter from '@/view/card/deletedNoteFooter.vue';

  const showMenu = ref(false);
  const selectedNotes = ref<string[]>([]);
  const deletedNotes = computed(() => notesStore.deletedNotes);

  const columnClass = computed(() => {
    const classes = {
      1: 'columns-1 md:max-w-xl',
      2: 'columns-2 gap-2 md:gap-7 md:max-w-4xl',
      3: 'columns-3 sm:columns-2 md:columns-3 gap-8 md:max-w-6xl',
      4: 'columns-4 sm:columns-2 md:columns-3 lg:columns-4 gap-4',
      5: 'columns-5 sm:columns-2 md:columns-3 lg:columns-5 gap-2',
    };
    return classes[uiStore.columns as keyof typeof classes];
  });

  const computedMb = computed(() => {
    if (uiStore.columns === 4) {
      return 'md:mb-4';
    } else if (uiStore.columns === 5) {
      return 'md:mb-2';
    } else {
      return 'md:mb-8';
    }
  });

  const handleNoteClick = (note: Note) => {
    if (uiStore.isSelectMode) {
      notesStore.toggleNoteSelection(note.id);
    } else {
      notesStore.openNote(note.id, true);
    }
  };

  const openEmptyTrashAlert = () => {
    uiStore.openAlertModal({
      message: `Are you sure you want to empty the trash?`,
      confirm: async () => {
        try {
          await notesStore.emptyTrash();
          uiStore.showToastMessage('Trash emptied successfully');
        } catch (error) {
          console.error('Error emptying trash:', error);
          uiStore.showToastMessage('Failed to empty trash. Please try again.');
        }
      },
      cancel: () => {
        uiStore.setActiveModal(null);
      },
    });
  };

  const handleOutsideClick = (event: MouseEvent) => {
    if (!(event.target as HTMLElement).closest('li')) {
      uiStore.isSelectMode = false;
      selectedNotes.value = [];
      notesStore.clearSelectedNotes();
    }
  };

  const closeSelectMode = () => {
    uiStore.isSelectMode = false;
    selectedNotes.value = [];
    notesStore.clearSelectedNotes();
  };

  const handleGlobalClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const noteElement = target.closest('.notes');

    if (!noteElement) {
      closeSelectMode();
    }
  };

  onMounted(async () => {
    await notesStore.loadNotes();
  });

  onMounted(() => {
    window.addEventListener('resize', uiStore.handleResize);
    document.addEventListener('click', handleGlobalClick);
    uiStore.handleResize();
  });

  onUnmounted(() => {
    window.removeEventListener('resize', uiStore.handleResize);
    document.removeEventListener('click', handleGlobalClick);
  });
</script>

<style scoped>
  .truncate-text {
    display: -webkit-box;
    -webkit-line-clamp: 8;
    line-clamp: 8;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: pre-wrap;
  }

  @media (min-width: 640px) {
    .truncate-text {
      -webkit-line-clamp: 20;
      line-clamp: 20;
    }
  }

  .shadow {
    box-shadow:
      0 30px 60px -15px rgba(0, 0, 0, 0.3),
      0 12px 16px -8px rgba(0, 0, 0, 0.2);
  }

  .shadow:hover {
    box-shadow:
      0 30px 60px -15px rgba(0, 0, 0, 0.3),
      0 12px 16px -8px rgba(0, 0, 0, 0.2);
  }

  .notes:active {
    transform: scale(0.98);
  }
</style>
