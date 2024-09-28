import { Note } from './types';

export interface NotesState {
  notes: Note[];
  notesLoaded: boolean;
  deletedNotes: Note[];
  deletedNotesLoaded: boolean;
  noteToDelete: string;
  notesToDelete: string[];
  selectedNotes: string[];
  selectedNoteId: string | null;
  searchQuery: string;
  publicNotes: Map<string, string>;
  pinnedNotes: Set<string>;
  notesListener: (() => void) | null;
  currentHistoryIndex: number | null;
}

export default (): NotesState => ({
  notes: [],
  notesLoaded: false,
  deletedNotes: [],
  deletedNotesLoaded: false,
  noteToDelete: '',
  notesToDelete: [],
  selectedNotes: [],
  selectedNoteId: null,
  searchQuery: '',
  publicNotes: new Map(),
  pinnedNotes: new Set(),
  notesListener: null,
  currentHistoryIndex: null,
});
