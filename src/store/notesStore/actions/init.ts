import { authStore, firebaseStore } from '@/store';
import { Note } from '../types';
import { NotesState } from '../state';
import { loadNotes } from '.';

export const initializeNotes = async (state: NotesState) => {
  await loadNotes(state);
  setupRealTimeSync(state);
  state.notesLoaded = true;
  state.deletedNotesLoaded = true;
};

export const setupRealTimeSync = (state: NotesState) => {
  if (!authStore.isLoggedIn) return;

  state.notesListener = firebaseStore.setupNotesListener(
    authStore.user!.uid,
    (notes: Note[]) => {
      state.notes = notes;
      state.pinnedNotes = new Set(
        notes.filter((note) => note.pinned).map((note) => note.id)
      );
    }
  );
};
