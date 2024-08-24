// stores/uiStore.ts

import { defineStore } from 'pinia';
import { authStore, notesStore } from './stores';
import { ref, set, onValue, off } from 'firebase/database';
import { db } from '@/firebase';

type Theme = 'light' | 'dark' | 'system';
type ViewType = 'card' | 'table' | 'mail' | 'folder';
type NoteOpenPreference = 'modal' | 'sidebar';
type FolderViewType = 'grid' | 'list';

interface UIState {
  theme: Theme;
  viewType: ViewType;
  noteOpenPreference: NoteOpenPreference;
  columns: number;
  folderViewType: FolderViewType;
  blurEnabled: boolean;
  isExpanded: boolean;
  activeDropdown: string | null;
  showToast: boolean;
  toastMessage: string;
  toastTimeoutId: number | null;
  isNoteModalOpen: boolean;
  isNoteSidebarOpen: boolean;
  isEditing: boolean;
  isCreatingNote: boolean;
  settingsListener: (() => void) | null;
}

export const useUIStore = defineStore('ui', {
  state: (): UIState => ({
    theme: 'system',
    viewType: 'card',
    noteOpenPreference: 'modal',
    columns: 4,
    folderViewType: 'grid',
    blurEnabled: false,
    isExpanded: false,
    activeDropdown: null,
    showToast: false,
    toastMessage: '',
    toastTimeoutId: null,
    isNoteModalOpen: false,
    isNoteSidebarOpen: false,
    isEditing: false,
    isCreatingNote: false,
    settingsListener: null,
  }),

  actions: {
    async initializeSettings() {
      if (authStore.isLoggedIn) {
        await this.loadSettings();
      } else {
        this.loadLocalSettings();
      }

      this.applyTheme();
    },

    loadLocalSettings() {
      this.theme = JSON.parse(localStorage.getItem('theme') || '"system"') as Theme;
      this.viewType = JSON.parse(localStorage.getItem('viewType') || '"card"') as ViewType;
      this.noteOpenPreference = JSON.parse(localStorage.getItem('noteOpenPreference') || '"modal"') as NoteOpenPreference;
      this.columns = this.getValidColumns(JSON.parse(localStorage.getItem('columns') || '4'));
      this.blurEnabled = JSON.parse(localStorage.getItem('blurEnabled') || 'false');
      
      // Save these initial settings to localStorage
      this.saveSettings();
    },

    async setupFirebaseListener() {
      const settingsRef = ref(db, `users/${authStore.user!.uid}/settings`);
      this.settingsListener = onValue(settingsRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          this.updateSettings(data);
        }
      });
    },

    updateSettings(settings: Partial<UIState>) {
      Object.assign(this, settings);
      this.saveSettings();
    },

    async saveSettings() {
      const settings = {
        theme: this.theme,
        viewType: this.viewType,
        noteOpenPreference: this.noteOpenPreference,
        blurEnabled: this.blurEnabled,
        columns: this.columns,
      };
    
      if (authStore.isLoggedIn) {
        try {
          await set(ref(db, `users/${authStore.user!.uid}/settings`), settings);
        } catch (error) {
          console.error('Error saving settings to Firebase:', error);
        }
      }
    
      // Always save to localStorage
      Object.entries(settings).forEach(([key, value]) => {
        localStorage.setItem(key, JSON.stringify(value));
      });
    },

    clearSettingsListener() {
      if (this.settingsListener) {
        off(ref(db, `users/${authStore.user!.uid}/settings`));
        this.settingsListener = null;
      }
    },

    setTheme(theme: Theme) {
      this.theme = theme;
      this.saveSettings();
      this.applyTheme();
    },

    setViewType(viewType: ViewType) {
      this.viewType = viewType;
      this.saveSettings();
    },

    setNoteOpenPreference(preference: NoteOpenPreference) {
      this.noteOpenPreference = preference;
      this.saveSettings();
    },

    setColumns(columns: number) {
      this.columns = this.getValidColumns(columns);
      this.saveSettings();
    },

    getValidColumns(columns: number): number {
      const isMobile = window.innerWidth < 640;
      if (isMobile) {
        return Math.min(columns, 2);
      }
      return columns || 4;
    },

    setFolderViewType(viewType: FolderViewType) {
      this.folderViewType = viewType;
    },

    toggleExpand() {
      this.isExpanded = !this.isExpanded;
    },

    applyTheme() {
      const isDark =
        this.theme === 'dark' ||
        (this.theme === 'system' &&
          window.matchMedia('(prefers-color-scheme: dark)').matches);

      document.documentElement.classList.toggle('dark', isDark);
      this.updateThemeColor(isDark);
      this.updateFavicon(isDark);
    },

    updateThemeColor(isDark: boolean) {
      const color = isDark ? '#424242' : '#f7f4e4';
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', color);
    },

    updateFavicon(isDark: boolean) {
      const faviconPath = isDark ? '/dark/favicon.ico' : '/light/favicon.ico';
      document
        .querySelector('link[rel="icon"]')
        ?.setAttribute('href', faviconPath);
    },

    setBlurEnabled(enabled: boolean) {
      this.blurEnabled = enabled;
      this.showToastMessage(
        enabled ? 'Blur effect enabled' : 'Blur effect disabled'
      );
      this.saveSettings();
    },

    setActiveDropdown(dropdown: string | null) {
      this.activeDropdown = dropdown;
    },

    showToastMessage(message: string) {
      this.showToast = true;
      this.toastMessage = message;
      if (this.toastTimeoutId !== null) {
        clearTimeout(this.toastTimeoutId);
      }
      this.toastTimeoutId = window.setTimeout(() => {
        this.showToast = false;
        this.toastMessage = '';
        this.toastTimeoutId = null;
      }, 3000);
    },

    openNote(noteId: string | null) {
      notesStore.selectedNoteId = noteId;
      if (this.noteOpenPreference === 'modal') {
        this.isNoteModalOpen = true;
      } else {
        this.isNoteSidebarOpen = true;
      }
      document.body.classList.add('modal-open');
    },

    closeNote() {
      this.isNoteModalOpen = false;
      this.isNoteSidebarOpen = false;
      document.body.classList.remove('modal-open');
    },

    async loadSettings() {
      if (authStore.isLoggedIn) {
        const settingsRef = ref(db, `users/${authStore.user!.uid}/settings`);
        this.settingsListener = onValue(settingsRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            this.updateSettings(data);
          } else {
            this.loadUISettings();
          }
        });
      } else {
        this.loadUISettings();
      }
    },

    loadUISettings() {
      this.theme = (localStorage.getItem('theme') as Theme) || 'system';
      this.viewType = (localStorage.getItem('viewType') as ViewType) || 'card';
      this.noteOpenPreference =
        (localStorage.getItem('noteOpenPreference') as NoteOpenPreference) ||
        'modal';
      const storedColumns = parseInt(localStorage.getItem('columns') || '', 10);
      this.columns = this.getValidColumns(storedColumns);
      this.blurEnabled = JSON.parse(
        localStorage.getItem('blurEnabled') || 'false'
      );
      this.applyTheme();
    },

    clearLocalSettings() {
      [
        'theme',
        'viewType',
        'noteOpenPreference',
        'columns',
        'blurEnabled',
      ].forEach((key) => {
        localStorage.removeItem(key);
      });
      this.loadLocalSettings();
      this.applyTheme();
    },

    handleResize() {
      const newColumns = this.getValidColumns(this.columns);
      if (newColumns !== this.columns) {
        this.setColumns(newColumns);
      }
    },
  },
});
