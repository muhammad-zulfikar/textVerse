import { Note, NoteHistory, PublicNote } from './types';
import { NotesState } from './state';
import { DEFAULT_FOLDERS } from '@/store/folderStore/constants';
import DOMPurify from 'dompurify';
import { ref as dbRef, onValue } from 'firebase/database';
import { db } from '@/firebase';
import { Ref } from 'vue';
import { uiStore, notesStore, folderStore } from '@/store';

export const setSearchQuery = (state: NotesState, query: string): void => {
  state.searchQuery = query;
};

export const getNoteById = (
  state: NotesState,
  id: string
): Note | undefined => {
  return state.notes.find((note: Note) => note.id === id);
};

export const isContentEmpty = (content: string): boolean => {
  return sanitizeNoteContent(content).trim() === '';
};

export function generateUniqueId(length: number = 22): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  return result;
}

export function createNoteObject(
  newNote: Omit<Note, 'id' | 'last_edited' | 'pinned'>
): Note {
  const now = new Date().toISOString();
  const defaultFolder =
    newNote.folder === DEFAULT_FOLDERS.ALL_NOTES
      ? DEFAULT_FOLDERS.UNCATEGORIZED
      : newNote.folder;

  return {
    ...newNote,
    id: generateUniqueId(),
    last_edited: now,
    pinned: false,
    folder: defaultFolder,
    content: DOMPurify.sanitize(newNote.content),
  };
}

export function createUpdatedNoteObject(updatedNote: Note): Note {
  const now = new Date().toISOString();
  return {
    ...updatedNote,
    content: DOMPurify.sanitize(updatedNote.content),
    last_edited: now,
  };
}

export function createDuplicateNoteObject(initialNote: Note): Note {
  return {
    ...initialNote,
    id: generateUniqueId(),
    title: `${initialNote.title} (Copy)`,
    last_edited: new Date().toISOString(),
    pinned: false,
  };
}

export function areValidNotes(notes: any[]): notes is Note[] {
  return notes.every(
    (note) =>
      note.id &&
      note.title &&
      note.content &&
      note.last_edited &&
      typeof note.pinned === 'boolean' &&
      note.folder
  );
}

export function hasChanged(
  initialNote: Note,
  editedNote: Partial<Note>
): boolean {
  const sanitizeAndNormalizeContent = (content: string) => {
    const sanitized = DOMPurify.sanitize(content);
    const div = document.createElement('div');
    div.innerHTML = sanitized;
    return div.innerHTML;
  };

  return (
    initialNote.title !== editedNote.title ||
    sanitizeAndNormalizeContent(initialNote.content) !==
      sanitizeAndNormalizeContent(editedNote.content || '') ||
    initialNote.folder !== editedNote.folder
  );
}

export function localeDate(dateString: string | Date): string {
  const date =
    typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function createPublicNote(note: Note, userId: string): PublicNote {
  const publicId = generateUniqueId();
  return {
    id: note.id,
    uid: userId,
    publicId,
  };
}

export function sanitizeNoteContent(content: string): string {
  let sanitizedHtml = DOMPurify.sanitize(content).replace(/<br\s*\/?>/gi, '\n');

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = sanitizedHtml;

  tempDiv
    .querySelectorAll('h1, h2, h3, h4, h5, h6')
    .forEach((h) => h.insertAdjacentHTML('afterend', '\n'));

  return (tempDiv.textContent || '').trim();
}

export function createBackupFileName(): string {
  const date = new Date().toISOString().split('T')[0];
  return `textVerse_backup_${date}.json`;
}

export function sortNotes(notes: Note[], sortType: 'date' | 'title'): Note[] {
  return [...notes].sort((a, b) => {
    if (sortType === 'date') {
      return (
        new Date(b.last_edited).getTime() - new Date(a.last_edited).getTime()
      );
    } else {
      return a.title.localeCompare(b.title);
    }
  });
}

export function filterNotes(
  notes: Note[],
  query: string,
  folderId: string,
  isTrash: boolean = false
): Note[] {
  const lowercaseQuery = query.toLowerCase();
  return notes.filter(
    (note) =>
      (isTrash ||
        folderId === DEFAULT_FOLDERS.ALL_NOTES ||
        note.folder === folderId) &&
      (note.title.toLowerCase().includes(lowercaseQuery) ||
        note.content.toLowerCase().includes(lowercaseQuery))
  );
}

export function batchUpdateNotes(
  notes: Note[],
  updateFn: (note: Note) => Partial<Note>
): Note[] {
  return notes.map((note) => ({ ...note, ...updateFn(note) }));
}

export function filterNotesByFolder(notes: Note[], folderId: string): Note[] {
  return notes.filter(
    (note) => note.folder === folderId || folderId === DEFAULT_FOLDERS.ALL_NOTES
  );
}

export function searchNotes(notes: Note[], query: string): Note[] {
  const lowercaseQuery = query.toLowerCase();
  return notes.filter(
    (note) =>
      note.title.toLowerCase().includes(lowercaseQuery) ||
      note.content.toLowerCase().includes(lowercaseQuery)
  );
}

export function createEmptyNote(): Note {
  return createNoteObject({
    title: 'Untitled',
    content: '',
    folder: folderStore.currentFolder,
  });
}

let saveNoteTimeout: number | null = null;

export function debouncedSaveNote(
  editedNote: Ref<Note>,
  isNewNote: Ref<boolean>,
  isSaving: Ref<boolean>,
  isTrash: boolean
) {
  if (isTrash) return;

  if (isNewNote.value && isContentEmpty(editedNote.value.content)) {
    uiStore.showToastMessage('Empty note discarded');
    return;
  }

  if (saveNoteTimeout !== null) {
    clearTimeout(saveNoteTimeout);
  }

  saveNoteTimeout = window.setTimeout(async () => {
    try {
      isSaving.value = true;
      await saveNote(editedNote, isNewNote);
    } catch (error) {
      console.error('Error saving note:', error);
      uiStore.showToastMessage('Failed to save note. Please try again.');
    } finally {
      isSaving.value = false;
      saveNoteTimeout = null;
    }
  }, 2000);
}

async function saveNote(editedNote: Ref<Note>, isNewNote: Ref<boolean>) {
  const currentTime = new Date().toISOString();

  if (!isNewNote.value) {
    const lastHistory =
      editedNote.value.history?.[editedNote.value.history.length - 1];
    const hasChanges =
      !lastHistory ||
      lastHistory.title !== editedNote.value.title ||
      lastHistory.content !== editedNote.value.content;

    if (hasChanges) {
      const newHistoryEntry: NoteHistory = {
        timestamp: currentTime,
        title: editedNote.value.title,
        content: editedNote.value.content,
      };

      const updatedNote = {
        ...editedNote.value,
        last_edited: currentTime,
        history: [...(editedNote.value.history || []), newHistoryEntry],
      };
      await notesStore.updateNote(updatedNote.id, updatedNote);

      editedNote.value = { ...updatedNote };
    } else {
      const updatedNote = {
        ...editedNote.value,
        last_edited: currentTime,
      };
      await notesStore.updateNote(updatedNote.id, updatedNote);

      editedNote.value = { ...updatedNote };
    }
  } else {
    const newHistoryEntry: NoteHistory = {
      timestamp: currentTime,
      title: editedNote.value.title,
      content: editedNote.value.content,
    };

    const newNote = {
      ...editedNote.value,
      last_edited: currentTime,
      history: [newHistoryEntry],
    };
    const createdNote = await notesStore.createNote(newNote);
    editedNote.value = { ...createdNote };
    isNewNote.value = false;
  }
}

export function setupNoteListener(
  noteId: string,
  editedNote: Ref<Note>,
  initialNote: Ref<Note | null>,
  userId: string | undefined
) {
  if (userId) {
    const noteRef = dbRef(db, `users/${userId}/notes/${noteId}`);
    return onValue(noteRef, (snapshot) => {
      const updatedNote = snapshot.val();
      if (updatedNote && updatedNote.id === editedNote.value.id) {
        editedNote.value = { ...updatedNote };
        initialNote.value = { ...updatedNote };
      }
    });
  }
}

export async function handleNoteClose(
  editedNote: Ref<Note>,
  isNewNote: Ref<boolean>,
  isTrash: boolean,
  initialNote: Ref<Note | null>
) {
  if (isTrash) {
    await setLatestNoteVersion(editedNote);
    return;
  }

  if (isNewNote.value && isContentEmpty(editedNote.value.content)) {
    uiStore.showToastMessage('Empty note discarded');
    return;
  }

  const hasChanges = initialNote.value
    ? hasChanged(initialNote.value, editedNote.value)
    : true;

  if (hasChanges) {
    if (
      notesStore.currentHistoryIndex === null ||
      (editedNote.value.history &&
        notesStore.currentHistoryIndex === editedNote.value.history.length - 1)
    ) {
      await saveNote(editedNote, isNewNote);
    }
  }

  await setLatestNoteVersion(editedNote);
}

async function setLatestNoteVersion(editedNote: Ref<Note>) {
  if (editedNote.value.history && editedNote.value.history.length > 0) {
    const latestHistory =
      editedNote.value.history[editedNote.value.history.length - 1];
    editedNote.value.title = latestHistory.title;
    editedNote.value.content = latestHistory.content;
    editedNote.value.last_edited = latestHistory.timestamp;
  }
  notesStore.currentHistoryIndex = null;
}
