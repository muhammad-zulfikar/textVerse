import {
  UIState,
  Theme,
  ViewType,
  NoteViewType,
  SortType,
} from '@/utils/types';
import { applyTheme, getValidColumns } from '.';
import { authStore } from '@/utils/stores';
import { ref, set, onValue, off, get } from 'firebase/database';
import { db } from '@/firebase';

export const loadLocalSettings = (state: UIState) => {
  state.theme = JSON.parse(
    localStorage.getItem('theme') || '"system"'
  ) as Theme;
  state.viewType = JSON.parse(
    localStorage.getItem('viewType') || '"card"'
  ) as ViewType;
  state.noteViewType = JSON.parse(
    localStorage.getItem('noteViewType') || '"modal"'
  ) as NoteViewType;
  state.sortType = JSON.parse(
    localStorage.getItem('sortType') || '"date"'
  ) as SortType;
  state.columns = getValidColumns(
    state,
    JSON.parse(localStorage.getItem('columns') || '4')
  );
};

export const loadFirebaseSettings = async (state: UIState) => {
  if (!authStore.isLoggedIn) return;

  const settingsRef = ref(db, `users/${authStore.user!.uid}/settings`);
  const snapshot = await get(settingsRef);
  if (snapshot.exists()) {
    const data = snapshot.val();
    updateSettings(state, data, false);
  } else {
    loadLocalSettings(state);
    saveSettings(state);
  }
};

export const setupFirebaseListener = (state: UIState) => {
  if (!authStore.isLoggedIn) return;

  const settingsRef = ref(db, `users/${authStore.user!.uid}/settings`);
  state.settingsListener = onValue(settingsRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      updateSettings(state, data, false);
    }
  });
};

export const updateSettings = (
  state: UIState,
  settings: Partial<UIState>,
  saveToFirebase: boolean = true
) => {
  Object.assign(state, settings);
  if (saveToFirebase && authStore.isLoggedIn) {
    saveSettings(state);
  }
  applyTheme(state);
};

export const saveSettings = async (state: UIState) => {
  const settings = {
    theme: state.theme,
    viewType: state.viewType,
    noteViewType: state.noteViewType,
    sortType: state.sortType,
  };

  if (authStore.isLoggedIn) {
    try {
      await set(ref(db, `users/${authStore.user!.uid}/settings`), settings);
    } catch (error) {
      console.error('Error saving settings to Firebase:', error);
    }
  }

  Object.entries({ ...settings, columns: state.columns }).forEach(
    ([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value));
    }
  );
};

export const clearSettingsListener = (state: UIState) => {
  if (state.settingsListener) {
    off(ref(db, `users/${authStore.user!.uid}/settings`));
    state.settingsListener();
    state.settingsListener = null;
  }
};

export const clearLocalSettings = (state: UIState) => {
  ['theme', 'viewType', 'sortType', 'noteViewType', 'columns'].forEach(
    (key) => {
      localStorage.removeItem(key);
    }
  );
  loadLocalSettings(state);
  applyTheme(state);
};
