// useNoteManagement.ts

import { Ref, computed } from 'vue';
import { notesStore, folderStore, uiStore } from '@/store';
import { Note } from '@/store/notesStore/types';
import { DEFAULT_FOLDERS } from '@/store/folderStore/constants';
import {
  copyNoteContentToClipboard,
  copyPublicLink,
} from '@/store/notesStore/actions';
import { isContentEmpty } from '@/store/notesStore/helpers';

export function useNoteManagement(note: Ref<Note>, hideMenu?: () => void) {
  const isNotePublic = computed(() =>
    notesStore.publicNotes.has(note.value.id)
  );

  const isNotePinned = computed(() =>
    notesStore.pinnedNotes.has(note.value.id)
  );

  const currentFolder = computed(() => note.value.folder);

  const togglePublic = () => {
    notesStore.togglePublic(note.value.id);
    hideMenu?.();
  };

  const togglePin = () => {
    notesStore.togglePin(note.value.id);
    hideMenu?.();
  };

  const copyLink = () => {
    copyPublicLink(note.value.id);
    hideMenu?.();
  };

  const copyNote = () => {
    copyNoteContentToClipboard(note.value);
    hideMenu?.();
  };

  const duplicateNote = () => {
    notesStore.duplicateNote(note.value);
    hideMenu?.();
  };

  const deleteNote = async () => {
    notesStore.closeNote();
    await notesStore.deleteNote(note.value.id);
    hideMenu?.();
  };

  const restoreNote = async () => {
    notesStore.restoreNote(note.value.id);
    notesStore.closeNote();
    hideMenu?.();
  };

  const deleteNotePermanently = async () => {
    uiStore.openAlertModal({
      message: `Are you sure you want to delete ${note.value.title}?`,
      cancel: () => {
        notesStore.openNote(note.value.id);
      },
      confirm: async () => {
        await notesStore.permanentlyDeleteNote(note.value.id);
      },
    });
    notesStore.closeNote();
    hideMenu?.();
  };

  const setLatestNoteVersion = async () => {
    if (note.value.history && note.value.history.length > 0) {
      const latestHistory = note.value.history[note.value.history.length - 1];
      note.value.title = latestHistory.title;
      note.value.content = latestHistory.content;
      note.value.last_edited = latestHistory.timestamp;
    }
    notesStore.currentHistoryIndex = null;
  };

  const closeNote = async () => {
    if (isContentEmpty(note.value.content)) {
      if (note.value.id) {
        await notesStore.deleteNote(note.value.id);
      }
      uiStore.showToastMessage('Empty note discarded');
    } else {
      await setLatestNoteVersion();
    }
    notesStore.closeNote();
    hideMenu?.();
  };

  const moveNote = async (newFolder: string) => {
    await notesStore.moveNote(note.value.id, newFolder);
    hideMenu?.();
  };

  const sortedAvailableFolders = computed(() => {
    const folders = folderStore.folders.filter(
      (folder) => folder !== DEFAULT_FOLDERS.ALL_NOTES
    );

    const uncategorizedIndex = folders.indexOf(DEFAULT_FOLDERS.UNCATEGORIZED);
    if (uncategorizedIndex !== -1) {
      folders.splice(uncategorizedIndex, 1);
      folders.push(DEFAULT_FOLDERS.UNCATEGORIZED);
    }

    return folders;
  });

  const notesCountByFolder = computed(() => folderStore.notesCountByFolder());

  return {
    isNotePublic,
    isNotePinned,
    currentFolder,
    togglePublic,
    togglePin,
    copyLink,
    copyNote,
    duplicateNote,
    deleteNote,
    restoreNote,
    deleteNotePermanently,
    setLatestNoteVersion,
    closeNote,
    moveNote,
    sortedAvailableFolders,
    notesCountByFolder,
  };
}
