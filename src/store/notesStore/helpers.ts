// notesStore/helpers.ts

import { Note, NotesState } from '@/utils/types';
import { sanitizeNoteContent, sortNotes } from '@/utils/helpers';
import { uiStore } from '@/utils/stores';

export const reorderNotes = (state: NotesState): void => {
  const pinnedNotes = state.notes.filter((note: Note) =>
    state.pinnedNotes.has(note.id)
  );
  const unpinnedNotes = state.notes.filter(
    (note: Note) => !state.pinnedNotes.has(note.id)
  );
  const sortedUnpinnedNotes = sortNotes(unpinnedNotes, uiStore.sortType);
  state.notes = [...pinnedNotes, ...sortedUnpinnedNotes];
};

export const setSearchQuery = (state: NotesState, query: string): void => {
  state.searchQuery = query;
};

export const getNoteById = (
  state: NotesState,
  id: string
): Note | undefined => {
  return state.notes.find((note: Note) => note.id === id);
};

export const isContentEmpty = (content: string): boolean => {
  return sanitizeNoteContent(content).trim() === '';
};
