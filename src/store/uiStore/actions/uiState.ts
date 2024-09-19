import { UIState } from '@/utils/types';

export const toggleExpand = (state: UIState) => {
  state.isExpanded = !state.isExpanded;
};

export const setActiveDropdown = (state: UIState, dropdown: string | null) => {
  state.activeDropdown = dropdown;
};

export const showToastMessage = (state: UIState, message: string) => {
  state.showToast = true;
  state.toastMessage = message;
  if (state.toastTimeout !== null) {
    clearTimeout(state.toastTimeout);
  }
  state.toastTimeout = window.setTimeout(() => {
    state.showToast = false;
    state.toastMessage = '';
    state.toastTimeout = null;
  }, 3000);
};

export const setSyncing = (state: UIState, value: boolean) => {
  state.isSyncing = value;
};

export const toggleSelectMode = (state: UIState) => {
  state.isSelectMode = !state.isSelectMode;
};
