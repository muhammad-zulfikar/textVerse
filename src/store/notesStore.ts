import { defineStore } from 'pinia';
import { Note, PublicNote } from './types';
import { DEFAULT_FOLDERS } from './constants';
import { authStore, folderStore, uiStore, firebaseStore } from './stores';
import { db } from '@/firebase';
import { get, onValue, ref, remove, set } from 'firebase/database';
import initialNotes from '@/assets/initialNotes.json';
import DOMPurify from 'dompurify';
import { nanoid } from 'nanoid';

interface NotesState {
  notes: Note[];
  deletedNotes: Note[];
  selectedNotes: string[];
  selectedNoteId: string | null;
  searchQuery: string;
  publicNotes: Map<string, string>;
  notesListener: (() => void) | null;
}

export const useNotesStore = defineStore('notes', {
  state: (): NotesState => ({
    notes: [],
    deletedNotes: [],
    selectedNotes: [],
    selectedNoteId: null,
    searchQuery: '',
    publicNotes: new Map(),
    notesListener: null,
  }),

  getters: {
    selectedNote: (state) =>
      state.notes.find((note) => note.id === state.selectedNoteId),
    filteredNotes:
      (state) =>
      (folderId: string): Note[] => {
        const query = state.searchQuery.toLowerCase();
        return state.notes.filter(
          (note) =>
            (folderId === DEFAULT_FOLDERS.ALL_NOTES ||
              note.folder === folderId) &&
            (note.title.toLowerCase().includes(query) ||
              note.content.toLowerCase().includes(query))
        );
      },
  },

  actions: {
    async addNote(
      newNote: Omit<Note, 'id' | 'time_created' | 'last_edited' | 'pinned'>
    ) {
      const note = this.createNoteObject(newNote);
      await this.saveNoteToStore(note);
      uiStore.showToastMessage(`${note.title} added`);
      return note;
    },

    async updateNote(updatedNote: Note) {
      const noteWithTimestamp = this.createUpdatedNoteObject(updatedNote);
      await this.saveNoteToStore(noteWithTimestamp);
    },

    async duplicateNote(originalNote: Note) {
      const newNote = this.createDuplicateNoteObject(originalNote);
      await this.saveNoteToStore(newNote);
      uiStore.showToastMessage(`${newNote.title} created`);
      return newNote;
    },

    async deleteNote(noteId: string) {
      const deletedNote = this.removeNoteFromStore(noteId);
      if (deletedNote) {
        await this.moveNoteToTrash(deletedNote);
        uiStore.showToastMessage(`${deletedNote.title} moved to trash`);
      }
    },

    async restoreNote(noteId: string) {
      const restoredNote = this.removeNoteFromTrash(noteId);
      if (restoredNote) {
        await this.saveNoteToStore(restoredNote);
        uiStore.showToastMessage(`${restoredNote.title} restored`);
      }
    },

    async permanentlyDeleteNote(noteId: string) {
      await this.removeNoteFromTrash(noteId, true);
      uiStore.showToastMessage('Note permanently deleted');
    },

    async pinNote(noteId: string) {
      await this.toggleNotePin(noteId, true);
    },

    async unpinNote(noteId: string) {
      await this.toggleNotePin(noteId, false);
    },

    async moveNote(noteId: string, targetFolder: string) {
      const note = this.notes.find((n) => n.id === noteId);
      if (note) {
        note.folder = targetFolder;
        await this.saveNoteToStore(note);
        uiStore.showToastMessage(`${note.title} moved to ${targetFolder}`);
      }
    },

    copyNote(noteId: string) {
      const note = this.notes.find((n) => n.id === noteId);
      if (note) {
        this.copyNoteContentToClipboard(note);
      }
    },

    async publicNote(noteId: string) {
      if (this.publicNotes.has(noteId)) {
        await this.unpublicNote(noteId);
        return;
      }

      const note = this.notes.find((n) => n.id === noteId);
      if (!note) {
        uiStore.showToastMessage('Note not found.');
        return;
      }

      await this.makeNotePublic(note);
    },

    async unpublicNote(noteId: string) {
      try {
        const publicId = this.publicNotes.get(noteId);
        if (publicId) {
          await this.removePublicNote(publicId);
          uiStore.showToastMessage('Note unpublic.');
        } else {
          uiStore.showToastMessage('Note was not public.');
        }
      } catch (error) {
        uiStore.showToastMessage('Failed to unpublic note.');
        console.error('Unpublic note error:', error);
      }
    },

    async togglePublic(noteId: string) {
      if (this.publicNotes.has(noteId)) {
        await this.unpublicNote(noteId);
      } else {
        await this.publicNote(noteId);
      }
    },

    getPublicId(noteId: string): string | undefined {
      return this.publicNotes.get(noteId);
    },

    copyPublicLink(noteId: string) {
      const publicId = this.getPublicId(noteId);
      if (publicId) {
        this.copyLinkToClipboard(publicId);
      }
    },

    async importNotes() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (event) => this.handleImportFile(event);
      input.click();
    },

    async downloadBackup() {
      const notesToBackup = await this.getNotesToBackup();
      this.createAndDownloadBackupFile(notesToBackup);
    },

    async deleteAllNotes() {
      await this.clearAllNotes();
      this.resetFolders();
      uiStore.showToastMessage('All notes and folders deleted successfully!');
    },

    async loadNotes() {
      if (authStore.isLoggedIn) {
        await this.loadNotesFromFirebase();
      } else {
        await this.loadNotesFromLocalStorage();
      }
      this.reorderNotes();
    },

    async unloadNotes() {
      if (this.notesListener) {
        this.notesListener();
        this.notesListener = null;
      }
    },

    async syncNotesFromFirebase(userId: string) {
      try {
        await this.performNoteSync(userId);
        uiStore.showToastMessage('Notes synced successfully');
      } catch (error) {
        console.error('Error syncing notes:', error);
        uiStore.showToastMessage('Failed to sync notes');
        throw error;
      }
    },

    reorderNotes() {
      this.notes.sort(this.compareNotes);
    },

    setSearchQuery(query: string) {
      this.searchQuery = query;
    },

    setSelectedNote(noteId: string | null) {
      this.selectedNoteId = noteId;
    },

    // Helper methods (previously private)
    createNoteObject(
      newNote: Omit<Note, 'id' | 'time_created' | 'last_edited' | 'pinned'>
    ): Note {
      const now = new Date().toISOString();
      return {
        ...newNote,
        id: nanoid(),
        time_created: now,
        last_edited: now,
        pinned: false,
        folder:
          folderStore.currentFolder === DEFAULT_FOLDERS.ALL_NOTES
            ? DEFAULT_FOLDERS.UNCATEGORIZED
            : folderStore.currentFolder,
        content: DOMPurify.sanitize(newNote.content),
      };
    },

    createUpdatedNoteObject(updatedNote: Note): Note {
      return {
        ...updatedNote,
        content: DOMPurify.sanitize(updatedNote.content),
        last_edited: new Date().toISOString(),
      };
    },

    createDuplicateNoteObject(originalNote: Note): Note {
      return {
        ...originalNote,
        id: nanoid(),
        title: `${originalNote.title} (Copy)`,
        time_created: new Date().toISOString(),
        last_edited: new Date().toISOString(),
        pinned: false,
      };
    },

    async saveNoteToStore(note: Note) {
      if (authStore.isLoggedIn) {
        await firebaseStore.saveNoteToFirebase(authStore.user!.uid, note);
      } else {
        const index = this.notes.findIndex((n) => n.id === note.id);
        if (index !== -1) {
          this.notes[index] = note;
        } else {
          this.notes.unshift(note);
        }
        this.saveNotes();
      }
      this.reorderNotes();
    },

    removeNoteFromStore(noteId: string): Note | undefined {
      const index = this.notes.findIndex((n) => n.id === noteId);
      if (index !== -1) {
        return this.notes.splice(index, 1)[0];
      }
      return undefined;
    },

    async moveNoteToTrash(note: Note) {
      note.time_deleted = new Date().toISOString();
      this.deletedNotes.push(note);
      if (authStore.isLoggedIn) {
        await firebaseStore.moveNoteToTrash(authStore.user!.uid, note);
      } else {
        this.saveDeletedNotes();
      }
    },

    removeNoteFromTrash(
      noteId: string,
      permanent: boolean = false
    ): Note | undefined {
      const index = this.deletedNotes.findIndex((n) => n.id === noteId);
      if (index !== -1) {
        const note = this.deletedNotes.splice(index, 1)[0];
        if (!permanent) {
          delete note.time_deleted;
          return note;
        }
      }
      return undefined;
    },

    async toggleNotePin(noteId: string, pinned: boolean) {
      const note = this.notes.find((n) => n.id === noteId);
      if (note) {
        note.pinned = pinned;
        await this.saveNoteToStore(note);
        uiStore.showToastMessage(
          `${note.title} ${pinned ? 'pinned' : 'unpinned'}`
        );
      }
    },

    copyNoteContentToClipboard(note: Note) {
      const cleanContent = DOMPurify.sanitize(note.content, {
        RETURN_DOM: true,
      });
      const textContent = cleanContent.textContent || '';
      navigator.clipboard
        .writeText(textContent)
        .then(() =>
          uiStore.showToastMessage(`${note.title} copied to clipboard`)
        )
        .catch(() => uiStore.showToastMessage('Failed to copy note content'));
    },

    async makeNotePublic(note: Note) {
      const publicId = nanoid();
      const publicNote: PublicNote = {
        id: note.id,
        uid: authStore.user!.uid,
        publicId,
      };
      const publicRef = ref(db, `publicNotes/${publicId}`);
      await set(publicRef, publicNote);
      this.publicNotes.set(note.id, publicId);
      this.copyLinkToClipboard(publicId);
    },

    async removePublicNote(publicId: string) {
      const publicRef = ref(db, `publicNotes/${publicId}`);
      await remove(publicRef);
      for (const [noteId, id] of this.publicNotes.entries()) {
        if (id === publicId) {
          this.publicNotes.delete(noteId);
          break;
        }
      }
    },

    copyLinkToClipboard(publicId: string) {
      const publicLink = `${window.location.origin}/public/${publicId}`;
      navigator.clipboard
        .writeText(publicLink)
        .then(() => uiStore.showToastMessage('Public link copied to clipboard'))
        .catch(() => uiStore.showToastMessage('Failed to copy public link'));
    },

    async handleImportFile(event: Event) {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file && file.type === 'application/json') {
        const reader = new FileReader();
        reader.onload = (e) =>
          this.processImportedNotes(e.target?.result as string);
        reader.onerror = () =>
          uiStore.showToastMessage('Failed to read file. Please try again.');
        reader.readAsText(file);
      } else {
        uiStore.showToastMessage('Please select a JSON file.');
      }
    },

    async processImportedNotes(jsonString: string) {
      try {
        const importedNotes: Note[] = JSON.parse(jsonString);
        await this.validateAndSaveImportedNotes(importedNotes);
        uiStore.showToastMessage('Notes and folders imported successfully!');
      } catch (error) {
        console.error('Import error:', error);
        uiStore.showToastMessage(
          'Failed to import notes. Please check the file format and try again.'
        );
      }
    },

    async validateAndSaveImportedNotes(importedNotes: Note[]) {
      if (!Array.isArray(importedNotes) || !this.areValidNotes(importedNotes)) {
        throw new Error('Invalid notes format.');
      }

      await this.importFolders(importedNotes);
      await this.saveImportedNotes(importedNotes);
      await this.loadNotes();
    },

    areValidNotes(notes: any[]): notes is Note[] {
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
    },

    async importFolders(notes: Note[]) {
      const importedFolders = new Set(
        notes
          .map((note) => note.folder)
          .filter(
            (folder) =>
              folder !== DEFAULT_FOLDERS.ALL_NOTES &&
              folder !== DEFAULT_FOLDERS.UNCATEGORIZED
          )
      );

      for (const folder of importedFolders) {
        await folderStore.addFolder(folder);
      }
    },

    async saveImportedNotes(notes: Note[]) {
      if (authStore.isLoggedIn) {
        for (const note of notes) {
          const validId = nanoid();
          const validNote = { ...note, id: validId };
          await firebaseStore.saveNoteToFirebase(
            authStore.user!.uid,
            validNote
          );
        }
      } else {
        this.notes = [...this.notes, ...notes];
        this.saveNotes();
      }
    },

    async getNotesToBackup(): Promise<Note[]> {
      if (authStore.isLoggedIn) {
        const firebaseNotes = await firebaseStore.getAllNotesFromFirebase(
          authStore.user!.uid
        );
        return Object.values(firebaseNotes);
      } else {
        return this.notes;
      }
    },

    createAndDownloadBackupFile(notes: Note[]) {
      const blob = new Blob([JSON.stringify(notes, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'textVerse_backup.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      uiStore.showToastMessage('Backup downloaded successfully!');
    },

    async clearAllNotes() {
      if (authStore.isLoggedIn) {
        const notesRef = ref(db, `users/${authStore.user!.uid}/notes`);
        const folderRef = ref(db, `users/${authStore.user!.uid}/folders`);
        await remove(notesRef);
        await remove(folderRef);
      } else {
        localStorage.removeItem('notes');
        localStorage.removeItem('folders');
        this.deletedNotes.push(...this.notes);
      }
      this.notes = [];
      this.saveNotes();
    },

    resetFolders() {
      folderStore.folders = [
        DEFAULT_FOLDERS.ALL_NOTES,
        DEFAULT_FOLDERS.UNCATEGORIZED,
      ];
      folderStore.currentFolder = DEFAULT_FOLDERS.ALL_NOTES;
      folderStore.saveFolders();
    },

    async loadNotesFromFirebase() {
      const userId = authStore.user!.uid;
      const notesRef = ref(db, `users/${userId}/notes`);

      this.notesListener = onValue(notesRef, (snapshot) => {
        const notesData = snapshot.val();
        if (notesData) {
          this.notes = Object.values(notesData as Record<string, Note>);
        } else {
          this.notes = [];
        }
        this.reorderNotes();
      });
    },

    async loadNotesFromLocalStorage() {
      const savedNotes = localStorage.getItem('notes');
      if (savedNotes) {
        this.notes = JSON.parse(savedNotes);
      } else {
        await this.loadInitialNotes();
      }
    },

    async loadInitialNotes() {
      const importedNotes = initialNotes.map((note) => ({
        ...note,
        id: nanoid(),
        time_created: note.time_created,
        last_edited: note.time_created,
        pinned: false,
        folder: note.folder || DEFAULT_FOLDERS.UNCATEGORIZED,
      }));

      await this.importFolders(importedNotes);
      this.notes = importedNotes;
      this.saveNotes();
    },

    async performNoteSync(userId: string) {
      const startTime = Date.now();
      const [firebaseNotes] = await Promise.all([
        firebaseStore.getAllNotesFromFirebase(userId),
        new Promise((resolve) => setTimeout(resolve, 800)),
      ]);

      this.notes = Object.values(firebaseNotes);
      this.reorderNotes();
      this.saveNotes();

      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < 800) {
        await new Promise((resolve) => setTimeout(resolve, 800 - elapsedTime));
      }
    },

    compareNotes(a: Note, b: Note): number {
      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1;
      }
      const dateA = new Date(a.last_edited || a.time_created).getTime();
      const dateB = new Date(b.last_edited || b.time_created).getTime();
      return dateB - dateA;
    },

    saveNotes() {
      if (!authStore.isLoggedIn) {
        localStorage.setItem('notes', JSON.stringify(this.notes));
      }
    },

    saveDeletedNotes() {
      if (!authStore.isLoggedIn) {
        localStorage.setItem('deletedNotes', JSON.stringify(this.deletedNotes));
      }
    },

    hasChanged(originalNote: Note, editedNote: Partial<Note>): boolean {
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
    },

    localeDate(dateString: string | Date): string {
      const date =
        typeof dateString === 'string' ? new Date(dateString) : dateString;
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    },

    addSelectedNote(noteId: string) {
      if (!this.selectedNotes.includes(noteId)) {
        this.selectedNotes.push(noteId);
      }
    },

    removeSelectedNote(noteId: string) {
      const index = this.selectedNotes.indexOf(noteId);
      if (index !== -1) {
        this.selectedNotes.splice(index, 1);
      }
    },

    clearSelectedNotes() {
      this.selectedNotes = [];
    },

    selectAllNotes() {
      this.selectedNotes = this.notes.map((note) => note.id);
    },

    async pinSelectedNotes() {
      for (const noteId of this.selectedNotes) {
        await this.pinNote(noteId);
      }
    },

    async unpinSelectedNotes() {
      for (const noteId of this.selectedNotes) {
        await this.unpinNote(noteId);
      }
    },

    async togglePinSelectedNotes() {
      const allPinned = this.selectedNotes.every((noteId) => {
        const note = this.notes.find((n) => n.id === noteId);
        return note && note.pinned;
      });

      if (allPinned) {
        await this.unpinSelectedNotes();
      } else {
        await this.pinSelectedNotes();
      }
    },

    async deleteSelectedNotes(isTrashRoute: boolean) {
      if (isTrashRoute) {
        for (const noteId of this.selectedNotes) {
          await this.permanentlyDeleteNote(noteId);
        }
        uiStore.showToastMessage('Selected notes permanently deleted');
      } else {
        for (const noteId of this.selectedNotes) {
          await this.deleteNote(noteId);
        }
        uiStore.showToastMessage('Selected notes moved to trash');
      }
      this.clearSelectedNotes();
    },

    async emptyTrash() {
      if (authStore.isLoggedIn) {
        await firebaseStore.emptyTrashInFirebase(authStore.user!.uid);
      }
      this.deletedNotes = [];
      this.saveDeletedNotes();
      uiStore.showToastMessage('Trash emptied successfully');
    },

    async loadDeletedNotes() {
      if (authStore.isLoggedIn) {
        const deletedNotes = await firebaseStore.getDeletedNotesFromFirebase(
          authStore.user!.uid
        );
        this.deletedNotes = Object.values(deletedNotes);
      } else {
        const savedDeletedNotes = localStorage.getItem('deletedNotes');
        if (savedDeletedNotes) {
          this.deletedNotes = JSON.parse(savedDeletedNotes);
        }
      }
    },

    async fetchPublicNotes() {
      const publicNotesRef = ref(db, `publicNotes`);
      const snapshot = await get(publicNotesRef);
      if (snapshot.exists()) {
        const publicNotes = snapshot.val() as Record<string, PublicNote>;
        Object.values(publicNotes).forEach((publicNote) => {
          this.publicNotes.set(publicNote.id, publicNote.publicId);
        });
      }
    },
  },
});
