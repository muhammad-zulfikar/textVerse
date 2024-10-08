import { DEFAULT_FOLDERS } from '@/store/folderStore/constants';
import { authStore, firebaseStore, localStore, uiStore } from '@/store';
import { Note } from '../types';
import { NotesState } from '../state';
import {
  clearSelectedNotes,
  deleteNote,
  loadNotes,
  permanentlyDeleteNote,
  saveNoteToStore,
} from '.';
import { generateUniqueId, sanitizeNoteContent, getNoteById } from '../helpers';

export const batchDeleteNotes = async (
  state: NotesState,
  noteIds: string[],
  isTrashRoute: boolean
) => {
  if (isTrashRoute) {
    for (const noteId of noteIds) {
      await permanentlyDeleteNote(state, noteId);
    }
    uiStore.showToastMessage('Selected notes permanently deleted');
  } else {
    for (const noteId of noteIds) {
      await deleteNote(state, noteId);
    }
    uiStore.showToastMessage('Selected notes moved to trash');
  }
  clearSelectedNotes(state);
};

export const batchMoveNotes = async (
  state: NotesState,
  noteIds: string[],
  targetFolder: string
) => {
  for (const noteId of noteIds) {
    const note = getNoteById(state, noteId);
    if (note) {
      note.folder = targetFolder;
      await saveNoteToStore(state, note);
    }
  }
  uiStore.showToastMessage(`Selected notes moved to ${targetFolder}`);
  clearSelectedNotes(state);
};

export const batchPinNotes = async (
  state: NotesState,
  noteIds: string[],
  pin: boolean
) => {
  for (const noteId of noteIds) {
    const note = getNoteById(state, noteId);
    if (note) {
      note.pinned = pin;
      state.pinnedNotes[pin ? 'add' : 'delete'](noteId);
      await saveNoteToStore(state, note);
    }
  }
  uiStore.showToastMessage(`Selected notes ${pin ? 'pinned' : 'unpinned'}`);
  clearSelectedNotes(state);
};

export const bulkImport = async (state: NotesState, notes: Note[]) => {
  const sanitizedNotes = notes.map((note) => ({
    ...note,
    content: sanitizeNoteContent(note.content),
    id: note.id || generateUniqueId(),
    last_edited: note.last_edited || new Date().toISOString(),
    pinned: note.pinned || false,
    folder: note.folder || DEFAULT_FOLDERS.UNCATEGORIZED,
  }));

  if (authStore.isLoggedIn) {
    await firebaseStore.batchSaveNotesToFirebase(
      authStore.user!.uid,
      sanitizedNotes
    );
  } else {
    localStore.batchSaveNotesToLocalStorage(sanitizedNotes);
  }

  await loadNotes(state);
  uiStore.showToastMessage(
    `${sanitizedNotes.length} notes imported successfully`
  );
};

export const bulkExport = function (state: NotesState): Note[] {
  return state.notes.map((note: Note) => {
    const { id, title, content, last_edited, pinned, folder } = note;
    return {
      id,
      title,
      content,
      last_edited,
      pinned,
      folder,
    };
  });
};
