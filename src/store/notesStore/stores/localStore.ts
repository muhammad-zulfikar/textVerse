// localStore.ts

import { defineStore } from 'pinia';
import { Note } from '../types';
import initialNotes from '@/assets/initialNotes.json';
import { searchNotes } from '@/store/notesStore/helpers';
import { DEFAULT_FOLDERS } from '@/store/folderStore/constants';
import { notesStore } from '@/store';
import { importFolders } from '../actions';

export const useLocalStore = defineStore('local', {
  state: () => ({
    initialNotesLoaded: localStorage.getItem('initialNotesLoaded') === 'true',
  }),

  actions: {
    async loadInitialNotes() {
      const importedNotes = initialNotes.map((note) => ({
        ...note,
        id: note.id,
        last_edited: note.last_edited,
        pinned: false,
        folder: note.folder || DEFAULT_FOLDERS.UNCATEGORIZED,
      }));

      await importFolders(importedNotes);
      notesStore.notes = importedNotes;

      importedNotes.forEach((note) => {
        this.saveNoteToLocalStorage(note);
      });

      localStorage.setItem('initialNotesLoaded', 'true');
    },

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

    batchSaveNotesToLocalStorage(notes: Note[]): void {
      const existingNotes = this.getAllNotesFromLocalStorage();
      notes.forEach((note) => {
        existingNotes[note.id] = note;
      });
      localStorage.setItem('notes', JSON.stringify(existingNotes));
    },

    batchDeleteNotesFromLocalStorage(noteIds: string[]): void {
      const existingNotes = this.getAllNotesFromLocalStorage();
      noteIds.forEach((id) => {
        delete existingNotes[id];
      });
      localStorage.setItem('notes', JSON.stringify(existingNotes));
    },

    batchUpdateNotesInLocalStorage(
      noteIds: string[],
      updateFn: (note: Note) => Partial<Note>
    ): void {
      const notes = this.getAllNotesFromLocalStorage();
      noteIds.forEach((id) => {
        if (notes[id]) {
          notes[id] = { ...notes[id], ...updateFn(notes[id]) };
        }
      });
      localStorage.setItem('notes', JSON.stringify(notes));
    },

    searchNotesInLocalStorage(query: string): Note[] {
      const notes = this.getAllNotesFromLocalStorage();
      return searchNotes(Object.values(notes), query);
    },
  },
});
