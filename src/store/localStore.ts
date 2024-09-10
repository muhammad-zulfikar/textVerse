// localStore.ts

import { defineStore } from 'pinia';
import { Note } from '../utils/types';

export const useLocalStore = defineStore('local', {
  state: () => ({
    initialNotesLoaded: false,
  }),

  actions: {
    saveNoteToLocalStorage(note: Note): void {
      const notes = this.getAllNotesFromLocalStorage();
      notes[note.id] = note;
      localStorage.setItem('notes', JSON.stringify(notes));
    },

    updateNoteInLocalStorage(noteId: string, note: Partial<Note>): void {
      const notes = this.getAllNotesFromLocalStorage();
      if (notes[noteId]) {
        notes[noteId] = { ...notes[noteId], ...note };
        localStorage.setItem('notes', JSON.stringify(notes));
      }
    },

    deleteNoteFromLocalStorage(noteId: string): void {
      const notes = this.getAllNotesFromLocalStorage();
      delete notes[noteId];
      localStorage.setItem('notes', JSON.stringify(notes));
    },

    getNoteFromLocalStorage(noteId: string): Note | null {
      const notes = this.getAllNotesFromLocalStorage();
      return notes[noteId] || null;
    },

    getAllNotesFromLocalStorage(): Record<string, Note> {
      const notesJson = localStorage.getItem('notes');
      return notesJson ? JSON.parse(notesJson) : {};
    },

    setInitialNotesLoaded(value: boolean): void {
      this.initialNotesLoaded = value;
      localStorage.setItem('initialNotesLoaded', JSON.stringify(value));
    },

    getInitialNotesLoaded(): boolean {
      const loaded = localStorage.getItem('initialNotesLoaded');
      return loaded ? JSON.parse(loaded) : false;
    },

    saveFolderToLocalStorage(folderName: string): void {
      const folders = this.getAllFoldersFromLocalStorage();
      folders.push(folderName);
      localStorage.setItem('folders', JSON.stringify(folders));
    },

    deleteFolderFromLocalStorage(folderName: string): void {
      const folders = this.getAllFoldersFromLocalStorage();
      const index = folders.indexOf(folderName);
      if (index !== -1) {
        folders.splice(index, 1);
        localStorage.setItem('folders', JSON.stringify(folders));
      }
    },

    getAllFoldersFromLocalStorage(): string[] {
      const foldersJson = localStorage.getItem('folders');
      return foldersJson ? JSON.parse(foldersJson) : [];
    },

    moveNoteToTrashInLocalStorage(note: Note): void {
      const trash = this.getDeletedNotesFromLocalStorage();
      trash[note.id] = note;
      localStorage.setItem('deletedNotes', JSON.stringify(trash));
      this.deleteNoteFromLocalStorage(note.id);
    },

    restoreNoteFromTrashInLocalStorage(note: Note): void {
      this.saveNoteToLocalStorage(note);
      const trash = this.getDeletedNotesFromLocalStorage();
      delete trash[note.id];
      localStorage.setItem('deletedNotes', JSON.stringify(trash));
    },

    permanentlyDeleteNoteFromTrashInLocalStorage(noteId: string): void {
      const trash = this.getDeletedNotesFromLocalStorage();
      delete trash[noteId];
      localStorage.setItem('deletedNotes', JSON.stringify(trash));
    },

    emptyTrashInLocalStorage(): void {
      localStorage.removeItem('deletedNotes');
    },

    getDeletedNotesFromLocalStorage(): Record<string, Note> {
      const trashJson = localStorage.getItem('deletedNotes');
      return trashJson ? JSON.parse(trashJson) : {};
    },

    clearAllNotesFromLocalStorage(): void {
      localStorage.removeItem('notes');
      localStorage.removeItem('folders');
    },
  },
});
