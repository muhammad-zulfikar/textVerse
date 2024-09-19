import { NotesState } from '@/utils/types';

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
