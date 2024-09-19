// types.ts

export interface Note {
  id: string;
  title: string;
  content: string;
  time_created: string | Date;
  last_edited: string | Date;
  pinned: boolean;
  folder: string;
  time_deleted?: string | Date;
}

export interface PublicNote {
  id: string;
  uid: string;
  publicId: string;
}

export interface Folder {
  id: string;
  name: string;
}

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

export type Theme = 'light' | 'dark' | 'system';
export type ViewType = 'card' | 'table' | 'mail' | 'folder';
export type NoteViewType = 'modal' | 'sidebar';
export type SortType = 'date' | 'title';

export interface UIState {
  theme: Theme;
  viewType: ViewType;
  noteViewType: NoteViewType;
  columns: number;
  sortType: SortType;
  activeDropdown: string | null;
  showToast: boolean;
  toastMessage: string;
  toastTimeout: number | null;
  isNoteModalOpen: boolean;
  isNoteSidebarOpen: boolean;
  isExpanded: boolean;
  isSyncing: boolean;
  isSelectMode: boolean;
  settingsListener: (() => void) | null;
}
