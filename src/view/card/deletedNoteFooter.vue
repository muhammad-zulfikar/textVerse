<template>
  <div
    class="flex justify-between items-center pt-3 mt-auto font-serif text-gray-700 dark:text-gray-400 text-xs"
  >
    <div class="flex items-center text-left text-[10px] md:text-xs">
      <div
        @click.stop="openDeleteNoteAlert(props.note.id)"
        class="flex items-center px-2 py-1 mr-2 cursor-pointer truncate card text-red-500 hover:text-red-100 hover:bg-red-700/50 dark:hover:bg-red-800/60"
      >
        <PhTrash :size="16" />
      </div>
      <div
        @click.stop="restoreNote(props.note.id)"
        class="flex items-center px-2 py-1 cursor-pointer truncate card hover:text-black dark:hover:text-white hover:bg-cream-200 dark:hover:bg-gray-700"
      >
        <PhClockClockwise :size="16" />
      </div>
    </div>
    <div
      v-if="props.note.folder !== DEFAULT_FOLDERS.UNCATEGORIZED"
      class="ml-auto text-left text-[10px] md:text-xs"
    >
      <p class="flex items-center px-2 py-1 cursor-pointer truncate card">
        <PhFolder class="mr-1 md:mr-[6px] size-[14px] md:size-[16px]" />
        {{ props.note.folder }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { PhFolder, PhTrash, PhClockClockwise } from '@phosphor-icons/vue';
  import { notesStore, uiStore } from '@/store';
  import { Note } from '@/store/notesStore/types';
  import { DEFAULT_FOLDERS } from '@/store/folderStore/constants';

  const props = defineProps<{
    note: Note;
  }>();

  const openDeleteNoteAlert = (noteId: string) => {
    notesStore.noteToDelete = noteId;
    uiStore.openAlertModal({
      message: `Are you sure you want to permanently delete this note?`,
      confirm: async () => {
        if (notesStore.noteToDelete) {
          try {
            await notesStore.permanentlyDeleteNote(notesStore.noteToDelete);
            uiStore.showToastMessage('Note permanently deleted');
          } catch (error) {
            console.error('Error deleting note:', error);
            uiStore.showToastMessage(
              'Failed to delete note. Please try again.'
            );
          }
        }
      },
      cancel: () => {
        uiStore.setActiveModal(null);
      },
    });
  };

  const restoreNote = async (noteId: string) => {
    try {
      await notesStore.restoreNote(noteId);
      uiStore.showToastMessage('Note restored');
    } catch (error) {
      console.error('Error restoring note:', error);
      uiStore.showToastMessage('Failed to restore note. Please try again.');
    }
  };
</script>
