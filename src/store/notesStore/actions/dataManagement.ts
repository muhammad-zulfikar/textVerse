import { DEFAULT_FOLDERS } from '@/utils/constants';
import { areValidNotes, createBackupFileName } from '@/utils/helpers';
import {
  authStore,
  firebaseStore,
  folderStore,
  localStore,
  uiStore,
} from '@/utils/stores';
import { Note, NotesState } from '@/utils/types';
import { loadNotes } from '.';

export const importNotes = async (state: NotesState, jsonString: string) => {
  try {
    const importedNotes: Note[] = JSON.parse(jsonString);
    await validateAndSaveImportedNotes(state, importedNotes);
    uiStore.showToastMessage('Notes and folders imported successfully!');
  } catch (error) {
    uiStore.showToastMessage(
      'Failed to import notes. Please check the file format and try again.'
    );
  }
};

export const importFolders = async (notes: Note[]) => {
  const importedFolders = new Set(
    notes
      .map((note) => note.folder)
      .filter(
        (folder) =>
          folder !== DEFAULT_FOLDERS.ALL_NOTES &&
          folder !== DEFAULT_FOLDERS.UNCATEGORIZED
      )
  );
  for (const folder of importedFolders) {
    await folderStore.addFolder(folder);
  }
};

export const validateAndSaveImportedNotes = async (
  state: NotesState,
  importedNotes: Note[]
) => {
  if (!Array.isArray(importedNotes) || !areValidNotes(importedNotes)) {
    throw new Error('Invalid notes format.');
  }
  await importFolders(importedNotes);
  await saveImportedNotes(importedNotes);
  await loadNotes(state);
};

export const saveImportedNotes = async (notes: Note[]) => {
  if (authStore.isLoggedIn) {
    await firebaseStore.batchSaveNotesToFirebase(authStore.user!.uid, notes);
  } else {
    localStore.batchSaveNotesToLocalStorage(notes);
  }
};

export const getNotesToBackup = async (state: NotesState): Promise<Note[]> => {
  if (authStore.isLoggedIn) {
    return Object.values(
      await firebaseStore.getAllNotesFromFirebase(authStore.user!.uid)
    );
  } else {
    return state.notes;
  }
};

export const downloadBackup = async (state: NotesState) => {
  const notesToBackup = await getNotesToBackup(state);
  createAndDownloadBackupFile(notesToBackup);
};

export const createAndDownloadBackupFile = (notes: Note[]) => {
  const blob = new Blob([JSON.stringify(notes, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = createBackupFileName();
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  uiStore.showToastMessage('Backup downloaded successfully!');
};

export const deleteAllNotes = async (state: NotesState) => {
  await clearAllNotes(state);
  uiStore.showToastMessage('All notes and folders deleted successfully!');
};

export const clearAllNotes = async (state: NotesState) => {
  if (authStore.isLoggedIn) {
    await firebaseStore.clearAllNotesFromFirebase(authStore.user!.uid);
  } else {
    localStore.clearAllNotesFromLocalStorage();
  }
  state.notes = [];
  state.deletedNotes = [];
};
