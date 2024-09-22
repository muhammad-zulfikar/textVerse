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

        if (authStore.isLoggedIn) {
          const notes = await firebaseStore.getAllNotesFromFirebase(
            authStore.user!.uid
          );
          for (const note of Object.values(notes)) {
            if (note.folder === oldName) {
              await firebaseStore.updateNoteInFirebase(
                authStore.user!.uid,
                note.id,
                { folder: newName }
              );
            }
          }
        } else {
          const updatedNotes = notesStore.notes.map((note: Note) => {
            if (note.folder === oldName) {
              return { ...note, folder: newName };
            }
            return note;
          });
          notesStore.notes = updatedNotes;
          localStorage.setItem('notes', JSON.stringify(updatedNotes));
        }
      }
    },

    async deleteFolder(folderName: string) {
      this.folders = this.folders.filter((f) => f !== folderName);
      await this.saveFolders();

      if (authStore.isLoggedIn) {
        const notes = await firebaseStore.getAllNotesFromFirebase(
          authStore.user!.uid
        );
        for (const note of Object.values(notes)) {
          if (note.folder === folderName) {
            await firebaseStore.updateNoteInFirebase(
              authStore.user!.uid,
              note.id,
              { folder: DEFAULT_FOLDERS.UNCATEGORIZED }
            );
          }
        }
      } else {
        const updatedNotes = notesStore.notes.map((note: Note) => {
          if (note.folder === folderName) {
            return { ...note, folder: DEFAULT_FOLDERS.UNCATEGORIZED };
          }
          return note;
        });
        notesStore.notes = updatedNotes;
        localStorage.setItem('notes', JSON.stringify(updatedNotes));
      }

      if (this.currentFolder === folderName) {
        this.currentFolder = DEFAULT_FOLDERS.ALL_NOTES;
      }
      uiStore.showToastMessage(`Folder ${folderName} successfully deleted`);
    },

    setCurrentFolder(folderName: string) {
      this.currentFolder = folderName;
    },

    clearFolderListener() {
      if (this.folderListener) {
        off(ref(db, `users/${authStore.user!.uid}/folders`));
        this.folderListener = null;
      }
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
        this.loadLocalFolders();
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

    async saveFolders() {
      if (authStore.isLoggedIn) {
        const foldersToSave = this.folders.filter(
          (f) =>
            f !== DEFAULT_FOLDERS.ALL_NOTES &&
            f !== DEFAULT_FOLDERS.UNCATEGORIZED
        );
        const foldersObj = Object.fromEntries(
          foldersToSave.map((f) => [f, true])
        );
        await set(ref(db, `users/${authStore.user!.uid}/folders`), foldersObj);
      } else {
        localStorage.setItem('folders', JSON.stringify(this.folders));
      }
    },

    notesCountByFolder(): Record<string, number> {
      const counts: Record<string, number> = {};
      this.folders.forEach((folder) => {
        counts[folder] =
          folder === DEFAULT_FOLDERS.ALL_NOTES
            ? notesStore.notes.length
            : notesStore.notes.filter((note) => note.folder === folder).length;
      });
      return counts;
    },

    async initializeFolders() {
      if (authStore.isLoggedIn) {
        await this.loadFirebaseFolders();
        this.setupFirebaseListener();
      } else {
        this.loadLocalFolders();
      }
    },
  },
});
