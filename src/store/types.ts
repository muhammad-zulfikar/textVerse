// types.ts

export interface Note {
  id: number;
  title: string;
  content: string;
  timeCreated: string;
  lastEdited: string | null;
  pinned: boolean;
  folder: string;
}

export interface State {
  notes: Note[];
  deletedNotes: Note[];
  selectedNote: Note | null;
  searchQuery: string;
  editing: boolean;
  showToast: boolean;
  toastMessage: string;
  toastTimeoutId: number | null;
  showNoteModal: boolean;
  copyNote: (noteId: number) => void;
  isFullScreen: boolean;
  currentFolder: string;
  folders: string[];
  uncategorizedFolder: string;
  activeDropdown: string | null;
  columns: number;

  addNote: (
    newNote: Omit<
      Note,
      'id' | 'timeCreated' | 'lastEdited' | 'pinned' | 'folder'
    >
  ) => void;
  saveNote: (updatedNote: Note) => void;
  pinNote: (index: number) => void;
  unpinNote: (index: number) => void;
  reorderNotes: () => void;
  saveNotes: () => void;
  removeNote: (index: number) => void;
  removeNoteInModal: () => void;
  undoDelete: () => void;
  deleteAllNotes: () => void;
  openNote: (index: number) => void;
  closeNote: () => void;
  closeNoteModal: () => void;
  setEditing: (value: boolean) => void;
  setSearchQuery: (query: string) => void;
  showToastMessage: (message: string) => void;
  toggleFullScreen: () => void;
  downloadNote: (note: Note) => void;
  linkify: (text: string) => string;
  setCurrentFolder: (folder: string) => void;
  setActiveDropdown: (dropdown: string | null) => void;
  createFolder: (folderName: string) => void;
  renameFolder: (oldName: string, newName: string) => void;
  saveFolders: () => void;
  loadFolders: () => void;
  notesCountByFolder: () => Record<string, number>;
  moveNote: (noteId: number, targetFolder: string) => void;
  deleteFolder: (folderName: string) => void;
  setColumns: (columns: number) => void;
  init: () => void;
}
