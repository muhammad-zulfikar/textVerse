// firebaseStore.ts

import { ref, set, get, remove, update, onValue } from 'firebase/database';
import { db } from '@/firebase';
import { Note } from './types';

export const saveNoteToFirebase = async (
  userId: string,
  note: Note
): Promise<string> => {
  const noteRef = ref(db, `users/${userId}/notes/${note.id}`);
  await set(noteRef, note);
  return note.id;
};

export const updateNoteInFirebase = async (
  userId: string,
  noteId: string,
  note: Partial<Note>
): Promise<void> => {
  const noteRef = ref(db, `users/${userId}/notes/${noteId}`);
  await update(noteRef, note);
};

export const deleteNoteFromFirebase = async (
  userId: string,
  noteId: string
): Promise<void> => {
  const noteRef = ref(db, `users/${userId}/notes/${noteId}`);
  await remove(noteRef);
};

export const getNoteFromFirebase = async (
  userId: string,
  noteId: string
): Promise<Note | null> => {
  const noteRef = ref(db, `users/${userId}/notes/${noteId}`);
  const snapshot = await get(noteRef);
  return snapshot.val() as Note | null;
};

export const getAllNotesFromFirebase = async (
  userId: string
): Promise<Record<number, Note>> => {
  const notesRef = ref(db, `users/${userId}/notes`);
  const snapshot = await get(notesRef);
  return (snapshot.val() as Record<number, Note>) || {};
};

export const saveFolderToFirebase = async (
  userId: string,
  folderName: string
): Promise<void> => {
  const folderRef = ref(db, `users/${userId}/folders/${folderName}`);
  await set(folderRef, true);
};

export const deleteFolderFromFirebase = async (
  userId: string,
  folderName: string
): Promise<void> => {
  const folderRef = ref(db, `users/${userId}/folders/${folderName}`);
  await remove(folderRef);
};

export const getAllFoldersFromFirebase = async (
  userId: string
): Promise<string[]> => {
  const foldersRef = ref(db, `users/${userId}/folders`);
  const snapshot = await get(foldersRef);
  return snapshot.val() ? Object.keys(snapshot.val()) : [];
};

export const updateNoteFolderInFirebase = async (
  userId: string,
  noteId: string,
  newFolder: string
): Promise<void> => {
  const noteRef = ref(db, `users/${userId}/notes/${noteId}`);
  await update(noteRef, { folder: newFolder });
};

export const moveNoteToTrash = async (
  userId: string,
  note: Note
): Promise<void> => {
  const noteRef = ref(db, `users/${userId}/trash/${note.id}`);
  await set(noteRef, note);
  await deleteNoteFromFirebase(userId, note.id);
};

export const restoreNoteFromTrash = async (
  userId: string,
  note: Note
): Promise<void> => {
  await saveNoteToFirebase(userId, note);
  await remove(ref(db, `users/${userId}/trash/${note.id}`));
};

export const permanentlyDeleteNoteFromTrash = async (
  userId: string,
  noteId: string
): Promise<void> => {
  await remove(ref(db, `users/${userId}/trash/${noteId}`));
};

export const emptyTrashInFirebase = async (userId: string): Promise<void> => {
  const trashRef = ref(db, `users/${userId}/trash`);
  await remove(trashRef);
};

export const deleteOldTrashItems = async (userId: string): Promise<void> => {
  const trashRef = ref(db, `users/${userId}/trash`);
  const snapshot = await get(trashRef);
  const trash = snapshot.val() as Record<string, Note>;

  if (trash) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (const [noteId, note] of Object.entries(trash)) {
      const timeDeleted = note.time_deleted;
      if (timeDeleted) {
        const timeDeletedDate = new Date(timeDeleted);
        if (
          !isNaN(timeDeletedDate.getTime()) &&
          timeDeletedDate < thirtyDaysAgo
        ) {
          await permanentlyDeleteNoteFromTrash(userId, noteId);
        }
      }
    }
  }
};

export const getDeletedNotesFromFirebase = async (
  userId: string
): Promise<Record<number, Note>> => {
  const trashRef = ref(db, `users/${userId}/trash`);
  const snapshot = await get(trashRef);
  return (snapshot.val() as Record<number, Note>) || {};
};

export const onNotesUpdate = (
  userId: string,
  callback: (notes: Record<string, Note>) => void
): (() => void) => {
  const notesRef = ref(db, `users/${userId}/notes`);
  return onValue(notesRef, (snapshot) => {
    const notes = snapshot.val() as Record<string, Note>;
    callback(notes);
  });
};
