import { authStore } from '@/utils/stores';
import { UIState } from '@/utils/types';
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
