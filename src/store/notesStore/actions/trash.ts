import { Note, NotesState } from '@/utils/types';
import { authStore, firebaseStore, localStore, uiStore } from '@/utils/stores';
import { loadNotes, saveNoteToStore } from '.';

export const moveNoteToTrash = async (
  state: NotesState,
  note: Note
): Promise<void> => {
  note.time_deleted = new Date().toISOString();
  state.deletedNotes.push(note);
  if (authStore.isLoggedIn) {
    await firebaseStore.moveNoteToTrash(authStore.user!.uid, note);
  } else {
    localStore.moveNoteToTrashInLocalStorage(note);
  }
  await loadNotes(state);
};

export const restoreNote = async (
  state: NotesState,
  noteId: string
): Promise<void> => {
  const restoredNote = removeNoteFromTrash(state, noteId);
  if (restoredNote) {
    if (authStore.isLoggedIn) {
      await firebaseStore.restoreNoteFromTrash(
        authStore.user!.uid,
        restoredNote
      );
    } else {
      localStore.restoreNoteFromTrashInLocalStorage(restoredNote);
    }
    await saveNoteToStore(state, restoredNote);
    uiStore.showToastMessage(`${restoredNote.title} restored`);
  }
};

export const permanentlyDeleteNote = async (
  state: NotesState,
  noteId: string
): Promise<void> => {
  if (authStore.isLoggedIn) {
    await firebaseStore.permanentlyDeleteNoteFromTrash(
      authStore.user!.uid,
      noteId
    );
  } else {
    localStore.permanentlyDeleteNoteFromTrashInLocalStorage(noteId);
  }
  removeNoteFromTrash(state, noteId, true);
  uiStore.showToastMessage('Note permanently deleted');
};

export const emptyTrash = async (state: NotesState): Promise<void> => {
  await (authStore.isLoggedIn
    ? firebaseStore.emptyTrashInFirebase(authStore.user!.uid)
    : localStore.emptyTrashInLocalStorage());
  state.deletedNotes = [];
  uiStore.showToastMessage('Trash emptied successfully');
};

export const removeNoteFromTrash = (
  state: NotesState,
  noteId: string,
  permanent: boolean = false
): Note | undefined => {
  const index = state.deletedNotes.findIndex((n: Note) => n.id === noteId);
  if (index !== -1) {
    const [note] = state.deletedNotes.splice(index, 1);
    if (!permanent) {
      delete note.time_deleted;
      return note;
    }
  }
  return undefined;
};
