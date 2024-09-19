// helpers.ts

import { Note, PublicNote } from './types';
import { DEFAULT_FOLDERS } from './constants';
import DOMPurify from 'dompurify';

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
  newNote: Omit<Note, 'id' | 'time_created' | 'last_edited' | 'pinned'>
): Note {
  const now = new Date().toISOString();
  const defaultFolder =
    newNote.folder === DEFAULT_FOLDERS.ALL_NOTES
      ? DEFAULT_FOLDERS.UNCATEGORIZED
      : newNote.folder;

  return {
    ...newNote,
    id: generateUniqueId(),
    time_created: now,
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
    time_created: new Date().toISOString(),
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
      note.time_created &&
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
  folderId: string
): Note[] {
  const lowercaseQuery = query.toLowerCase();
  return notes.filter(
    (note) =>
      (folderId === DEFAULT_FOLDERS.ALL_NOTES || note.folder === folderId) &&
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
