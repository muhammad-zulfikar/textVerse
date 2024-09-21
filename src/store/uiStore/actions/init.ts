import { authStore } from '@/store';
import { UIState } from '../state';
import {
  loadFirebaseSettings,
  setupFirebaseListener,
  loadLocalSettings,
  applyTheme,
} from '.';

export const initializeUI = async (state: UIState) => {
  if (authStore.isLoggedIn) {
    await loadFirebaseSettings(state);
    setupFirebaseListener(state);
  } else {
    loadLocalSettings(state);
  }
  applyTheme(state);
};
