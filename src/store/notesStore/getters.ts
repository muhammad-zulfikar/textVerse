import { NotesState, Note } from '@/utils/types';
import { filterNotes } from '@/utils/helpers';

export default {
  selectedNote: (state: NotesState): Note | undefined =>
    state.notes.find((note) => note.id === state.selectedNoteId),
  filteredNotes:
    (state: NotesState) =>
    (folderId: string): Note[] => {
      return filterNotes(state.notes, state.searchQuery, folderId);
    },
};
