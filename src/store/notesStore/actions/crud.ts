import { Note, NotesState } from '@/utils/types';
import {
  createNoteObject,
  createUpdatedNoteObject,
  createDuplicateNoteObject,
  createPublicNote,
  sanitizeNoteContent,
} from '@/utils/helpers';
import { uiStore, authStore, firebaseStore, localStore } from '@/utils/stores';
import { moveNoteToTrash } from '.';
import { getNoteById, reorderNotes } from '../helpers';

export const createNote = async (
  state: NotesState,
  newNote: Omit<Note, 'id' | 'time_created' | 'last_edited' | 'pinned'>
): Promise<Note> => {
  const note = createNoteObject(newNote);
  await saveNoteToStore(state, note);
  uiStore.showToastMessage(`${note.title} added`);
  return note;
};

export const updateNote = async (
  state: NotesState,
  noteId: string,
  updatedNote: Note
): Promise<void> => {
  const note = createUpdatedNoteObject(updatedNote);
  await updateNoteInStore(state, noteId, note);
};

export const duplicateNote = async (
  state: NotesState,
  initialNote: Note
): Promise<Note> => {
  const newNote = createDuplicateNoteObject(initialNote);
  await saveNoteToStore(state, newNote);
  uiStore.showToastMessage(`${newNote.title} created`);
  return newNote;
};

export const deleteNote = async (
  state: NotesState,
  noteId: string
): Promise<void> => {
  const deletedNote = removeNoteFromStore(state, noteId);
  if (deletedNote) {
    await moveNoteToTrash(state, deletedNote);
    uiStore.showToastMessage(`${deletedNote.title} moved to trash`);
  }
};

export const moveNote = async (
  state: NotesState,
  noteId: string,
  targetFolder: string
): Promise<void> => {
  const note = getNoteById(state, noteId);
  if (note) {
    note.folder = targetFolder;
    await saveNoteToStore(state, note);
    uiStore.showToastMessage(`${note.title} moved to ${targetFolder}`);
  }
};

export const copyNoteContentToClipboard = (note: Note) => {
  const cleanContent = sanitizeNoteContent(note.content);
  navigator.clipboard
    .writeText(cleanContent)
    .then(() => uiStore.showToastMessage(`${note.title} copied to clipboard`))
    .catch(() => uiStore.showToastMessage('Failed to copy note content'));
};

export const saveNoteToStore = async (
  state: NotesState,
  note: Note
): Promise<void> => {
  if (authStore.isLoggedIn) {
    await firebaseStore.saveNoteToFirebase(authStore.user!.uid, note);
  } else {
    localStore.saveNoteToLocalStorage(note);
    loadNotes(state);
  }
};

export const updateNoteInStore = async (
  state: NotesState,
  noteId: string,
  note: Note
): Promise<void> => {
  if (authStore.isLoggedIn) {
    await firebaseStore.updateNoteInFirebase(authStore.user!.uid, noteId, note);
  } else {
    localStore.updateNoteInLocalStorage(noteId, note);
    loadNotes(state);
  }
};

export const togglePin = async (
  state: NotesState,
  noteId: string
): Promise<void> => {
  const note = getNoteById(state, noteId);
  if (note) {
    note.pinned = !note.pinned;
    if (note.pinned) {
      state.pinnedNotes.add(noteId);
    } else {
      state.pinnedNotes.delete(noteId);
    }
    await saveNoteToStore(state, note);
    uiStore.showToastMessage(
      `${note.title} ${note.pinned ? 'pinned' : 'unpinned'}`
    );
  }
};

export const togglePublic = async (
  state: NotesState,
  noteId: string
): Promise<void> => {
  if (state.publicNotes.has(noteId)) {
    await unpublicNote(state, noteId);
  } else {
    await publicNote(state, noteId);
  }
};

export const publicNote = async (
  state: NotesState,
  noteId: string
): Promise<void> => {
  const note = getNoteById(state, noteId);
  if (!note) {
    uiStore.showToastMessage('Note not found.');
    return;
  }
  const publicNote = createPublicNote(note, authStore.user!.uid);
  await firebaseStore.savePublicNote(publicNote);
  state.publicNotes.set(note.id, publicNote.publicId);
  copyPublicLink(publicNote.publicId);
};

export const unpublicNote = async (
  state: NotesState,
  noteId: string
): Promise<void> => {
  const publicId = state.publicNotes.get(noteId);
  if (publicId) {
    await firebaseStore.removePublicNote(publicId);
    state.publicNotes.delete(noteId);
    uiStore.showToastMessage('Note unpublished.');
  } else {
    uiStore.showToastMessage('Note was not public.');
  }
};

export const copyPublicLink = (publicId: string) => {
  const publicLink = `${window.location.origin}/public/${publicId}`;
  navigator.clipboard
    .writeText(publicLink)
    .then(() => uiStore.showToastMessage('Public link copied to clipboard'))
    .catch(() => uiStore.showToastMessage('Failed to copy public link'));
};

export const removeNoteFromStore = (
  state: NotesState,
  noteId: string
): Note | undefined => {
  const index = state.notes.findIndex((n: Note) => n.id === noteId);
  if (index !== -1) {
    const [removedNote] = state.notes.splice(index, 1);
    if (authStore.isLoggedIn) {
      firebaseStore.deleteNoteFromFirebase(authStore.user!.uid, noteId);
    } else {
      localStore.deleteNoteFromLocalStorage(noteId);
    }
    return removedNote;
  }
  return undefined;
};

export const loadNotes = async (state: NotesState): Promise<void> => {
  try {
    let notes;
    if (authStore.isLoggedIn) {
      notes = await firebaseStore.getAllNotesFromFirebase(authStore.user!.uid);
    } else {
      notes = localStore.getAllNotesFromLocalStorage();
    }
    state.notes = Object.values(notes) || [];

    reorderNotes(state);

    let deletedNotes;
    if (authStore.isLoggedIn) {
      deletedNotes = await firebaseStore.getDeletedNotesFromFirebase(
        authStore.user!.uid
      );
    } else {
      deletedNotes = localStore.getDeletedNotesFromLocalStorage();
    }
    state.deletedNotes = Object.values(deletedNotes) || [];
  } catch (error) {
    console.error('Error loading notes:', error);
    uiStore.showToastMessage('Failed to load notes. Please try again.');
  }
};

export const unloadNotes = async (state: NotesState): Promise<void> => {
  if (state.notesListener) {
    state.notesListener();
    state.notesListener = null;
  }
};

export const setSearchQuery = (state: NotesState, query: string) => {
  state.searchQuery = query;
};
