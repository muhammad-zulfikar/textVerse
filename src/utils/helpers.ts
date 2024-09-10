// notesHelpers.ts

import { Note, PublicNote } from './types';
import { DEFAULT_FOLDERS } from './constants';
import DOMPurify from 'dompurify';
import { nanoid } from 'nanoid';

export function createNoteObject(
  newNote: Omit<Note, 'id' | 'time_created' | 'last_edited' | 'pinned'>,
  currentFolder: string
): Note {
  const now = new Date().toISOString();
  return {
    ...newNote,
    id: nanoid(),
    time_created: now,
    last_edited: now,
    pinned: false,
    folder:
      currentFolder === DEFAULT_FOLDERS.ALL_NOTES
        ? DEFAULT_FOLDERS.UNCATEGORIZED
        : currentFolder,
    content: DOMPurify.sanitize(newNote.content),
  };
}

export function createUpdatedNoteObject(updatedNote: Note): Note {
  return {
    ...updatedNote,
    content: DOMPurify.sanitize(updatedNote.content),
    last_edited: new Date().toISOString(),
  };
}

export function createDuplicateNoteObject(originalNote: Note): Note {
  return {
    ...originalNote,
    id: nanoid(),
    title: `${originalNote.title} (Copy)`,
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

export function compareNotes(a: Note, b: Note): number {
  if (a.pinned && !b.pinned) return -1;
  if (!a.pinned && b.pinned) return 1;
  return (
    new Date(b.time_created).getTime() - new Date(a.time_created).getTime()
  );
}

export function hasChanged(
  originalNote: Note,
  editedNote: Partial<Note>
): boolean {
  const sanitizeAndNormalizeContent = (content: string) => {
    const sanitized = DOMPurify.sanitize(content);
    const div = document.createElement('div');
    div.innerHTML = sanitized;
    return div.innerHTML;
  };

  return (
    originalNote.title !== editedNote.title ||
    sanitizeAndNormalizeContent(originalNote.content) !==
      sanitizeAndNormalizeContent(editedNote.content || '') ||
    originalNote.folder !== editedNote.folder
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
  const publicId = nanoid();
  return {
    id: note.id,
    uid: userId,
    publicId,
  };
}
