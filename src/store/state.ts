// state.ts

import { Note, State } from './types';
import initialNotes from '@/assets/initialNotes.json';
import { actions } from './actions';

export const createInitialState = (): Omit<State, keyof typeof actions> => {
  const parsedNotes = JSON.parse(
    localStorage.getItem('notes') || JSON.stringify(initialNotes)
  ).map((note: Partial<Note>, index: number) => ({
    ...note,
    id: Date.now() + index,
    pinned: Boolean(note.pinned),
    folder: note.folder || 'Uncategorized',
    lastEdited: note.lastEdited || note.timeCreated || null,
    timeCreated:
      note.timeCreated ||
      new Date().toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
  }));

  const folders = Array.from(
    new Set(parsedNotes.map((note: Note) => note.folder))
  ).sort();
  if (!folders.includes('All Notes')) {
    folders.unshift('All Notes');
  }

  return {
    notes: parsedNotes,
    deletedNotes: [],
    selectedNote: null,
    searchQuery: '',
    editing: false,
    showToast: false,
    toastMessage: '',
    toastTimeoutId: null,
    showNoteModal: false,
    isFullScreen: false,
    currentFolder: 'All Notes',
    folders: JSON.parse(
      localStorage.getItem('folders') || JSON.stringify(folders)
    ),
    uncategorizedFolder: 'Uncategorized',
    activeDropdown: null,
    columns: parseInt(
      localStorage.getItem('columnCount') ||
        (window.innerWidth < 640 ? '2' : '4')
    ),
  };
};

export const state = (): State => {
  return {
    ...createInitialState(),
    ...actions,
  };
};
