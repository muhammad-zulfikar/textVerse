import { Note } from './types';
import { DEFAULT_FOLDERS } from './constants';

export interface GettersState {
  notes: Note[];
  selectedNoteId: string | null;
  searchQuery: string;
}

export const getters = {
  selectedNote: (state: GettersState) =>
    state.notes.find((note) => note.id === state.selectedNoteId),
  filteredNotes:
    (state: GettersState) =>
    (folderId: string): Note[] => {
      const query = state.searchQuery.toLowerCase();
      return state.notes.filter(
        (note) =>
          (folderId === DEFAULT_FOLDERS.ALL_NOTES ||
            note.folder === folderId) &&
          (note.title.toLowerCase().includes(query) ||
            note.content.toLowerCase().includes(query))
      );
    },
};