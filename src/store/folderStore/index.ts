import { defineStore } from 'pinia';
import { DEFAULT_FOLDERS } from '@/store/folderStore/constants';
import { authStore, notesStore, uiStore, firebaseStore } from '@/store';
import { off, onValue, ref, set, get } from 'firebase/database';
import { db } from '@/firebase';
import { Note } from '@/store/notesStore/types';
import stateFactory from './state';

export const useFolderStore = defineStore('folders', {
  state: stateFactory,

  actions: {
    async addFolder(folderName: string) {
      if (!this.folders.includes(folderName)) {
        this.folders.push(folderName);
        await this.saveFolders();
      }
    },

    async renameFolder(oldName: string, newName: string) {
      const index = this.folders.indexOf(oldName);
      if (index !== -1) {
        this.folders[index] = newName;
        await this.saveFolders();
        await this.updateNoteFolders(oldName, newName);
      }
      this.currentFolder = newName;
      uiStore.showToastMessage(`Folder ${oldName} renamed to ${newName}`);
    },

    async deleteFolder(folderName: string) {
      this.folders = this.folders.filter((f) => f !== folderName);
      await this.saveFolders();
      await this.updateNoteFolders(folderName, DEFAULT_FOLDERS.UNCATEGORIZED);

      if (this.currentFolder === folderName) {
        this.currentFolder = DEFAULT_FOLDERS.ALL_NOTES;
      }
      uiStore.showToastMessage(`Folder ${folderName} successfully deleted`);
    },

    setCurrentFolder(folderName: string) {
      this.currentFolder = folderName;
    },

    loadLocalFolders() {
      const savedFolders = localStorage.getItem('folders');
      if (savedFolders) {
        this.folders = JSON.parse(savedFolders);
      } else {
        this.folders = [
          DEFAULT_FOLDERS.ALL_NOTES,
          DEFAULT_FOLDERS.UNCATEGORIZED,
        ];
      }
    },

    async loadFirebaseFolders() {
      if (!authStore.isLoggedIn) return;

      const foldersRef = ref(db, `users/${authStore.user!.uid}/folders`);
      const snapshot = await get(foldersRef);
      if (snapshot.exists()) {
        const loadedFolders = snapshot.val() || {};
        this.folders = Array.from(
          new Set([
            DEFAULT_FOLDERS.ALL_NOTES,
            DEFAULT_FOLDERS.UNCATEGORIZED,
            ...Object.keys(loadedFolders),
          ])
        );
      } else {
        this.folders = [
          DEFAULT_FOLDERS.ALL_NOTES,
          DEFAULT_FOLDERS.UNCATEGORIZED,
        ];
        await this.saveFolders();
      }
    },

    setupFirebaseListener() {
      if (!authStore.isLoggedIn) return;

      const foldersRef = ref(db, `users/${authStore.user!.uid}/folders`);
      this.clearFolderListener();
      this.folderListener = onValue(foldersRef, (snapshot) => {
        const loadedFolders = snapshot.val() || {};
        this.folders = Array.from(
          new Set([
            DEFAULT_FOLDERS.ALL_NOTES,
            DEFAULT_FOLDERS.UNCATEGORIZED,
            ...Object.keys(loadedFolders),
          ])
        );
      });
    },

    clearFolderListener() {
      if (this.folderListener) {
        off(ref(db, `users/${authStore.user!.uid}/folders`));
        this.folderListener = null;
      }
    },

    async saveFolders() {
      const foldersToSave = this.folders.filter(
        (f) =>
          ![DEFAULT_FOLDERS.ALL_NOTES, DEFAULT_FOLDERS.UNCATEGORIZED].includes(
            f
          )
      );

      if (authStore.isLoggedIn) {
        const foldersObj = Object.fromEntries(
          foldersToSave.map((f) => [f, true])
        );
        await set(ref(db, `users/${authStore.user!.uid}/folders`), foldersObj);
      } else {
        localStorage.setItem('folders', JSON.stringify(this.folders));
      }
    },

    async updateNoteFolders(oldFolder: string, newFolder: string) {
      if (authStore.isLoggedIn) {
        const notes = await firebaseStore.getAllNotesFromFirebase(
          authStore.user!.uid
        );
        for (const note of Object.values(notes)) {
          if (note.folder === oldFolder) {
            await firebaseStore.updateNoteInFirebase(
              authStore.user!.uid,
              note.id,
              { folder: newFolder }
            );
          }
        }
      } else {
        const updatedNotes = notesStore.notes.map((note: Note) =>
          note.folder === oldFolder ? { ...note, folder: newFolder } : note
        );
        notesStore.notes = updatedNotes;
        localStorage.setItem('notes', JSON.stringify(updatedNotes));
      }
    },

    notesCountByFolder(): Record<string, number> {
      return this.folders.reduce(
        (counts, folder) => {
          counts[folder] =
            folder === DEFAULT_FOLDERS.ALL_NOTES
              ? notesStore.notes.length
              : notesStore.notes.filter((note) => note.folder === folder)
                  .length;
          return counts;
        },
        {} as Record<string, number>
      );
    },

    async loadFolders() {
      if (authStore.isLoggedIn) {
        await this.loadFirebaseFolders();
      } else {
        this.loadLocalFolders();
      }
    },

    async initializeFolders() {
      await this.loadFolders();
      if (authStore.isLoggedIn) {
        this.setupFirebaseListener();
      }
    },
  },
});
