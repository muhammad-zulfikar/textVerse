// stores/folderStore.ts

import { defineStore } from 'pinia';
import { DEFAULT_FOLDERS } from '../utils/constants';
import { authStore, notesStore, uiStore, firebaseStore } from '../utils/stores';
import { off, onValue, ref } from 'firebase/database';
import { db } from '@/firebase';

interface FolderState {
  folders: string[];
  currentFolder: string;
  folderListener: (() => void) | null;
}

export const useFolderStore = defineStore('folders', {
  state: (): FolderState => ({
    folders: [DEFAULT_FOLDERS.ALL_NOTES, DEFAULT_FOLDERS.UNCATEGORIZED],
    currentFolder: DEFAULT_FOLDERS.ALL_NOTES,
    folderListener: null as null | (() => void),
  }),

  actions: {
    async addFolder(folderName: string) {
      if (!this.folders.includes(folderName)) {
        this.folders.push(folderName);
        if (authStore.isLoggedIn) {
          await firebaseStore.saveFolderToFirebase(
            authStore.user!.uid,
            folderName
          );
        } else {
          this.saveFolders();
        }
      }
      uiStore.showToastMessage(`Folder ${folderName} succesfully created`);
      this.setCurrentFolder(folderName);
    },

    async renameFolder(oldName: string, newName: string) {
      const index = this.folders.indexOf(oldName);
      if (index !== -1) {
        this.folders[index] = newName;

        if (authStore.isLoggedIn) {
          await firebaseStore.deleteFolderFromFirebase(
            authStore.user!.uid,
            oldName
          );
          await firebaseStore.saveFolderToFirebase(
            authStore.user!.uid,
            newName
          );
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
          this.saveFolders();
        }
      }
      uiStore.showToastMessage(`Folder renamed to ${newName}`);
    },

    async deleteFolder(folderName: string) {
      this.folders = this.folders.filter((f) => f !== folderName);

      if (authStore.isLoggedIn) {
        await firebaseStore.deleteFolderFromFirebase(
          authStore.user!.uid,
          folderName
        );
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
        this.saveFolders();
      }

      if (this.currentFolder === folderName) {
        this.currentFolder = DEFAULT_FOLDERS.ALL_NOTES;
      }
      uiStore.showToastMessage(`Folder ${folderName} succesfully deleted`);
    },

    setCurrentFolder(folderName: string) {
      this.currentFolder = folderName;
    },

    clearFolderListener() {
      if (this.folderListener) {
        if (authStore.user) {
          off(ref(db, `users/${authStore.user.uid}/folders`));
        }
        this.folderListener = null;
      }
    },

    async loadFoldersFromLocalStorage() {
      const savedFolders = localStorage.getItem('folders');
      if (savedFolders) {
        this.folders = JSON.parse(savedFolders);
      } else {
        this.folders = [
          DEFAULT_FOLDERS.ALL_NOTES,
          DEFAULT_FOLDERS.UNCATEGORIZED,
        ];
      }
      this.currentFolder = DEFAULT_FOLDERS.ALL_NOTES;
    },

    async loadFolders() {
      if (authStore.isLoggedIn) {
        const foldersRef = ref(db, `users/${authStore.user!.uid}/folders`);
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
      } else {
        await this.loadFoldersFromLocalStorage();
      }
    },

    saveFolders() {
      if (!authStore.isLoggedIn) {
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
  },
});
