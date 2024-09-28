import { Note } from '@/store/notesStore/types';
import { NotesState } from './state';
import { filterNotes } from '@/store/notesStore/helpers';

export default {
  selectedNote: (state: NotesState): Note | undefined =>
    state.notes.find((note) => note.id === state.selectedNoteId),
  filteredNotes:
    (state: NotesState) =>
    (folderId: string): Note[] => {
      return filterNotes(state.notes, state.searchQuery, folderId);
    },
  filteredDeletedNotes: (state: NotesState): Note[] => {
    return filterNotes(state.deletedNotes, state.searchQuery, '', true);
  },
};
