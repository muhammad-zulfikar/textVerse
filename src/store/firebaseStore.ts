// firebaseStore.ts

import { defineStore } from 'pinia';
import { ref, set, get, remove, update, onValue } from 'firebase/database';
import { db } from '@/firebase';
import { Note, PublicNote } from '../utils/types';

export const useFirebaseStore = defineStore('firebase', {
  actions: {
    async saveNoteToFirebase(userId: string, note: Note): Promise<string> {
      const noteRef = ref(db, `users/${userId}/notes/${note.id}`);
      await set(noteRef, note);
      return note.id;
    },

    async updateNoteInFirebase(
      userId: string,
      noteId: string,
      note: Partial<Note>
    ): Promise<void> {
      const noteRef = ref(db, `users/${userId}/notes/${noteId}`);
      await update(noteRef, note);
    },

    async deleteNoteFromFirebase(
      userId: string,
      noteId: string
    ): Promise<void> {
      const noteRef = ref(db, `users/${userId}/notes/${noteId}`);
      await remove(noteRef);
    },

    async getNoteFromFirebase(
      userId: string,
      noteId: string
    ): Promise<Note | null> {
      const noteRef = ref(db, `users/${userId}/notes/${noteId}`);
      const snapshot = await get(noteRef);
      return snapshot.val() as Note | null;
    },

    async getAllNotesFromFirebase(
      userId: string
    ): Promise<Record<string, Note>> {
      const notesRef = ref(db, `users/${userId}/notes`);
      const snapshot = await get(notesRef);
      return (snapshot.val() as Record<string, Note>) || {};
    },

    async saveFolderToFirebase(
      userId: string,
      folderName: string
    ): Promise<void> {
      const folderRef = ref(db, `users/${userId}/folders/${folderName}`);
      await set(folderRef, true);
    },

    async deleteFolderFromFirebase(
      userId: string,
      folderName: string
    ): Promise<void> {
      const folderRef = ref(db, `users/${userId}/folders/${folderName}`);
      await remove(folderRef);
    },

    async getAllFoldersFromFirebase(userId: string): Promise<string[]> {
      const foldersRef = ref(db, `users/${userId}/folders`);
      const snapshot = await get(foldersRef);
      return snapshot.val() ? Object.keys(snapshot.val()) : [];
    },

    async moveNoteToTrash(userId: string, note: Note): Promise<void> {
      const noteRef = ref(db, `users/${userId}/trash/${note.id}`);
      await set(noteRef, note);
      await this.deleteNoteFromFirebase(userId, note.id);
    },

    async restoreNoteFromTrash(userId: string, note: Note): Promise<void> {
      await this.saveNoteToFirebase(userId, note);
      await remove(ref(db, `users/${userId}/trash/${note.id}`));
    },

    async permanentlyDeleteNoteFromTrash(
      userId: string,
      noteId: string
    ): Promise<void> {
      await remove(ref(db, `users/${userId}/trash/${noteId}`));
    },

    async emptyTrashInFirebase(userId: string): Promise<void> {
      const trashRef = ref(db, `users/${userId}/trash`);
      await remove(trashRef);
    },

    async getDeletedNotesFromFirebase(
      userId: string
    ): Promise<Record<string, Note>> {
      const trashRef = ref(db, `users/${userId}/trash`);
      const snapshot = await get(trashRef);
      return (snapshot.val() as Record<string, Note>) || {};
    },

    onNotesUpdate(
      userId: string,
      callback: (notes: Record<string, Note>) => void
    ): () => void {
      const notesRef = ref(db, `users/${userId}/notes`);
      return onValue(notesRef, (snapshot) => {
        const notes = snapshot.val() as Record<string, Note>;
        callback(notes);
      });
    },

    async savePublicNote(publicNote: PublicNote): Promise<void> {
      const publicRef = ref(db, `publicNotes/${publicNote.publicId}`);
      await set(publicRef, publicNote);
    },

    async removePublicNote(publicId: string): Promise<void> {
      const publicRef = ref(db, `publicNotes/${publicId}`);
      await remove(publicRef);
    },

    async getPublicNotes(): Promise<Record<string, PublicNote>> {
      const publicNotesRef = ref(db, 'publicNotes');
      const snapshot = await get(publicNotesRef);
      return (snapshot.val() as Record<string, PublicNote>) || {};
    },

    async clearAllNotesFromFirebase(userId: string): Promise<void> {
      const notesRef = ref(db, `users/${userId}/notes`);
      const foldersRef = ref(db, `users/${userId}/folders`);
      await remove(notesRef);
      await remove(foldersRef);
    },

    async saveSortPreference(userId: string, sortType: 'date' | 'title') {
      try {
        await set(ref(db, `users/${userId}/settings/sortType`), sortType);
      } catch (error) {
        console.error('Error saving sort preference to Firebase:', error);
        throw error;
      }
    },

    async loadSortPreference(userId: string): Promise<'date' | 'title' | null> {
      try {
        const snapshot = await get(
          ref(db, `users/${userId}/settings/sortType`)
        );
        return snapshot.val() as 'date' | 'title' | null;
      } catch (error) {
        console.error('Error loading sort preference from Firebase:', error);
        return null;
      }
    },
  },
});
