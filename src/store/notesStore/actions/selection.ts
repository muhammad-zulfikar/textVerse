import { NotesState } from '../state';
import { uiStore } from '@/store';

export const openNote = (state: NotesState, noteId: string | null): void => {
  state.selectedNoteId = noteId;
  if (noteId) {
    window.history.pushState({}, '', `/${noteId}`);
  }
  uiStore.setActiveDropdown(null);
  uiStore.openNoteView();
};

export const closeNote = (state: NotesState): void => {
  state.selectedNoteId = null;
  window.history.pushState({}, '', '/');
  uiStore.setActiveDropdown(null);
  uiStore.closeNoteView();
};

export const toggleNoteSelection = (state: NotesState, noteId: string) => {
  const index = state.selectedNotes.indexOf(noteId);
  if (index === -1) {
    state.selectedNotes.push(noteId);
  } else {
    state.selectedNotes.splice(index, 1);
  }
};

export const setSelectedNote = (
  state: NotesState,
  noteId: string | null
): void => {
  state.selectedNoteId = noteId;
};

export const clearSelectedNotes = (state: NotesState) => {
  state.selectedNotes = [];
};

export const selectAllNotes = (state: NotesState) => {
  state.selectedNotes = state.notes.map((note) => note.id);
};
