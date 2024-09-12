// utils/useNotesManagement.ts

import { ref, computed, Ref } from 'vue';
import { Note } from './types';
import { notesStore, uiStore } from './stores';

export function useNotesManagement(noteRef: Ref<Note>) {
  const editedTitle = ref(noteRef.value.title);

  const title = computed(() => noteRef.value.title);
  const folder = computed(() => noteRef.value.folder);

  const isNotePublic = computed(() => {
    return (
      noteRef.value.id !== null && notesStore.publicNotes.has(noteRef.value.id)
    );
  });

  const isNotePinned = computed(() => {
    return (
      noteRef.value.id !== null && notesStore.pinnedNotes.has(noteRef.value.id)
    );
  });

  const togglePublic = () => {
    if (noteRef.value.id !== null) {
      notesStore.togglePublic(noteRef.value.id);
    }
  };

  const copyPublicLink = () => {
    if (noteRef.value.id !== null) {
      notesStore.copyPublicLink(noteRef.value.id);
    }
  };

  const copyNote = () => {
    if (noteRef.value.id !== null) {
      notesStore.copyNote(noteRef.value.id);
    }
  };

  const duplicateNote = () => {
    notesStore.duplicateNote(noteRef.value);
  };

  const pinNote = () => {
    if (noteRef.value.id !== null) {
      notesStore.pinNote(noteRef.value.id);
    }
  };

  const unpinNote = () => {
    if (noteRef.value.id !== null) {
      notesStore.unpinNote(noteRef.value.id);
    }
  };

  const updateFolder = (folder: string) => {
    noteRef.value.folder = folder;
    notesStore.updateNote(noteRef.value);
  };

  const deleteNote = async () => {
    if (noteRef.value.id) {
      await notesStore.deleteNote(noteRef.value.id);
      uiStore.closeNote();
    }
  };

  const updateTitle = (newTitle: string) => {
    noteRef.value.title = newTitle;
    editedTitle.value = newTitle;
    notesStore.updateNote(noteRef.value);
  };

  const closeNote = async () => {
    if (notesStore.isContentEmpty(noteRef.value.content)) {
      if (noteRef.value.id) {
        await notesStore.deleteNote(noteRef.value.id);
      }
      uiStore.showToastMessage('Empty note discarded');
    }
    uiStore.closeNote();
  };

  return {
    title,
    folder,
    isNotePublic,
    isNotePinned,
    togglePublic,
    copyPublicLink,
    copyNote,
    duplicateNote,
    pinNote,
    unpinNote,
    updateFolder,
    deleteNote,
    updateTitle,
    closeNote,
  };
}
