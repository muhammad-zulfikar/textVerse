import { Note } from './types';

export interface NotesState {
  notes: Note[];
  notesLoaded: boolean;
  deletedNotes: Note[];
  deletedNotesLoaded: boolean;
  selectedNotes: string[];
  selectedNoteId: string | null;
  searchQuery: string;
  publicNotes: Map<string, string>;
  pinnedNotes: Set<string>;
  notesListener: (() => void) | null;
}

export default (): NotesState => ({
  notes: [],
  notesLoaded: false,
  deletedNotes: [],
  deletedNotesLoaded: false,
  selectedNotes: [],
  selectedNoteId: null,
  searchQuery: '',
  publicNotes: new Map(),
  pinnedNotes: new Set(),
  notesListener: null,
});
