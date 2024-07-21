// getters.ts

import { State, Note } from './types';

export const getters = {
  filteredNotes(state: State): Note[] {
    const query = state.searchQuery.toLowerCase();
    return state.notes.filter(
      (note: { folder: string; title: string; content: string }) =>
        (state.currentFolder === 'All Notes' ||
          note.folder === state.currentFolder) &&
        (note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query))
    );
  },
};
